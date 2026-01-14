"use client";

import { HelpCircle, AlertCircle, ArrowRight, Lightbulb } from "lucide-react";

interface ReformulationSuggestion {
    type: 'broader_terms' | 'alternative_keywords' | 'different_angle' | 'other_sources';
    suggestion: string;
    example?: string;
}

interface VerdictIndeterminateProps {
    conversationsCount: number;
    originalQuery: string;
    suggestions: ReformulationSuggestion[];
    onReformulate: (newQuery: string) => void;
}

export function VerdictIndeterminate({
    conversationsCount,
    originalQuery,
    suggestions,
    onReformulate
}: VerdictIndeterminateProps) {
    return (
        <div className="space-y-6">
            {/* Header con estado */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-10 space-y-6 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-50 rounded-full blur-3xl"></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                        <HelpCircle className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            Datos Insuficientes
                        </h3>
                        <p className="text-sm text-slate-500 font-bold mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span> Basado en {conversationsCount} conversaciones
                        </p>
                    </div>
                </div>

                {/* Barra de confianza vacía */}
                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Confianza del análisis</span>
                        <span>0%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                        <div className="h-full w-0 bg-slate-300 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Explicación */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl shadow-slate-900/5">
                <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        ¿Por qué no podemos validar?
                    </h4>
                    <p className="text-lg font-bold text-slate-900">
                        No encontramos conversaciones reales sobre este tema en las plataformas analizadas.
                    </p>
                </div>

                <div className="grid gap-4">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        Esto puede significar:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3">
                        {[
                            "El tema es muy nuevo o emergente",
                            "Términos de búsqueda demasiado específicos",
                            "Nicho muy pequeño o disperso",
                            "Tu audiencia usa otro lenguaje"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sugerencias de reformulación */}
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-xl shadow-sky-900/5">
                <div className="space-y-2">
                    <h4 className="text-xs font-black text-sky-600 uppercase tracking-widest flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Paso recomendado
                    </h4>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                        Prueba reformulando tu idea
                    </p>
                </div>

                <div className="grid gap-4">
                    {suggestions && suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onReformulate(suggestion.example || suggestion.suggestion)}
                            className="w-full text-left p-6 bg-white hover:shadow-xl hover:shadow-sky-900/10 border border-sky-100 rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                        {suggestion.suggestion}
                                    </p>
                                    {suggestion.example && (
                                        <p className="text-base font-bold text-sky-600">
                                            "{suggestion.example}"
                                        </p>
                                    )}
                                </div>
                                <div className="p-3 bg-sky-50 rounded-xl text-sky-500 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CTA alternativo */}
            <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-3xl">
                <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">
                    ¿Quieres profundizar en un nicho específico?
                </p>
                <button className="inline-flex items-center gap-2 text-sm font-black text-sky-600 hover:text-sky-700 underline underline-offset-4 decoration-sky-300">
                    Contactar con soporte para análisis a medida <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
