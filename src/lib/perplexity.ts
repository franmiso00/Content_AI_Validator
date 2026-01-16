export interface ValidationInput {
  topic: string;
  audience?: string;
  contentType?: string;      // article | newsletter | video-long | video-short | social | guide
  objective?: string;        // leads | sales | authority | awareness
  audienceLevel?: string;    // beginner | intermediate | advanced
  language?: string;         // 'es', 'en', 'fr'
}

export interface FormatAssessment {
  chosen_format: string;
  recommended_format: string;
  is_optimal: boolean;
  reasoning: string;
  alternative_suggestion?: string;
}

export interface ObjectiveAssessment {
  chosen_objective: string;
  recommended_objective: "leads" | "authority" | "sales" | "awareness";
  is_aligned: boolean;
  reasoning: string;
}

export interface AudienceLevelAssessment {
  chosen_level: string;
  recommended_level: "beginner" | "intermediate" | "advanced";
  is_appropriate: boolean;
  reasoning: string;
}

export type VerdictStatus = 'create' | 'pilot' | 'reconsider' | 'indeterminate';

export interface ReformulationSuggestion {
  type: 'broader_terms' | 'alternative_keywords' | 'different_angle' | 'other_sources';
  suggestion: string;
  example?: string;
}

export interface ValidationResult {
  demand_score: number;
  demand_interpretation: string;
  demand_summary: string;
  format_assessment: FormatAssessment;
  objective_assessment: ObjectiveAssessment;
  audience_level_assessment: AudienceLevelAssessment;

  // NEW: Detailed source breakdown
  sources_analyzed: {
    platform: string;           // "Reddit" | "Quora" | "HackerNews" | etc.
    discussions_found: number;  // Cantidad de hilos/posts encontrados
    relevance: "high" | "medium" | "low";
    sample_topics: string[];    // 2-3 temas ejemplo encontrados
    citations?: string[];       // NUEVO: 2-3 URLs de hilos específicos
  }[];

  strategic_recommendation: {
    verdict: VerdictStatus;
    reasoning: string[];
    target_fit: string;
    success_conditions: string;
  };
  data_signals: {
    total_conversations_analyzed: number; // Changed from conversations_analyzed
    primary_platform: string;              // NEW
    recency: string;
    engagement_type: string;
  };

  // NEW: Competitive analysis
  competitive_landscape: {
    content_saturation: "low" | "medium" | "high";
    dominant_formats: string[];
    gap_opportunities: string[];
  };

  business_impact: {
    primary_objective: "leads" | "authority" | "sales" | "awareness";
    monetization_potential: string;
    commercial_risks: string;
  };

  // UPDATED: Objects with metadata
  pain_points: {
    pain: string;
    source: string;
    frequency: "common" | "occasional" | "rare";
  }[];

  // UPDATED: Objects with metadata
  questions: {
    question: string;
    source: string;
    answered_well: boolean;
  }[];

  content_angles: {
    format: string;
    hook: string;
    complexity: "básico" | "avanzado" | "basic" | "advanced"; // Support both languages
    description: string;
    best_platform_to_publish: string;  // NEW
  }[];
  not_recommended_if: string[];
  confidence_score: number;
  confidence_level: 'high' | 'medium' | 'low' | 'insufficient';
  confidence_percentage: number;
  suggestions?: ReformulationSuggestion[];
  remaining_validations?: number;
}

const LANGUAGE_NAMES: Record<string, string> = {
  es: "SPANISH",
  en: "ENGLISH",
  fr: "FRENCH"
};

const apiKey = process.env.PERPLEXITY_API_KEY;

