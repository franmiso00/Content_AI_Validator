// src/hooks/use-pdf-download.ts
import { useState } from 'react';
import { generateReportPDF } from '@/lib/pdf/generate-report-pdf';

interface ValidationResult {
    demand_score: number;
    demand_interpretation: string;
    demand_summary: string;
    strategic_recommendation: {
        verdict: 'create' | 'pilot' | 'reconsider';
        reasoning: string[];
        target_fit: string;
        success_conditions: string;
    };
    data_signals: {
        total_conversations_analyzed: number;
        recency: string;
        primary_platform: string;
        engagement_type: string;
    };
    business_impact: {
        primary_objective: 'leads' | 'authority' | 'sales';
        monetization_potential: string;
        commercial_risks: string;
    };
    pain_points: Array<{ pain: string; source: string; frequency: string }>;
    questions: Array<{ question: string; source: string; answered_well: boolean }>;
    content_angles: Array<{
        format: string;
        hook: string;
        complexity: 'básico' | 'avanzado';
        description: string;
        best_platform_to_publish: string;
    }>;
    not_recommended_if: string[];
    confidence_score: number;
}

interface UsePDFDownloadOptions {
    result: any; // Using any because the type in ResultsDisplay might be slightly different or from perplexity.ts
    topic: string;
    audience?: string;
}

export function usePDFDownload({ result, topic, audience }: UsePDFDownloadOptions) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const downloadPDF = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            // Map the complex result structure to the one expected by the PDF generator
            const mappedResult = {
                demand_score: result.demand_score,
                demand_interpretation: result.demand_interpretation,
                demand_summary: result.demand_summary,
                strategic_recommendation: {
                    verdict: result.strategic_recommendation.verdict,
                    reasoning: result.strategic_recommendation.reasoning,
                    target_fit: result.strategic_recommendation.target_fit || "Audiencia validada en señales de demanda.",
                    success_conditions: result.strategic_recommendation.success_conditions || "Enfoque en los dolores detectados.",
                },
                data_signals: {
                    conversations_analyzed: result.data_signals.total_conversations_analyzed,
                    recency: result.data_signals.recency || "Últimos 30 días",
                    engagement_type: result.data_signals.primary_platform || "Consultas directas",
                },
                business_impact: {
                    primary_objective: result.business_impact.primary_objective,
                    monetization_potential: result.business_impact.monetization_potential,
                    commercial_risks: result.business_impact.commercial_risks,
                },
                pain_points: result.pain_points.map((p: any) => p.pain),
                questions: result.questions.map((q: any) => q.question),
                content_angles: result.content_angles.map((a: any) => ({
                    format: a.format,
                    hook: a.hook,
                    complexity: a.complexity,
                    description: a.description,
                })),
                not_recommended_if: result.not_recommended_if,
                confidence_score: result.demand_score, // Fallback to demand score if confidence is not clear
            };

            await generateReportPDF({
                result: mappedResult as any,
                topic,
                audience,
                filename: generateFilename(topic),
            });
        } catch (err) {
            setError('Error al generar el PDF. Por favor, intenta de nuevo.');
            console.error('PDF generation error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return { downloadPDF, isGenerating, error };
}

function generateFilename(topic: string): string {
    const date = new Date().toISOString().split('T')[0];
    const slug = topic
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .substring(0, 50);

    return `valio-report-${date}-${slug}.pdf`;
}
