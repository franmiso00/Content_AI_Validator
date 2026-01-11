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
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

interface ValidationResult {
    demand_score: number;
    demand_interpretation: string;
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
    remaining_validations?: number;
}

interface ResultsDisplayProps {
    result: ValidationResult;
    topic: string;
    onReset: () => void;
}

export function ResultsDisplay({ result, topic, onReset }: ResultsDisplayProps) {
    const showSignupCTA = result.remaining_validations !== undefined && result.remaining_validations <= 2;

    const getVerdictConfig = (verdict: string) => {
        switch (verdict) {
            case "create":
                return {
                    label: "Crear esta idea",
                    icon: CheckCircle2,
                    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    badge: "bg-emerald-500",
                    description: "Señales claras de demanda y baja fricción de entrada."
                };
            case "pilot":
                return {
                    label: "Validar con piloto",
                    icon: AlertTriangle,
                    color: "bg-amber-50 text-amber-700 border-amber-200",
                    badge: "bg-amber-500",
                    description: "Existe interés pero requiere un enfoque más específico o test previo."
                };
            default:
                return {
                    label: "No priorizar ahora",
                    icon: XCircle,
                    color: "bg-rose-50 text-rose-700 border-rose-200",
                    badge: "bg-rose-500",
                    description: "Baja demanda detectada o mercado excesivamente saturado."
                };
        }
    };

    const verdict = getVerdictConfig(result.strategic_recommendation.verdict);
    const VerdictIcon = verdict.icon;

    return (
        <section className="py-16 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto space-y-12">

                    {/* 1. Header & Verdict (Decision First) */}
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Veredicto Estratégico</h2>
                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                                "{topic}"
                            </h3>
                        </div>

                        <Card className={`border-2 shadow-xl overflow-hidden transition-all ${verdict.color}`}>
                            <div className="grid md:grid-cols-3">
                                <div className={`p-8 flex flex-col items-center justify-center text-center space-y-4 border-b md:border-b-0 md:border-r border-current transition-colors opacity-90`}>
                                    <VerdictIcon className="h-16 w-16" />
                                    <div>
                                        <p className="text-2xl font-black uppercase tracking-tight">{verdict.label}</p>
                                        <p className="text-xs font-medium opacity-80 mt-1">{verdict.description}</p>
                                    </div>
                                </div>
                                <div className="p-8 md:col-span-2 space-y-4 bg-white/50">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Razonamiento del Veredicto
                                    </h4>
                                    <ul className="space-y-3">
                                        {(result.strategic_recommendation?.reasoning || []).map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${verdict.badge}`} />
                                                <span className="text-gray-700 leading-relaxed font-medium">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-4 grid grid-cols-2 gap-4 border-t border-gray-200/50">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Ideal para</p>
                                            <p className="text-sm font-semibold text-gray-800">{result.strategic_recommendation?.target_fit || 'Audiencia general'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Condición de éxito</p>
                                            <p className="text-sm font-semibold text-gray-800">{result.strategic_recommendation?.success_conditions || 'Ejecución consistente'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* 2. Demand & Data Signals (Evidence) */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2 bg-white border-gray-200 shadow-sm overflow-hidden border-l-4 border-l-blue-600">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center space-x-2 text-blue-800 text-lg">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>Análisis de Señales de Demanda</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline gap-3">
                                    <div className="text-4xl font-black text-gray-900">{result.demand_score}<span className="text-xl text-gray-300">/100</span></div>
                                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                        {result.demand_interpretation}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {result.demand_summary}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gray-900 text-white border-0 shadow-lg">
                            <CardHeader className="pb-3 border-b border-white/10">
                                <CardTitle className="flex items-center space-x-2 text-sm uppercase tracking-widest opacity-80">
                                    <Database className="h-4 w-4" />
                                    <span>Evidencia Real</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-3xl font-black">{result.data_signals?.conversations_analyzed || 0}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Conversaciones Analizadas</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Frescura</p>
                                        <p className="text-sm font-medium">{result.data_signals?.recency || 'Reciente'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase">Engagement</p>
                                        <p className="text-sm font-medium">{result.data_signals?.engagement_type || 'Mixto'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. Business Impact & monetization */}
                    <Card className="bg-gradient-to-br from-gray-900 to-blue-900 text-white border-0 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Banknote className="h-24 w-24" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <div className="grid md:grid-cols-3 gap-8 items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                                        <ArrowUpRight className="h-3 w-3" /> Impacto Comercial
                                    </div>
                                    <p className="text-xs uppercase font-bold text-blue-300 tracking-wider">Objetivo Recomendado</p>
                                    <p className="text-2xl font-black capitalize">
                                        {result.business_impact?.primary_objective === 'leads' ? 'Captación (Leads)' :
                                            result.business_impact?.primary_objective === 'authority' ? 'Autoridad de Marca' :
                                                result.business_impact?.primary_objective === 'sales' ? 'Ventas Directas' : 'Crecimiento'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-bold text-blue-300 tracking-wider">Potencial de Monetización</p>
                                    <p className="text-sm text-gray-200 leading-relaxed mt-1 font-medium">{result.business_impact?.monetization_potential || 'Alta'}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    <p className="text-xs uppercase font-bold text-rose-400 tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3" /> Riesgos Comerciales
                                    </p>
                                    <p className="text-sm text-gray-300 leading-relaxed mt-2">{result.business_impact?.commercial_risks || 'Bajo riesgo'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Pain Points & Content Angles */}
                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Context & Frustrations */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-black flex items-center gap-2 text-gray-900">
                                    <Target className="h-5 w-5 text-rose-500" />
                                    Frustraciones Detectadas
                                </h4>
                                <div className="grid gap-3">
                                    {(result.pain_points || []).map((point, i) => (
                                        <div key={i} className="p-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 shadow-sm flex gap-3">
                                            <span className="font-bold text-rose-300">0{i + 1}</span>
                                            {point}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-lg font-black flex items-center gap-2 text-gray-900">
                                    <HelpCircle className="h-5 w-5 text-amber-500" />
                                    Preguntas de la Audiencia
                                </h4>
                                <div className="grid gap-3 text-sm italic text-gray-600 bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                                    {(result.questions || []).map((q, i) => (
                                        <div key={i} className="flex gap-2">
                                            <span className="text-amber-400">"</span>
                                            <span>{q}</span>
                                            <span className="text-amber-400">"</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Not Recommended Block */}
                            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-3">
                                <h4 className="text-sm font-bold uppercase text-rose-700 flex items-center gap-2 tracking-wider">
                                    <Ban className="h-4 w-4" /> No recomendado si:
                                </h4>
                                <ul className="space-y-2">
                                    {(result.not_recommended_if || []).map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-semibold text-rose-800/70">
                                            <div className="h-1 w-1 rounded-full bg-rose-300" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>


                        {/* Actionable Angles */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-black flex items-center gap-2 text-gray-900">
                                <Lightbulb className="h-5 w-5 text-emerald-500" />
                                Estrategia de Contenido
                            </h4>
                            <div className="space-y-4">
                                {result.content_angles.map((angle, i) => (
                                    <Card key={i} className="border-2 border-gray-100 shadow-lg hover:border-emerald-200 transition-all group overflow-hidden">
                                        <div className="bg-emerald-50 p-2 text-[10px] font-black uppercase text-emerald-700 tracking-widest border-b border-emerald-100 flex justify-between items-center px-4">
                                            <span>Format: {angle.format}</span>
                                            <span className={`px-2 py-0.5 rounded-full ${angle.complexity === 'avanzado' ? 'bg-emerald-200' : 'bg-white'}`}>
                                                {angle.complexity}
                                            </span>
                                        </div>
                                        <CardContent className="p-6 space-y-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Hook Recomendado</p>
                                            <p className="text-base font-black text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                                                {angle.hook}
                                            </p>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {angle.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Final CTA Card */}
                    <Card className="border-0 bg-blue-600 text-white shadow-2xl relative overflow-hidden rounded-[2rem]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        <CardContent className="p-12 text-center space-y-6 relative z-10">
                            <h3 className="text-4xl font-black leading-tight">
                                Toma decisiones basadas en señales,<br />no en intuición.
                            </h3>
                            <p className="text-blue-100 max-w-2xl mx-auto text-lg font-medium">
                                Guarda este análisis y accede a herramientas avanzadas para equipos y monetización.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
                                <Button
                                    size="lg"
                                    className="bg-white text-blue-600 hover:bg-blue-50 py-7 px-10 rounded-2xl font-black text-lg transition-transform hover:scale-105"
                                    asChild
                                >
                                    <Link href="/auth/signup">
                                        Crear mi Cuenta Gratis
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/30 bg-white/5 text-white hover:bg-white/10 py-7 px-10 rounded-2xl font-black text-lg backdrop-blur-sm"
                                    onClick={onReset}
                                >
                                    <RefreshCw className="mr-2 h-5 w-5" />
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
