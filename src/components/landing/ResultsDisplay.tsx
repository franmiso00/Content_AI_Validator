"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    TrendingUp,
    Target,
    HelpCircle,
    Lightbulb,
    ArrowRight,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Database,
    Banknote,
    Ban,
    BarChart3,
    ArrowUpRight,
    Zap,
    FileText,
    Users,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Download,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConfidenceBar } from "./ConfidenceBar";
import { VerdictIndeterminate } from "./VerdictIndeterminate";
import { LowConfidenceWarning } from "./LowConfidenceWarning";

import { ValidationResult, VerdictStatus, ReformulationSuggestion } from "@/lib/perplexity";

interface ResultsDisplayProps {
    result: ValidationResult;
    topic: string;
    onReset: () => void;
    onReformulate?: (newQuery: string) => void;
    onJoinWaitlist?: () => void;
}

import { usePDFDownload } from "@/hooks/use-pdf-download";

export function ResultsDisplay({ result, topic, onReset, onReformulate, onJoinWaitlist }: ResultsDisplayProps) {
    const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
    const { downloadPDF, isGenerating } = usePDFDownload({
        result,
        topic,
    });
    const showSignupCTA = result.remaining_validations !== undefined && result.remaining_validations <= 2;

    const getVerdictConfig = (verdict: VerdictStatus) => {
        switch (verdict) {
            case "create":
                return {
                    label: "VALIDADO",
                    icon: CheckCircle2,
                    color: "bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200 text-emerald-700",
                    badge: "bg-emerald-500",
                    description: "Señales de demanda reales detectadas."
                };
            case "pilot":
                return {
                    label: "TESTEAR",
                    icon: AlertTriangle,
                    color: "bg-amber-50 border-amber-200 text-amber-700",
                    badge: "bg-amber-500",
                    description: "Existe interés pero requiere un enfoque específico."
                };
            case "indeterminate":
                return {
                    label: "SIN DATOS",
                    icon: HelpCircle,
                    color: "bg-slate-50 border-slate-200 text-slate-700",
                    badge: "bg-slate-400",
                    description: "No hay volumen suficiente para decidir."
                };
            default:
                return {
                    label: "NO RECOMENDADO",
                    icon: Ban,
                    color: "bg-red-50 border-red-200 text-red-700",
                    badge: "bg-red-500",
                    description: "Nula demanda o mercado excesivamente saturado."
                };
        }
    };

    const handleReformulate = (newTopic: string) => {
        if (onReformulate) {
            onReformulate(newTopic);
        } else {
            // Fallback or generic reset logic if onReformulate is not provided
            onReset();
        }
    };

    // CASE: INDETERMINATE (0 conversations)
    if (result.confidence_level === 'insufficient') {
        return (
            <section className="py-16 bg-gray-50/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <VerdictIndeterminate
                            conversationsCount={result.data_signals.total_conversations_analyzed}
                            originalQuery={topic}
                            suggestions={result.suggestions || []}
                            onReformulate={handleReformulate}
                        />
                        <div className="mt-8 text-center">
                            <Button
                                variant="outline"
                                className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                onClick={onReset}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Volver a empezar
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const verdict = getVerdictConfig(result.strategic_recommendation.verdict);
    const VerdictIcon = verdict.icon;

    return (
        <section className="py-16 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* Low Confidence Warning */}
                    {result.confidence_level === 'low' && (
                        <LowConfidenceWarning conversationsCount={result.data_signals.total_conversations_analyzed} />
                    )}

                    {/* 1. Header & Verdict (Decision First) */}
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-sky-600">Veredicto Estratégico</h2>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                                {topic}
                            </h3>
                        </div>

                        <Card className={`border-2 shadow-xl shadow-slate-900/5 rounded-2xl overflow-hidden transition-all ${verdict.color}`}>
                            <div className="grid md:grid-cols-3">
                                <div className={`p-8 flex flex-col items-center justify-center text-center space-y-4 border-b md:border-b-0 md:border-r border-current transition-colors opacity-90`}>
                                    <div className={`w-16 h-16 ${verdict.badge} rounded-xl flex items-center justify-center`}>
                                        <VerdictIcon className="h-10 w-10 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black uppercase tracking-tight">{verdict.label}</p>
                                        <p className="text-xs font-medium opacity-80 mt-1">{verdict.description}</p>
                                    </div>
                                </div>
                                <div className="p-8 md:col-span-2 space-y-4 bg-white/60">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-sky-500" />
                                        Razonamiento del Veredicto
                                    </h4>
                                    <ul className="space-y-3">
                                        {(result.strategic_recommendation?.reasoning || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${verdict.badge}`} />
                                                <span className="text-slate-700 leading-relaxed font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* 2. Demand & Data Signals (Evidence) */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 bg-white border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden border-l-4 border-l-sky-500 rounded-2xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center space-x-2 text-slate-800 text-lg font-black uppercase tracking-tight">
                                    <TrendingUp className="h-5 w-5 text-sky-500" />
                                    <span>Análisis de Señales de Demanda</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-3">
                                    <div className="text-5xl font-black text-slate-900">{result.demand_score}<span className="text-xl text-slate-300">/100</span></div>
                                    <div className="px-3 py-1 bg-sky-100 text-sky-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        {result.demand_interpretation}
                                    </div>
                                </div>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {result.demand_summary}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 text-white border-0 shadow-xl shadow-slate-900/20 rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b border-white/10">
                                <CardTitle className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                    <Database className="h-4 w-4" />
                                    <span>Evidencia Real</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-4xl font-black text-white">{result.data_signals?.total_conversations_analyzed || 0}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Conversaciones Analizadas</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Principal Fuente</p>
                                        <p className="text-sm font-black text-white">{result.data_signals?.primary_platform || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Frescura</p>
                                        <p className="text-sm font-black text-white">{result.data_signals?.recency || 'Reciente'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 🆕 Fuentes Analizadas Collapsible Section */}
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
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Fuentes Analizadas</h4>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {result.sources_analyzed
                                            .filter(s => s.discussions_found > 0)
                                            .map(s => `${s.discussions_found} en ${s.platform}`)
                                            .reduce((acc, curr, i, arr) =>
                                                i === 0 ? curr :
                                                    i === arr.length - 1 ? `${acc} y ${curr}` :
                                                        `${acc}, ${curr}`,
                                                "")
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-widest">
                                {isSourcesExpanded ? "Contraer" : "Ver detalles y links"}
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
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temas detectados</p>
                                                        <ul className="mt-2 space-y-1.5">
                                                            {(source.sample_topics || []).map((t, j) => (
                                                                <li key={j} className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                                                                    <div className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                                                                    <span className="truncate">{t}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {source.citations && source.citations.length > 0 && (
                                                        <div className="space-y-2 pt-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Fuentes Reales</p>
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
                                                                            <span className="text-[11px] font-black text-sky-900">Referencia #{k + 1}</span>
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

                    {/* 3. Business Impact & monetization */}
                    <Card className="bg-slate-900 text-white border-0 shadow-2xl shadow-slate-900/20 overflow-hidden rounded-3xl relative">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

                        <CardContent className="p-8 md:p-10 relative z-10">
                            <div className="grid md:grid-cols-3 gap-10 items-center">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-sky-400 border border-white/5">
                                        <ArrowUpRight className="h-3 w-3" /> Impacto Comercial
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Objetivo Recomendado</p>
                                        <p className="text-2xl font-black text-white capitalize">
                                            {result.business_impact?.primary_objective === 'leads' ? 'Captación (Leads)' :
                                                result.business_impact?.primary_objective === 'authority' ? 'Autoridad de Marca' :
                                                    result.business_impact?.primary_objective === 'sales' ? 'Ventas Directas' : 'Crecimiento'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Potencial de Monetización</p>
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{result.business_impact?.monetization_potential || 'Alta'}</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-[10px] uppercase font-bold text-red-400 tracking-widest flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" /> Riesgos Comerciales
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed mt-2 font-medium">{result.business_impact?.commercial_risks || 'Bajo riesgo comercial detectado.'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 🆕 Validation of User Choices Section */}
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-sky-500" /> Validación de tus Elecciones
                            </h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* Format Assessment */}
                            <Card className={`border-2 transition-all hover:shadow-xl hover:shadow-slate-900/5 rounded-2xl ${result.format_assessment.is_optimal ? 'border-emerald-100 bg-white' : 'border-amber-100 bg-white'}`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                                            <FileText className="h-4 w-4 text-slate-400" /> Formato
                                        </div>
                                        {result.format_assessment.is_optimal ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                <CheckCircle2 className="h-3 w-3" /> Óptimo
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                <AlertTriangle className="h-3 w-3" /> Melhorable
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tu elección</p>
                                        <p className="text-sm font-black text-slate-900 capitalize">{result.format_assessment.chosen_format}</p>
                                    </div>
                                    {!result.format_assessment.is_optimal && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Recomendado</p>
                                            <p className="text-sm font-black text-amber-900">{result.format_assessment.recommended_format}</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {result.format_assessment.reasoning}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Objective Assessment */}
                            <Card className={`border-2 transition-all hover:shadow-xl hover:shadow-slate-900/5 rounded-2xl ${result.objective_assessment.is_aligned ? 'border-emerald-100 bg-white' : 'border-amber-100 bg-white'}`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                                            <Target className="h-4 w-4 text-slate-400" /> Objetivo
                                        </div>
                                        {result.objective_assessment.is_aligned ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                <CheckCircle2 className="h-3 w-3" /> Alineado
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                <AlertTriangle className="h-3 w-3" /> Mejorable
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tu elección</p>
                                        <p className="text-sm font-black text-slate-900 capitalize">{result.objective_assessment.chosen_objective}</p>
                                    </div>
                                    {!result.objective_assessment.is_aligned && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Recomendado</p>
                                            <p className="text-sm font-black text-amber-900 capitalize">{result.objective_assessment.recommended_objective}</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {result.objective_assessment.reasoning}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Audience Level Assessment */}
                            <Card className={`border-2 transition-all hover:shadow-xl hover:shadow-slate-900/5 rounded-2xl ${result.audience_level_assessment.is_appropriate ? 'border-emerald-100 bg-white' : 'border-amber-100 bg-white'}`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400">
                                            <Users className="h-4 w-4 text-slate-400" /> Nivel
                                        </div>
                                        {result.audience_level_assessment.is_appropriate ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                                <CheckCircle2 className="h-3 w-3" /> Adecuado
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                <AlertTriangle className="h-3 w-3" /> Mejorable
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tu elección</p>
                                        <p className="text-sm font-black text-slate-900 capitalize">{result.audience_level_assessment.chosen_level}</p>
                                    </div>
                                    {!result.audience_level_assessment.is_appropriate && (
                                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Sugerido</p>
                                            <p className="text-sm font-black text-amber-900 capitalize">{result.audience_level_assessment.recommended_level}</p>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {result.audience_level_assessment.reasoning}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>



                    {/* 🆕 Competitive Landscape */}
                    <Card className="bg-white border-slate-200 shadow-xl shadow-slate-900/5 rounded-3xl overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="flex items-center gap-3 text-slate-800 text-lg font-black uppercase tracking-tight">
                                <div className="p-2 bg-slate-900 rounded-lg text-white">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                Panorama Competitivo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid md:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saturación de Contenido</p>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${result.competitive_landscape.content_saturation === 'low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                                result.competitive_landscape.content_saturation === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                                                }`}>
                                                {result.competitive_landscape.content_saturation === 'low' ? 'Baja' :
                                                    result.competitive_landscape.content_saturation === 'medium' ? 'Media' : 'Alta'}
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
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formatos Dominantes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(result.competitive_landscape.dominant_formats || []).map((f, i) => (
                                            <span key={i} className="text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Oportunidades de Hueco</p>
                                    <div className="space-y-2">
                                        {(result.competitive_landscape.gap_opportunities || []).map((o, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                {o}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Pain Points & Content Angles */}
                    <div className="grid gap-12 md:grid-cols-2">
                        {/* Context & Frustrations */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h4 className="text-xl font-black flex items-center gap-3 text-slate-900">
                                    <div className="p-2 bg-red-50 rounded-lg text-red-500">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    Frustraciones Detectadas
                                </h4>
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
                                                    {point.frequency === 'common' ? 'FRECUENTE' : 'OCASIONAL'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-xl font-black flex items-center gap-3 text-slate-900">
                                    <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    Preguntas de la Audiencia
                                </h4>
                                <div className="grid gap-4 text-sm italic text-slate-600 bg-amber-50/30 p-8 rounded-3xl border border-amber-100/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <HelpCircle className="h-12 w-12 text-amber-500" />
                                    </div>
                                    {(result.questions || []).map((q, i) => (
                                        <div key={i} className="space-y-2 relative z-10">
                                            <div className="flex gap-2">
                                                <span className="text-amber-400 font-serif text-xl">"</span>
                                                <span className="font-medium text-slate-700">{q.question}</span>
                                                <span className="text-amber-400 font-serif text-xl">"</span>
                                            </div>
                                            <div className="flex items-center gap-3 pl-6">
                                                <span className="text-[10px] font-black text-amber-700/60 uppercase tracking-widest">{q.source}</span>
                                                {q.answered_well ? (
                                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase">Resuelta</span>
                                                ) : (
                                                    <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 uppercase">Oportunidad</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Not Recommended Block */}
                            <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] space-y-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                                    <Ban className="h-16 w-16 text-red-600" />
                                </div>
                                <h4 className="text-sm font-black uppercase text-red-700 flex items-center gap-2 tracking-widest relative z-10">
                                    <Ban className="h-4 w-4" /> No recomendado si:
                                </h4>
                                <ul className="space-y-3 relative z-10">
                                    {(result.not_recommended_if || []).map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-red-800/80">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-300 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>


                        {/* Actionable Angles */}
                        <div className="space-y-6">
                            <h4 className="text-xl font-black flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500">
                                    <Lightbulb className="h-5 w-5" />
                                </div>
                                Estrategia de Contenido
                            </h4>
                            <div className="space-y-6">
                                {result.content_angles.map((angle, i) => (
                                    <Card key={i} className="border-2 border-slate-100 shadow-xl shadow-slate-900/5 hover:border-emerald-200 transition-all group overflow-hidden rounded-2xl">
                                        <div className="bg-emerald-50/50 p-3 text-[10px] font-black uppercase text-emerald-700 tracking-widest border-b border-emerald-100/50 flex justify-between items-center px-6">
                                            <div className="flex items-center gap-6">
                                                <span>{angle.format}</span>
                                                <span className="text-emerald-200 opacity-50">|</span>
                                                <span className="flex items-center gap-1.5">
                                                    <ArrowUpRight className="h-3.5 w-3.5" /> {angle.best_platform_to_publish}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-lg border ${angle.complexity === 'avanzado' ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-slate-100'}`}>
                                                {angle.complexity}
                                            </span>
                                        </div>
                                        <CardContent className="p-8 space-y-4">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hook Recomendado</p>
                                                <p className="text-lg font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                                                    "{angle.hook}"
                                                </p>
                                            </div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                {angle.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Final CTA Card */}
                    <Card className="border-0 bg-slate-900 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden rounded-[2.5rem] mt-20">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

                        <CardContent className="p-12 md:p-20 text-center space-y-8 relative z-10">
                            <div className="space-y-4">
                                <h3 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                                    Toma decisiones basadas en <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">señales</span>,<br />no en intuición.
                                </h3>
                                <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                                    Guarda este análisis completo y accede a señales avanzadas de mercado con Valio Pro.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-br from-sky-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-sky-500/20 py-8 px-10 rounded-2xl font-black text-xl transition-all hover:scale-[1.02] border-0"
                                    onClick={onJoinWaitlist}
                                >
                                    Unirme al Early Access
                                    <ArrowRight className="ml-2 h-6 w-6" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 py-8 px-10 rounded-2xl font-black text-xl backdrop-blur-md transition-all sm:w-auto"
                                    onClick={downloadPDF}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-6 w-6" />
                                            Descargar PDF
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 py-8 px-10 rounded-2xl font-black text-xl backdrop-blur-md transition-all sm:w-auto"
                                    onClick={onReset}
                                >
                                    <RefreshCw className="mr-2 h-6 w-6" />
                                    Validar otra Idea
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
