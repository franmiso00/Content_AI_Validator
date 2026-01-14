"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ArrowRight,
    Loader2,
    Sparkles,
    FileText,
    Mail,
    Video,
    Smartphone,
    MessageSquare,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Target,
    Users,
    Zap,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ValidationInput {
    topic: string;
    audience: string;
    contentType: string;
    objective: string;
    audienceLevel: string;
}

interface HeroProps {
    onValidate: (data: ValidationInput) => void;
    isValidating: boolean;
    initialTopic?: string;
}

const TOPIC_EXAMPLES = [
    "Uso de IA en despachos de abogados",
    "Newsletters para dentistas con práctica",
    "Automatización para agencias de marketing",
    "Escalar un SaaS de 0 a 10k MRR"
];

const AUDIENCE_EXAMPLES = [
    "Abogados", "Agencias", "Coaches", "SaaS founders", "Salud"
];

const CONTENT_TYPES = [
    { id: "article", label: "Artículo", icon: FileText },
    { id: "newsletter", label: "Newsletter", icon: Mail },
    { id: "video-long", label: "Video Largo", icon: Video },
    { id: "video-short", label: "Shorts/Reels", icon: Smartphone },
    { id: "social", label: "Social Media", icon: MessageSquare },
    { id: "guide", label: "Guía/Ebook", icon: BookOpen },
];

const OBJECTIVES = [
    { id: "leads", label: "🎯 Leads", color: "bg-sky-50 text-sky-700 border-sky-200" },
    { id: "sales", label: "💼 Vender", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "authority", label: "🧠 Autoridad", color: "bg-slate-100 text-slate-700 border-slate-200" },
    { id: "awareness", label: "📣 Alcance", color: "bg-amber-50 text-amber-700 border-amber-200" },
];

const AUDIENCE_LEVELS = [
    { id: "beginner", label: "Principiante" },
    { id: "intermediate", label: "Intermedio" },
    { id: "advanced", label: "Avanzado" },
];

export function Hero({ onValidate, isValidating, initialTopic = "" }: HeroProps) {
    const [topic, setTopic] = useState(initialTopic);

    useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
        }
    }, [initialTopic]);

    const [audience, setAudience] = useState("");
    const [contentType, setContentType] = useState("article");
    const [objective, setObjective] = useState("authority");
    const [audienceLevel, setAudienceLevel] = useState("intermediate");
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [loadingMessage, setLoadingMessage] = useState("Analizando...");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            const messages = [
                "Escaneando Reddit...",
                "Identificando dolores...",
                "Analizando demanda...",
                "Generando insights...",
                "Casi listo..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                setLoadingMessage(messages[i % messages.length]);
                i++;
            }, 2500);

            onValidate({
                topic,
                audience,
                contentType,
                objective,
                audienceLevel
            });

            setTimeout(() => clearInterval(interval), 30000);
        }
    };

    return (
        <section id="validate-form" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 pb-16 bg-slate-50">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-sky-500/5 to-transparent rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-sky-100 px-4 py-2 rounded-full text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Validación basada en señales, no en intuición
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                            Deja de crear contenido<br />
                            <span className="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">que nadie busca</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Analizamos señales de demanda real en comunidades activas para que valides tu idea antes de invertir tiempo en crearla.
                        </p>
                    </div>

                    <Card className="border border-slate-200 shadow-xl shadow-slate-900/5 bg-white rounded-3xl overflow-hidden max-w-3xl mx-auto">
                        <CardContent className="p-6 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-8 text-left text-slate-900">
                                {/* 1. Topic */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-sky-500" />
                                        1. ¿Cuál es tu idea o tema principal?
                                    </label>
                                    <Input
                                        className="text-lg px-4 py-6 border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl bg-slate-50 transition-all duration-200"
                                        placeholder="Ej: Cómo crear newsletters para abogados que usan IA"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        disabled={isValidating}
                                        required
                                    />
                                    <div className="flex flex-wrap gap-2">
                                        {TOPIC_EXAMPLES.map((ex, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setTopic(ex)}
                                                className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full hover:bg-sky-100 hover:text-sky-700 transition-colors"
                                            >
                                                {ex}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Content Type */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-sky-500" />
                                        2. Tipo de contenido
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {CONTENT_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            const isActive = contentType === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setContentType(type.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all font-semibold text-sm ${isActive
                                                        ? "border-sky-500 bg-sky-50 text-sky-700"
                                                        : "border-slate-100 bg-white text-slate-500 hover:border-sky-100"
                                                        }`}
                                                >
                                                    <Icon className={`h-4 w-4 ${isActive ? "text-sky-500" : "text-slate-400"}`} />
                                                    {type.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Audience */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="h-4 w-4 text-sky-500" />
                                        3. ¿Para quién es este contenido?
                                    </label>
                                    <Input
                                        className="text-base px-4 py-5 border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl bg-slate-50 transition-all duration-200"
                                        placeholder="Ej: Dentistas con clínica propia preocupados por la eficiencia"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        disabled={isValidating}
                                    />
                                </div>

                                {/* Advanced Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors uppercase tracking-widest"
                                >
                                    {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    {showAdvanced ? "Ocultar avanzados" : "Opciones avanzadas"}
                                </button>

                                {showAdvanced && (
                                    <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    Objetivo
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {OBJECTIVES.map((obj) => (
                                                        <button
                                                            key={obj.id}
                                                            type="button"
                                                            onClick={() => setObjective(obj.id)}
                                                            className={`p-2 rounded-lg border-2 transition-all font-bold text-[10px] ${objective === obj.id
                                                                ? `${obj.color} border-current`
                                                                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                                                }`}
                                                        >
                                                            {obj.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    Nivel Audiencia
                                                </label>
                                                <div className="flex gap-2">
                                                    {AUDIENCE_LEVELS.map((level) => (
                                                        <button
                                                            key={level.id}
                                                            type="button"
                                                            onClick={() => setAudienceLevel(level.id)}
                                                            className={`flex-1 p-2 rounded-lg border-2 transition-all font-bold text-[10px] ${audienceLevel === level.id
                                                                ? "border-slate-900 bg-slate-900 text-white"
                                                                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                                                }`}
                                                        >
                                                            {level.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-lg h-16 rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-200 font-bold border-0"
                                    disabled={isValidating || !topic.trim()}
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {loadingMessage}
                                        </>
                                    ) : (
                                        <>
                                            Validar Idea
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-8 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        <Zap className="h-3 w-3 text-sky-500" />
                                        3 Pruebas Gratis
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        <Target className="h-3 w-3 text-sky-500" />
                                        Datos Reales
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        <Sparkles className="h-3 w-3 text-sky-500" />
                                        Sin Registro
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
