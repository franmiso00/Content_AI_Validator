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

export async function validateIdea(topic: string, audience?: string): Promise<PerplexityResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not set");
    }

    const systemPrompt = `You are a strategic market research API. Your goal is to provide a validation for a content idea.
    
Output ONLY a valid JSON object. 
IMPORTANT RULES:
1. Do not use double quotes (") inside your string values. Use single quotes (') or nothing if you need emphasis.
2. Do not use markdown, code blocks, or citations.
3. Response must start with { and end with }.

Topic: "${topic}"
${audience ? `Target Audience: "${audience}"` : ""}

Required structure:
{
  "demand_score": <number>,
  "demand_interpretation": "<string>",
  "demand_summary": "<string>",
  "strategic_recommendation": {
    "verdict": "create" | "pilot" | "reconsider",
    "reasoning": ["<string>"],
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
  "pain_points": ["<string>"],
  "questions": ["<string>"],
  "content_angles": [
    {
      "format": "<string>",
      "hook": "<string>",
      "complexity": "básico" | "avanzado",
      "description": "<string>"
    }
  ],
  "not_recommended_if": ["<string>"],
  "confidence_score": <number>
}`;

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
                            content: "Professional Market Research API. Output pure JSON only. No markdown, no citations."
                        },
                        { role: "user", content: systemPrompt }
                    ],
                    temperature: 0.1,
                    max_tokens: 4000, // Reduced to 4k for faster response and less chance of truncation
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) throw new Error("No content returned from Perplexity");

            // --- STEP-BY-STEP SANITATION ---
            let rawContent = content.trim();

            // 1. Initial cleanup: remove blocks and citations
            rawContent = rawContent.replace(/```json\n?|\n?```/g, "");
            rawContent = rawContent.replace(/\[\d+\]/g, "");

            // 2. Extract JSON part
            const start = rawContent.indexOf("{");
            const end = rawContent.lastIndexOf("}");
            if (start === -1) throw new Error("No JSON found");
            let jsonString = rawContent.substring(start, (end !== -1 ? end + 1 : undefined));

            // 3. Fix control characters inside values
            jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, (m: string) => {
                if (m === "\n") return "\\n";
                if (m === "\r") return "\\r";
                if (m === "\t") return "\\t";
                return "";
            });

            // 4. Attempt direct parse
            try {
                const parsed = JSON.parse(jsonString);
                if (!parsed.demand_score) throw new Error("Incomplete JSON structure");
                return parsed;
            } catch (firstParseError: any) {
                console.warn("[perplexity] Primary parse failed. Attempting mild repair...", firstParseError.message);

                // Mild Repair: Fix common trailing commas and balanced braces
                let mildRepair = jsonString.trim();
                mildRepair = mildRepair.replace(/,\s*([\}\]])/g, "$1");

                // Add missing closures if truncated
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
                    const finalParsed = JSON.parse(mildRepair);
                    if (!finalParsed.demand_score) throw new Error("Repaired JSON missing fields");
                    return finalParsed;
                } catch (secondErr: any) {
                    console.error("[perplexity] Mild repair failed. Retrying call if possible.");
                    throw firstParseError;
                }
            }
        } catch (error: any) {
            lastError = error;
            console.error(`[perplexity] Attempt ${attempt} failed:`, error.message);
            if (attempt === 2) throw error;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    throw lastError;
}

