export interface PerplexityResponse {
    demand_score: number;
    demand_summary: string;
    pain_points: string[];
    questions: string[];
    content_angles: string[];
    confidence_score: number;
}

export async function validateIdea(topic: string, audience?: string): Promise<PerplexityResponse> {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not set");
    }

    const systemPrompt = `You are a market research API that ONLY outputs valid JSON. Do not include any explanatory text, markdown formatting, or conversational responses.

Analyze the following content idea by searching Reddit and online discussions:

Topic: "${topic}"
${audience ? `Target Audience: "${audience}"` : ""}

Output ONLY this JSON structure (no other text):
{
  "demand_score": <number 0-100>,
  "demand_summary": "<2-sentence summary of current discussions>",
  "pain_points": ["<pain 1>", "<pain 2>", "<pain 3>"],
  "questions": ["<question 1>", "<question 2>", "<question 3>"],
  "content_angles": ["<angle 1>", "<angle 2>", "<angle 3>"],
  "confidence_score": <number 0-100>
}

Rules:
- Output ONLY valid JSON, nothing else
- If no data found, use empty arrays and score 0
- Do not add explanations or markdown
- Start your response with { and end with }`;


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
