"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    AlertTriangle,
    ArrowRight,
    ArrowUpRight,
    Ban,
    BarChart3,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Compass,
    Database,
    Download,
    ExternalLink,
    FileText,
    HelpCircle,
    Layout,
    Lightbulb,
    Loader2,
    RefreshCw,
    Target,
    TrendingUp,
    Users,
    Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfidenceBar } from "./ConfidenceBar";
import { VerdictIndeterminate } from "./VerdictIndeterminate";
import { LowConfidenceWarning } from "./LowConfidenceWarning";
import { ValidationResult, VerdictStatus } from "@/lib/perplexity";
import { usePDFDownload } from "@/hooks/use-pdf-download";

interface ResultsDisplayProps {
    result: ValidationResult;
    onRestart: () => void;
    initialTopic?: string;
    contentType?: string;
    audience?: string;
    onJoinWaitlist?: () => void;
    onReformulate?: (newQuery: string) => void;
}

export function ResultsDisplay({
    result,
    onRestart,
    initialTopic = "",
    onJoinWaitlist,
    onReformulate
}: ResultsDisplayProps) {
    const t = useTranslations("validation.results");
    const tCommon = useTranslations("common");
    const containerRef = useRef<HTMLDivElement>(null);
    const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);

    const { downloadPDF, isGenerating } = usePDFDownload({
        result,
        topic: initialTopic,
    });

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    const handleReformulate = (newTopic: string) => {
        if (onReformulate) {
            onReformulate(newTopic);
        } else {
            onRestart();
        }
    };

    // CASE: INDETERMINATE (0 conversations)
    if (result.confidence_level === 'insufficient') {
        return (
            <section className="py-16 bg-gray-50/50" ref={containerRef}>
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <VerdictIndeterminate
                            conversationsCount={result.data_signals.total_conversations_analyzed}
                            originalQuery={initialTopic}
                            suggestions={result.suggestions || []}
                            onReformulate={handleReformulate}
                        />
                        <div className="mt-8 text-center">
                            <Button
                                variant="outline"
                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                onClick={onRestart}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t("restart")}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const verdictKey = result.strategic_recommendation.verdict;

    const getVerdictConfig = (verdict: VerdictStatus) => {
        switch (verdict) {
            case "create":
                return {
                    icon: CheckCircle2,
                    bg: "bg-emerald-50 text-emerald-700",
                    border: "border-emerald-200",
                    color: "text-emerald-700",
                    badge: "bg-emerald-500",
                };
            case "pilot":
                return {
                    icon: AlertTriangle,
                    bg: "bg-amber-50 text-amber-700",
                    border: "border-amber-200",
                    color: "text-amber-700",
                    badge: "bg-amber-500",
                };
            case "indeterminate":
                return {
                    icon: HelpCircle,
                    bg: "bg-slate-50 text-slate-700",
                    border: "border-slate-200",
                    color: "text-slate-700",
                    badge: "bg-slate-400",
                };
            default: // reconsider
                return {
                    icon: Ban,
                    bg: "bg-red-50 text-red-700",
                    border: "border-red-200",
                    color: "text-red-700",
                    badge: "bg-red-500",
                };
        }
    };

    const verdict = getVerdictConfig(verdictKey);

    return (
        <section className="py-24 bg-slate-50 relative overflow-hidden" ref={containerRef}>
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200 rounded-full blur-[128px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto">
                    {/* Low Confidence Warning */}
                    {result.confidence_level === 'low' && (
                        <div className="mb-8">
                            <LowConfidenceWarning conversationsCount={result.data_signals.total_conversations_analyzed} />
                        </div>
                    )}

                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Header Banner - Strategy Oriented */}
                        <div className="bg-slate-950 p-8 md:p-12 text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl -ml-32 -mb-32"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">
                                    <Zap className="h-3 w-3 text-sky-400" />
                                    {t("verdictBadge")}
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-2xl border-2 ${verdict.bg} ${verdict.border} ${verdict.color} shadow-lg shadow-current/10`}>
                                        <verdict.icon className="h-8 w-8" />
                                        <div className="text-left">
                                            <div className="text-2xl font-black tracking-tight">{t(`verdicts.${verdictKey}.label`)}</div>
                                            <div className="text-xs font-bold opacity-80 uppercase tracking-wider">{t(`verdicts.${verdictKey}.description`)}</div>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h1 className="text-white text-3xl font-black mb-2 leading-tight">
                                            {initialTopic}
                                        </h1>
                                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t("reasoningTitle")}</h3>
                                        <div className="space-y-2">
                                            {(result.strategic_recommendation?.reasoning || []).map((item, i) => (
                                                <p key={i} className="text-slate-300 text-sm font-medium leading-relaxed flex items-start gap-2">
                                                    <span className={`mt-2 h-1.5 w-1.5 rounded-full shrink-0 ${verdict.badge}`} />
                                                    {item}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 space-y-12">
                            {/* Demand Analysis */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 text-center justify-center flex-col md:flex-row md:text-left md:justify-start">
                                    <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
                                        <Compass className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t("demandAnalysis")}</h3>
                                        <p className="text-slate-500 font-medium">{t("realEvidence")}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 items-center bg-slate-50 rounded-[1.5rem] p-8 md:p-10 border border-slate-100">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-1000 ease-out"
                                                    style={{ width: `${result.demand_score}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center font-bold text-[10px] uppercase tracking-widest">
                                                <span className="text-slate-400">Demand Score</span>
                                                <span className="text-sky-600">{result.demand_score}/100</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-3xl font-black text-slate-900 leading-tight">
                                                {result.demand_interpretation}
                                            </div>
                                            <p className="text-slate-600 leading-relaxed font-medium">
                                                {result.demand_summary}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <table className="w-full border-collapse">
                                            <thead className="border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("conversationsAnalyzed")}</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("primarySource")}</th>
                                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t("freshness")}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                <tr>
                                                    <td className="px-6 py-8">
                                                        <span className="text-4xl font-black text-slate-900">{result.data_signals.total_conversations_analyzed}</span>
                                                    </td>
                                                    <td className="px-6 py-8">
                                                        <span className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-xs font-black text-slate-700 shadow-sm">{result.data_signals.primary_platform}</span>
                                                    </td>
                                                    <td className="px-6 py-8 text-right">
                                                        <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center justify-end gap-2">
                                                            <RefreshCw className="h-3 w-3" />
                                                            {t("recent")}
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible Sources */}
                            <div className="space-y-4">
                                <button
                                    onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                                    className="w-full flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 hover:border-sky-300 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-sky-50 rounded-xl text-sky-600 group-hover:scale-110 transition-transform">
                                            <Database className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("sourcesTitle")}</h4>
                                            <p className="text-sm text-slate-500 font-medium">
                                                {result.sources_analyzed
                                                    .filter(s => s.discussions_found > 0)
                                                    .map(s => t("sourcesSummary", { count: s.discussions_found, platform: s.platform }))
                                                    .reduce((acc, curr, i, arr) =>
                                                        i === 0 ? curr :
                                                            i === arr.length - 1 ? `${acc} ${t("and")} ${curr}` :
                                                                `${acc}, ${curr}`,
                                                        "")
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-widest">
                                        {isSourcesExpanded ? t("collapse") : t("viewDetails")}
                                        {isSourcesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </div>
                                </button>

                                {isSourcesExpanded && (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                        {result.sources_analyzed
                                            .filter(s => s.discussions_found > 0)
                                            .map((source, i) => (
                                                <Card key={i} className="border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden bg-white rounded-2xl">
                                                    <div className={`h-1 w-full ${source.relevance === 'high' ? 'bg-emerald-500' :
                                                        source.relevance === 'medium' ? 'bg-sky-500' : 'bg-slate-300'
                                                        }`} />
                                                    <CardContent className="p-4 space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-black text-sm text-slate-900">{source.platform}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${source.relevance === 'high' ? 'bg-emerald-50 text-emerald-700' :
                                                                source.relevance === 'medium' ? 'bg-sky-50 text-sky-700' : 'bg-slate-50 text-slate-500'
                                                                }`}>
                                                                {source.relevance.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("detectedTopics")}</p>
                                                                <ul className="mt-2 space-y-1.5">
                                                                    {(source.sample_topics || []).map((st, j) => (
                                                                        <li key={j} className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                                                                            <div className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                                                                            <span className="truncate">{st}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {source.citations && source.citations.length > 0 && (
                                                                <div className="space-y-2 pt-1">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{t("realRefs")}</p>
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {source.citations.slice(0, 3).map((url, k) => (
                                                                            <a
                                                                                key={k}
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center justify-between p-3 bg-sky-50/50 hover:bg-sky-100 border border-sky-100 rounded-xl transition-all group/link"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="p-1.5 bg-white rounded-lg text-sky-600 shadow-sm border border-sky-100">
                                                                                        <ExternalLink className="h-3 w-3" />
                                                                                    </div>
                                                                                    <span className="text-[11px] font-black text-sky-900">{t("ref", { n: k + 1 })}</span>
                                                                                </div>
                                                                                <ArrowRight className="h-3.5 w-3.5 text-sky-400 group-hover/link:translate-x-1 transition-transform" />
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                )}
                            </div>

                            {/* Business Impact Section */}
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{t("businessImpact")}</h4>
                                    </div>
                                    <div className="grid gap-4">
                                        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t("monetizationPotential")}</p>
                                                <p className="text-slate-800 font-bold leading-relaxed">{result.business_impact?.monetization_potential || 'Alta'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">{t("commercialRisks")}</p>
                                                <p className="text-slate-800 font-bold leading-relaxed">{result.business_impact?.commercial_risks || t("lowRisk")}</p>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-950 rounded-2xl shadow-xl shadow-slate-900/10 space-y-2 border border-slate-800">
                                            <p className="text-[10px] uppercase font-black text-sky-400 tracking-widest">{t("recommendedObjective")}</p>
                                            <p className="text-2xl font-black text-white capitalize">
                                                {result.business_impact?.primary_objective === 'leads' ? tCommon("objectives.leads") :
                                                    result.business_impact?.primary_objective === 'authority' ? tCommon("objectives.authority") :
                                                        result.business_impact?.primary_objective === 'sales' ? tCommon("objectives.sales") : tCommon("objectives.awareness")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{t("userChoices")}</h4>
                                    </div>
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                    <Layout className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("format")}</p>
                                                    <p className="text-sm font-bold text-slate-900 capitalize">{result.format_assessment.chosen_format}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${result.format_assessment.is_optimal ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {result.format_assessment.is_optimal ? t("optimal") : t("improvable")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                    <Target className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("objective")}</p>
                                                    <p className="text-sm font-bold text-slate-900 capitalize">{result.objective_assessment.chosen_objective}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${result.objective_assessment.is_aligned ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {result.objective_assessment.is_aligned ? t("aligned") : t("improvable")}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("level")}</p>
                                                    <p className="text-sm font-bold text-slate-900 capitalize">{result.audience_level_assessment.chosen_level}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${result.audience_level_assessment.is_appropriate ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                                {result.audience_level_assessment.is_appropriate ? t("appropriate") : t("improvable")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Competitive Landscape */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{t("competitiveLandscape")}</h4>
                                </div>
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("saturation")}</p>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${result.competitive_landscape.content_saturation === 'low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                    result.competitive_landscape.content_saturation === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                                                    }`}>
                                                    {result.competitive_landscape.content_saturation === 'low' ? t("low") :
                                                        result.competitive_landscape.content_saturation === 'medium' ? t("medium") : t("high")}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${result.competitive_landscape.content_saturation === 'low' ? 'bg-emerald-500 w-1/3' :
                                                        result.competitive_landscape.content_saturation === 'medium' ? 'bg-amber-500 w-2/3' : 'bg-red-500 w-full'
                                                        }`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("dominantFormats")}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(result.competitive_landscape.dominant_formats || []).map((df, i) => (
                                                <span key={i} className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                                    {df}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/5 space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("gapOpportunities")}</p>
                                        <div className="space-y-2">
                                            {(result.competitive_landscape.gap_opportunities || []).map((go, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {go}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pain Points & Questions */}
                            <div className="grid md:grid-cols-2 gap-12 pt-8">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                            <Target className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{t("painPoints")}</h4>
                                    </div>
                                    <div className="grid gap-4">
                                        {(result.pain_points || []).map((point, i) => (
                                            <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 shadow-xl shadow-slate-900/5 flex flex-col gap-3 hover:border-red-100 transition-colors">
                                                <div className="flex gap-4">
                                                    <span className="font-black text-red-400 text-lg leading-none">0{i + 1}</span>
                                                    <span className="font-bold text-slate-800">{point.pain}</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-1 pt-3 border-t border-slate-50">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 tracking-widest">
                                                        <Database className="h-3 w-3" /> {point.source}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg border ${point.frequency === 'common' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                                        }`}>
                                                        {point.frequency === 'common' ? t("frequent") : t("occasional")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                            <HelpCircle className="h-5 w-5" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{t("audienceQuestions")}</h4>
                                    </div>
                                    <div className="grid gap-6 text-sm italic text-slate-600 bg-amber-50/30 p-8 rounded-3xl border border-amber-100/50 relative overflow-hidden h-full">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <HelpCircle className="h-12 w-12 text-amber-500" />
                                        </div>
                                        {(result.questions || []).map((sq, i) => (
                                            <div key={i} className="space-y-2 relative z-10">
                                                <div className="flex gap-2">
                                                    <span className="text-amber-400 font-serif text-xl">"</span>
                                                    <span className="font-medium text-slate-700">{sq.question}</span>
                                                    <span className="text-amber-400 font-serif text-xl">"</span>
                                                </div>
                                                <div className="flex items-center gap-3 pl-6">
                                                    <span className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">{sq.source}</span>
                                                    {sq.answered_well ? (
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase">{t("resolved")}</span>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 uppercase">{t("opportunity")}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Not Recommended List */}
                            <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <Ban className="h-16 w-16 text-red-600" />
                                </div>
                                <h4 className="text-sm font-black uppercase text-red-700 flex items-center gap-2 tracking-widest relative z-10">
                                    <Ban className="h-4 w-4" /> {t("notRecommendedIf")}
                                </h4>
                                <ul className="space-y-3 relative z-10">
                                    {(result.not_recommended_if || []).map((nri, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-red-800/80">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-300 shrink-0" />
                                            {nri}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Content Strategy */}
                            <div className="space-y-8 pt-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                        <Lightbulb className="h-5 w-5" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{t("contentStrategy")}</h4>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(result.content_angles || []).map((angle, i) => (
                                        <Card key={i} className="border-2 border-slate-100 shadow-xl shadow-slate-900/5 hover:border-emerald-200 transition-all group overflow-hidden rounded-2xl bg-white">
                                            <div className="bg-emerald-50/50 p-3 text-[10px] font-black uppercase text-emerald-700 tracking-widest border-b border-emerald-100/50 flex justify-between items-center px-4">
                                                <div className="flex items-center gap-3">
                                                    <span>{angle.format}</span>
                                                    <span className="text-emerald-200 opacity-50">|</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <ArrowUpRight className="h-3.5 w-3.5" /> {angle.best_platform_to_publish}
                                                    </span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-lg border bg-white border-slate-100`}>
                                                    {angle.complexity}
                                                </span>
                                            </div>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("recommendedHook")}</p>
                                                    <p className="text-base font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                                                        "{angle.hook}"
                                                    </p>
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                    {angle.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Final CTA Banner */}
                        <div className="bg-slate-950 p-12 md:p-20 text-center relative overflow-hidden border-t border-white/5">
                            <div className="absolute inset-0 opacity-20">
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-500 rounded-full blur-[120px] -mr-48 -mb-48"></div>
                                <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] -ml-48 -mt-48"></div>
                            </div>

                            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tight">
                                        {t("finalTitle")}
                                    </h3>
                                    <p className="text-slate-400 text-lg font-medium">
                                        {t("finalSubtitle")}
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={onJoinWaitlist}
                                        size="lg"
                                        className="bg-sky-500 hover:bg-sky-600 text-white text-lg h-16 px-10 rounded-2xl font-black shadow-xl shadow-sky-500/20 transition-all active:scale-95 border-0"
                                    >
                                        {t("joinButton")}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <Button
                                        onClick={downloadPDF}
                                        disabled={isGenerating}
                                        size="lg"
                                        variant="outline"
                                        className="border-slate-800 bg-slate-900/50 text-white hover:bg-slate-900 text-lg h-16 px-10 rounded-2xl font-black transition-all active:scale-95"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t("generating")}
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-5 w-5" />
                                                {t("downloadButton")}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={onRestart}
                                        size="lg"
                                        variant="outline"
                                        className="border-slate-800 bg-slate-900/50 text-white hover:bg-slate-900 text-lg h-16 px-10 rounded-2xl font-black transition-all active:scale-95"
                                    >
                                        <RefreshCw className="mr-2 h-5 w-5" />
                                        {t("validateAnother")}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
