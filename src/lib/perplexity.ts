export interface PerplexityResponse {
    demand_score: number;
    demand_interpretation: string; // e.g., "Demanda sólida en nicho emergente"
    demand_summary: string;
    strategic_recommendation: {
        verdict: "create" | "pilot" | "reconsider";
        reasoning: string[];
        target_fit: string;
        success_conditions: string;
    };
    data_signals: {
        conversations_analyzed: number;
        recency: string;
        engagement_type: string;
    };
    business_impact: {
        primary_objective: "leads" | "authority" | "sales";
        monetization_potential: string;
        commercial_risks: string;
    };
    pain_points: string[];
    questions: string[];
    content_angles: {
        format: string;
        hook: string;
        complexity: "básico" | "avanzado";
        description: string;
    }[];
    not_recommended_if: string[];
    confidence_score: number;
}

// Helper to validate that all required fields exist in the AI response
function isValidPerplexityResponse(obj: any): obj is PerplexityResponse {
    if (!obj || typeof obj !== 'object') return false;

    const requiredKeys: (keyof PerplexityResponse)[] = [
        "demand_score",
        "demand_interpretation",
        "demand_summary",
        "strategic_recommendation",
        "data_signals",
        "business_impact",
        "pain_points",
        "questions",
        "content_angles",
        "not_recommended_if",
        "confidence_score"
    ];

    for (const key of requiredKeys) {
        if (obj[key] === undefined || obj[key] === null) {
            console.warn(`[perplexity] Missing required field: ${key}`);
            return false;
        }
    }

    // Deeper check for nested required objects
    if (!obj.strategic_recommendation.verdict || !Array.isArray(obj.strategic_recommendation.reasoning)) return false;
    if (!obj.data_signals.engagement_type) return false;
    if (!obj.business_impact.primary_objective || !obj.business_impact.monetization_potential) return false;
    if (!Array.isArray(obj.content_angles) || obj.content_angles.length === 0) return false;

    return true;
}

export async function validateIdea(topic: string, audience?: string): Promise<PerplexityResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not set");
    }

    const systemPrompt = `Eres un experto analista de investigación de mercado. 
Valida la siguiente idea de contenido para un negocio high-ticket.
RESPONDE SIEMPRE EN ESPAÑOL.

Estructura JSON requerida (asegúrate de incluir TODOS los campos):
{
  "demand_score": <number 0-100>,
  "demand_interpretation": "<string>",
  "demand_summary": "<string>",
  "strategic_recommendation": {
    "verdict": "create" | "pilot" | "reconsider",
    "reasoning": ["<string>", "<string>", "<string>"],
    "target_fit": "<string>",
    "success_conditions": "<string>"
  },
  "data_signals": {
    "conversations_analyzed": <number>,
    "recency": "<string>",
    "engagement_type": "<string>"
  },
  "business_impact": {
    "primary_objective": "leads" | "authority" | "sales",
    "monetization_potential": "<string>",
    "commercial_risks": "<string>"
  },
  "pain_points": ["<string>", "<string>", "<string>", "<string>", "<string>"],
  "questions": ["<string>", "<string>", "<string>"],
  "content_angles": [
    {
      "format": "<string>",
      "hook": "<string>",
      "complexity": "básico" | "avanzado",
      "description": "<string>"
    }
  ],
  "not_recommended_if": ["<string>", "<string>"],
  "confidence_score": <number 0-100>
}

REGLAS:
- Sin comillas dobles dentro de los textos (usa comillas simples).
- Sin markdown, sin bloques de código, sin citas.
- Idioma: Español.

Topic: "${topic}"
${audience ? `Target Audience: "${audience}"` : ""}
`;

    // Retry mechanism
    let lastError: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const response = await fetch("https://api.perplexity.ai/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "sonar",
                    messages: [
                        {
                            role: "system",
                            content: "Eres un API que solo responde en JSON puro. Sin descripciones, sin markdown, sin citas. Idioma: Español."
                        },
                        { role: "user", content: systemPrompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 4000,
                })
            });


            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) throw new Error("No content returned from Perplexity");

            console.log(`[perplexity] Raw content (attempt ${attempt}):`, content.substring(0, 200) + "...");

            // --- STEP-BY-STEP SANITATION ---
            let rawContent = content.trim();

            // 1. Initial cleanup: remove blocks and citations
            rawContent = rawContent.replace(/```json\n?|\n?```/g, "");
            rawContent = rawContent.replace(/\[\d+\]/g, "");

            // 2. Extract JSON part
            const start = rawContent.indexOf("{");
            const end = rawContent.lastIndexOf("}");
            if (start === -1) throw new Error("No JSON found in response");
            let jsonString = rawContent.substring(start, (end !== -1 ? end + 1 : undefined));

            // Protection against double braces or leading garbage that looks like a brace
            jsonString = jsonString.trim();
            while (jsonString.startsWith("{{") && jsonString.endsWith("}}")) {
                jsonString = jsonString.substring(1, jsonString.length - 1).trim();
            }

            // 3. Fix forbidden control characters (except whitespace: \n, \r, \t)
            // JSON.parse allows \n, \r, \t as whitespace, but forbidden characters 0-31 must be handled.
            // We'll remove non-printable characters except whitespace.
            jsonString = jsonString.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

            // 4. Attempt parse and strict validation
            let parsed;
            try {
                parsed = JSON.parse(jsonString);
            } catch (pErr: any) {
                console.warn(`[perplexity] JSON parse failed. Error detail: ${pErr.message}`);

                // Mild Repair if parse fails
                let mildRepair = jsonString.trim();
                mildRepair = mildRepair.replace(/,\s*([\}\]])/g, "$1");

                let braces = 0;
                let inQ = false;
                for (let i = 0; i < mildRepair.length; i++) {
                    const c = mildRepair[i];
                    if (c === '"' && (i === 0 || mildRepair[i - 1] !== '\\')) inQ = !inQ;
                    if (!inQ) {
                        if (c === "{") braces++;
                        if (c === "}") braces--;
                    }
                }
                if (inQ) mildRepair += '"';
                if (braces > 0) mildRepair += "}".repeat(braces);

                try {
                    parsed = JSON.parse(mildRepair);
                } catch (rErr: any) {
                    console.error(`[perplexity] Mild repair also failed. Final string snippet: ${mildRepair.substring(0, 50)}`);
                    throw pErr; // Throw original error
                }
            }

            if (isValidPerplexityResponse(parsed)) {
                console.log("[perplexity] Validation successful");
                return parsed;
            } else {
                throw new Error("JSON structure is incomplete or invalid");
            }

        } catch (error: any) {
            lastError = error;
            console.error(`[perplexity] Attempt ${attempt} failed:`, error.message);
            if (attempt === 2) throw error;
            await new Promise(resolve => setTimeout(resolve, 800)); // Slightly longer wait
        }
    }
    throw lastError;
}
