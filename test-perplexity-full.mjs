
import fs from 'fs';

const apiKey = process.env.PERPLEXITY_API_KEY;
const model = "sonar";

const topic = "Invertir en criptoactivos en 2024 para principiantes";
const audience = "Españoles de 30-45 años interesados en finanzas personales";

const systemPrompt = `You are a strategic market research API for high-ticket businesses. Your goal is to help users decide if a content idea is worth the investment.
    
Output ONLY a valid JSON object. Do not include markdown, code blocks, or explanations.

Topic: "${topic}"
Target Audience: "${audience}"

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

async function test() {
    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: "system",
                        content: "You are a market research API. You MUST respond with valid JSON only. No explanations, no markdown, just pure JSON."
                    },
                    { role: "user", content: systemPrompt }
                ],
                temperature: 0.2,
                max_tokens: 2000,
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Error:", response.status, text);
        } else {
            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            fs.writeFileSync('raw_perplexity_response.txt', content);
            console.log("Saved raw response to raw_perplexity_response.txt");

            let cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
            if (!cleanContent.startsWith("{")) {
                const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanContent = jsonMatch[0];
                }
            }

            try {
                const parsed = JSON.parse(cleanContent);
                console.log("Successfully parsed JSON");
            } catch (e) {
                console.error("FAILED TO PARSE JSON:", e.message);
                const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || "0");
                if (pos > 0) {
                    console.error("Error near:", cleanContent.substring(Math.max(0, pos - 50), pos + 50));
                    console.error("Char at pos:", cleanContent[pos], "Code:", cleanContent.charCodeAt(pos));
                }
            }
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
