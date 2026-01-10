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

    const systemPrompt = `You are a strategic market research API for high-ticket businesses. Your goal is to help users decide if a content idea is worth the investment.
    
Output ONLY a valid JSON object. Do not include markdown, code blocks, or explanations.

Topic: "${topic}"
${audience ? `Target Audience: "${audience}"` : ""}

Required JSON Structure:
{
  "demand_score": <number 0-100>,
  "demand_interpretation": "<short semantic category: e.g. 'Demanda sólida en nicho emergente'>",
  "demand_summary": "<2-sentence overview of market state>",
  "strategic_recommendation": {
    "verdict": "create" (green) | "pilot" (yellow) | "reconsider" (red),
    "reasoning": ["<reason 1>", "<reason 2>"],
    "target_fit": "<who this is specifically for>",
    "success_conditions": "<specific conditions for success>"
  },
  "data_signals": {
    "conversations_analyzed": <number of relevant threads/discussions found>,
    "recency": "<freshness of data, e.g. 'frecuente últimos 60 días'>",
    "engagement_type": "<primary type: e.g. preguntas, quejas, debates>"
  },
  "business_impact": {
    "primary_objective": "leads" | "authority" | "sales",
    "monetization_potential": "<potential via newsletter, upsell, service, etc.>",
    "commercial_risks": "<risks like small niche, high legal compliance, etc.>"
  },
  "pain_points": ["<pain 1>", "<pain 2>", "<pain 3>"],
  "questions": ["<question 1>", "<question 2>", "<question 3>"],
  "content_angles": [
    {
      "format": "<recommended format: e.g. newsletter, guide, technical post>",
      "hook": "<main hook/headline idea>",
      "complexity": "básico" | "avanzado",
      "description": "<actionable description focused on reduction of risk>"
    }
  ],
  "not_recommended_if": ["<condition 1>", "<condition 2>"],
  "confidence_score": <number 0-100>
}

Rules:
- Be analytical and serious. Avoid hype words like "viral" or "magical".
- Focus on "reduction of risk" and "informed decisions".
- Response must start with { and end with }. No other text.`;


    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "sonar",  // Changed from sonar-reasoning-pro
                messages: [
                    {
                        role: "system",
                        content: "You are a market research API. You MUST respond with valid JSON only. No explanations, no markdown, just pure JSON."
                    },
                    { role: "user", content: systemPrompt }
                ],
                temperature: 0.2,  // Lower temperature for more consistent output
                max_tokens: 2000,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[perplexity] API Error:", response.status, errorText);
            throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            console.error("[perplexity] No content in response");
            throw new Error("No content returned from Perplexity");
        }

        // cleanup markdown code blocks if present
        let cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

        // If response doesn't start with {, try to extract JSON
        if (!cleanContent.startsWith("{")) {
            console.warn("[perplexity] Response doesn't start with JSON, attempting to extract");
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanContent = jsonMatch[0];
            } else {
                console.error("[perplexity] Could not extract JSON from response:", cleanContent);
                throw new Error("Perplexity returned non-JSON response. Please try again.");
            }
        }

        const parsed = JSON.parse(cleanContent);
        return parsed;

    } catch (error: any) {
        console.error("[perplexity] Validation failed:", error);
        console.error("[perplexity] Error message:", error?.message);
        throw error;
    }
}