export async function validateIdea(input: ValidationInput): Promise<ValidationResult> {
  const { topic, audience, contentType, objective, audienceLevel, language = 'es' } = input;

  const targetLanguage = LANGUAGE_NAMES[language] || "SPANISH";

  const systemPrompt = `You are a strategic market research API for high-ticket B2B businesses. Your goal is to help users decide if a content idea is worth the investment.

IMPORTANT: Search for discussions about this topic across MULTIPLE platforms to provide comprehensive market intelligence.

Topic: "${topic}"
Target Audience: "${audience || "General"}"
Chosen Format: "${contentType || "Not specified"}"
Chosen Objective: "${objective || "Not specified"}"
Chosen Audience Level: "${audienceLevel || "Not specified"}"

PLATFORMS TO SEARCH (in order of priority):
1. Reddit - ALWAYS search specific subreddits related to ${audience || "the topic"} to find real user conversations.
2. YouTube - Search for video titles and comments about the topic.
3. Quora - Questions and detailed answers about the topic.
4. Hacker News - Tech/startup/business discussions.
5. Stack Exchange - Q&A sites relevant to the industry.
6. IndieHackers - Founder and entrepreneur discussions.
7. Specialized forums - Industry-specific communities for ${audience || "professionals"}.
8. LinkedIn (public posts) - B2B professional discussions.
9. Medium/Substack - Published content and comments.

Output ONLY a valid JSON object. Do not include markdown, code blocks, or explanations. RESPONSES ALWAYS IN ${targetLanguage}.

Required JSON Structure:
{
  "demand_score": <number 0-100>,
  "demand_interpretation": "<short semantic category: e.g. 'Strong demand in emerging niche'>",
  "demand_summary": "<2-sentence overview of market state across all platforms>",
  
  "format_assessment": {
    "chosen_format": "${contentType}",
    "recommended_format": "<ideal format>",
    "is_optimal": <boolean>,
    "reasoning": "<why it is or isn't optimal>"
  },
  
  "objective_assessment": {
    "chosen_objective": "${objective}",
    "recommended_objective": "leads" | "authority" | "sales" | "awareness",
    "is_aligned": <boolean>,
    "reasoning": "<why this objective fits>"
  },
  
  "audience_level_assessment": {
    "chosen_level": "${audienceLevel}",
    "recommended_level": "beginner" | "intermediate" | "advanced",
    "is_appropriate": <boolean>,
    "reasoning": "<why this level is adequate>"
  },

  "sources_analyzed": [
    {
      "platform": "<platform name>",
      "discussions_found": <number>,
      "relevance": "high" | "medium" | "low",
      "sample_topics": ["<topic 1>", "<topic 2>"],
      "citations": ["<url 1>", "<url 2>"]
    }
  ],
  
  "strategic_recommendation": {
    "verdict": "create" | "pilot" | "reconsider",
    "reasoning": ["<reason 1>", "<reason 2>"],
    "target_fit": "<who this is specifically for>",
    "success_conditions": "<specific conditions for success>"
  },
  
  "data_signals": {
    "total_conversations_analyzed": <total number across all platforms>,
    "primary_platform": "<platform with most relevant discussions>",
    "recency": "<freshness of data, e.g. 'frequent last 60 days'>",
    "engagement_type": "<primary type: questions, complaints, debates, tutorials>"
  },
  
  "business_impact": {
    "primary_objective": "leads" | "authority" | "sales",
    "monetization_potential": "<potential via newsletter, upsell, service, etc.>",
    "commercial_risks": "<risks like small niche, high legal compliance, etc.>"
  },
  
  "pain_points": [
    {
      "pain": "<description>",
      "source": "<platform where this was found>",
      "frequency": "common" | "occasional" | "rare"
    }
  ],
  
  "questions": [
    {
      "question": "<question text>",
      "source": "<platform>",
      "answered_well": <boolean - is this already well-answered online?>
    }
  ],
  
  "content_angles": [
    {
      "format": "<recommended format: newsletter, guide, video script, thread>",
      "hook": "<main hook/headline idea>",
      "complexity": "basic" | "advanced",
      "description": "<actionable description>",
      "best_platform_to_publish": "<where this would perform best>"
    }
  ],
  
  "competitive_landscape": {
    "content_saturation": "low" | "medium" | "high",
    "dominant_formats": ["<format 1>", "<format 2>"],
    "gap_opportunities": ["<opportunity 1>", "<opportunity 2>"]
  },
  
  "not_recommended_if": ["<condition 1>", "<condition 2>"],

  "confidence_level": "insufficient" | "low" | "medium" | "high",
  "confidence_percentage": <number 0-100>,
  "confidence_score": <number 0-100>,
  "suggestions": [
     {
       "type": "broader_terms" | "alternative_keywords" | "different_angle" | "other_sources",
       "suggestion": "<brief description>",
       "example": "<example of new search query>"
     }
  ]
}

### CONFIDENCE AND VERDICT DETERMINATION LOGIC:
1. INSUFFICIENT DATA (0 conversations): verdict: "reconsider", confidence_level: "insufficient", confidence_percentage: 0.
2. LIMITED DATA (1-4 conversations): confidence_level: "low", confidence_percentage: Min(35, total_conv * 8).
3. MEDIUM DATA (5-14 conversations): confidence_level: "medium", confidence_percentage: 35 + (total_conv - 5) * 5.
4. SUFFICIENT DATA (15+ conversations): confidence_level: "high", confidence_percentage: Min(95, 70 + (total_conv - 15) * 1.5).

RULES:
- Search ALL listed platforms, not just Reddit.
- Be analytical and serious. Avoid hype words like "viral" or "magical".
- Focus on "reduction of risk" and "informed decisions".
- Include specific platform names in sources_analyzed.
- MANDATORY: Each source in "sources_analyzed" with discussions_found > 0 MUST include 2-3 REAL, FUNCTIONAL URLs in the "citations" field. For YouTube, provide direct links to the videos (e.g., https://www.youtube.com/watch?v=...).
- If a platform has no relevant discussions, still include it with discussions_found: 0.
- Response must start with { and end with }. No other text.`;

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
            content: "You are a market research API. Respond EXCLUSIVELY with valid JSON."
          },
          { role: "user", content: systemPrompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Perplexity");
    }

    let cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

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
