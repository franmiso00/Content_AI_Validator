
import fs from 'fs';

const apiKey = process.env.PERPLEXITY_API_KEY;
const model = "sonar";

const topics = [
    "Invertir en criptoactivos en 2024 para principiantes",
    "Mejores herramientas de IA para productividad in 2025",
    "Cómo escalar una agencia de marketing digital con automatización",
    "Estrategias de contenido para TikTok en el mercado B2B",
    "El futuro del trabajo remoto y la cultura organizacional"
];

const systemPromptBase = `You are a strategic market research API. Your goal is to provide a validation for a content idea.
    
Output ONLY a valid JSON object. 
IMPORTANT RULES:
1. Do not use double quotes (") inside your string values. Use single quotes (') or nothing if you need emphasis.
2. Do not use markdown, code blocks, or citations.
3. Response must start with { and end with }.

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

async function runTest(topic, i) {
    console.log(`Running final verification test ${i + 1} for topic: ${topic}`);
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
                        content: "Professional Market Research API. Output pure JSON only. No markdown, no citations."
                    },
                    { role: "user", content: `${systemPromptBase}\n\nTopic: "${topic}"` }
                ],
                temperature: 0.1,
                max_tokens: 4000,
            })
        });

        if (!response.ok) {
            console.error(`Test ${i + 1} failed with status ${response.status}`);
            return false;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        // Use exactly the same logic as in route/perplexity.ts
        let rawContent = content.trim();
        rawContent = rawContent.replace(/```json\n?|\n?```/g, "");
        rawContent = rawContent.replace(/\[\d+\]/g, "");
        const start = rawContent.indexOf("{");
        const end = rawContent.lastIndexOf("}");
        if (start === -1) throw new Error("No JSON found");
        let jsonString = rawContent.substring(start, (end !== -1 ? end + 1 : undefined));

        jsonString = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

        try {
            JSON.parse(jsonString);
            console.log(`Test ${i + 1} SUCCESS (direct parse)`);
            return true;
        } catch (firstErr) {
            console.warn(`Test ${i + 1} direct parse failed, trying repair...`, firstErr.message);

            const structuralPlaceholders = [];
            let repairedContent = jsonString.replace(/("\s*:\s*|,\s*"|"\s*,|\{\s*"|"\s*\}|\[\s*"|"\s*\]|:\s*"|:\s*\[|:\s*\{)/g, (match) => {
                structuralPlaceholders.push(match);
                return `__P__${structuralPlaceholders.length - 1}__`;
            });
            repairedContent = repairedContent.replace(/"/g, '\\"');
            structuralPlaceholders.forEach((p, i) => {
                repairedContent = repairedContent.replace(`__P__${i}__`, p);
            });
            repairedContent = repairedContent.replace(/,\s*([\}\]])/g, "$1");

            try {
                JSON.parse(repairedContent);
                console.log(`Test ${i + 1} SUCCESS (after repair)`);
                return true;
            } catch (secondErr) {
                console.error(`Test ${i + 1} FAILED after repair at pos:`, secondErr.message);
                fs.writeFileSync(`failed_final_${i + 1}.txt`, content);
                return false;
            }
        }
    } catch (e) {
        console.error(`Test ${i + 1} Exception:`, i, e.message);
        return false;
    }
}

async function start() {
    let allPassed = true;
    for (let i = 0; i < topics.length; i++) {
        const passed = await runTest(topics[i], i);
        if (!passed) allPassed = false;
    }
    console.log(allPassed ? "ALL FINAL VERIFICATION TESTS PASSED" : "SOME FINAL VERIFICATION TESTS FAILED");
}

start();
