
import fs from 'fs';

const apiKey = process.env.PERPLEXITY_API_KEY;
const model = "sonar-reasoning-pro";

const topics = [
    "Invertir en criptoactivos en 2024 para principiantes",
    "Mejores herramientas de IA para productividad en 2025",
    "Cómo escalar una agencia de marketing digital con automatización",
    "Estrategias de contenido para TikTok en el mercado B2B",
    "El futuro del trabajo remoto y la cultura organizacional"
];

const systemPromptBase = `You are a strategic market research API for high-ticket businesses. Your goal is to help users decide if a content idea is worth the investment.
    
Output ONLY a valid JSON object. Do not include markdown, code blocks, citations (like [1][2]), or explanations.

Required JSON Structure:
{
  "demand_score": <number 0-100>,
  "demand_interpretation": "<short semantic category>",
  "demand_summary": "<2-sentence overview>",
  "strategic_recommendation": {
    "verdict": "create" | "pilot" | "reconsider",
    "reasoning": ["<reason 1>"],
    "target_fit": "<who this is specifically for>",
    "success_conditions": "<conditions>"
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
  "pain_points": ["<pain 1>"],
  "questions": ["<question 1>"],
  "content_angles": [
    {
      "format": "<format>",
      "hook": "<hook>",
      "complexity": "básico" | "avanzado",
      "description": "<description>"
    }
  ],
  "not_recommended_if": ["<condition 1>"],
  "confidence_score": <number 0-100>
}

Rules:
- Be analytical and serious.
- Max 3 content_angles.
- Max 5 pain_points.
- Max 3 questions.
- **IMPORTANT**: DO NOT use citations like [1], [2], etc.
- Response must start with { and end with }. No other text.`;

async function runTest(topic, i) {
    console.log(`Running verification test ${i + 1} for topic: ${topic}`);
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
                        content: "You are a market research API. You MUST respond with valid JSON only. No explanations, no markdown, no citations, just pure JSON."
                    },
                    { role: "user", content: `${systemPromptBase}\n\nTopic: "${topic}"` }
                ],
                temperature: 0.2,
                max_tokens: 8000,
            })
        });

        if (!response.ok) {
            console.error(`Test ${i + 1} failed with status ${response.status}`);
            return false;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        let cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
        cleanContent = cleanContent.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
        if (!cleanContent.startsWith("{")) {
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) cleanContent = jsonMatch[0];
        }
        if (!cleanContent.endsWith("}")) {
            const openBraces = (cleanContent.match(/\{/g) || []).length;
            const closeBraces = (cleanContent.match(/\}/g) || []).length;
            if (openBraces > closeBraces) cleanContent += "}".repeat(openBraces - closeBraces);
        }
        cleanContent = cleanContent.replace(/,\s*([\}\]])/g, "$1");
        cleanContent = cleanContent.replace(/"\s*"/g, '", "');

        try {
            JSON.parse(cleanContent);
            console.log(`Test ${i + 1} SUCCESS`);
            return true;
        } catch (e) {
            console.error(`Test ${i + 1} FAILED TO PARSE:`, e.message);
            fs.writeFileSync(`failed_8k_${i + 1}.txt`, content);
            return false;
        }
    } catch (e) {
        console.error(`Test ${i + 1} Exception:`, e.message);
        return false;
    }
}

async function start() {
    let allPassed = true;
    for (let i = 0; i < topics.length; i++) {
        const passed = await runTest(topics[i], i);
        if (!passed) allPassed = false;
    }
    console.log(allPassed ? "ALL VERIFICATION TESTS PASSED" : "SOME VERIFICATION TESTS FAILED");
}

start();
