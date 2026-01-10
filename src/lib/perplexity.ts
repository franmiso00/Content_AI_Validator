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

    const systemPrompt = `
You are an expert market researcher and content strategist. Your goal is to validate content ideas by analyzing real-world demand signals from Reddit, forums, and social discussions.

You must output a STRICT JSON object answering the following about the topic:
1. demand_score: A number 0-100 indicating how actively this is discussed.
2. demand_summary: A 2-sentence summary of the current conversation/sentiment.
3. pain_points: Array of 3 specific problems/frustrations users express.
4. questions: Array of 3 common questions users are asking.
5. content_angles: Array of 3 unique, high-value content angles to address this.
6. confidence_score: A number 0-100 indicating the quality of data found (not virality).

Input Topic: "${topic}"
${audience ? `Target Audience: "${audience}"` : ""}

Use current data. Do not hallucinate. If no data is found, set scores to 0.
`;

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "sonar-reasoning-pro",
                messages: [
                    { role: "system", content: "You are a helpful JSON-only API." },
                    { role: "user", content: systemPrompt }
                ],
                // Force JSON output if possible via prompt, but Perplexity is chat-based.
                // We rely on the model following instructions.
            })
        });

        if (!response.ok) {
            console.error("Perplexity API Error:", await response.text());
            throw new Error("Failed to fetch from Perplexity");
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        // cleanup markdown code blocks if present
        const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

        return JSON.parse(cleanContent);

    } catch (error) {
        console.error("Validation failed:", error);
        // Return a fallback or rethrow
        throw error;
    }
}
