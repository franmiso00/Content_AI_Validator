"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import { trackEvent } from "@/lib/analytics";
import { OutcomeEntrySection, UseCaseId } from "./OutcomeEntrySection";

interface ValidationInput {
    topic: string;
    audience: string;
    contentType: string;
    objective: string;
    audienceLevel: string;
    useCase?: string;
}

interface HeroProps {
    onValidate: (data: ValidationInput) => void;
    isValidating: boolean;
    initialTopic?: string;
}



const CONTENT_TYPES = [
    { id: "article", labelKey: "types.article", icon: FileText },
    { id: "newsletter", labelKey: "types.newsletter", icon: Mail },
    { id: "video-long", labelKey: "types.video-long", icon: Video },
    { id: "video-short", labelKey: "types.video-short", icon: Smartphone },
    { id: "social", labelKey: "types.social", icon: MessageSquare },
    { id: "guide", labelKey: "types.guide", icon: BookOpen },
];



const AUDIENCE_LEVELS = [
    { id: "beginner", labelKey: "levels.beginner" },
    { id: "intermediate", labelKey: "levels.intermediate" },
    { id: "advanced", labelKey: "levels.advanced" },
];



export function Hero({ onValidate, isValidating, initialTopic = "" }: HeroProps) {
    const t = useTranslations("landing.hero");
    const tCommon = useTranslations("common");
    const tOutcome = useTranslations("landing.outcome");
    const TOPIC_EXAMPLES = t.raw("examples.topics") as string[];
    const AUDIENCE_EXAMPLES = t.raw("examples.audiences") as string[];
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
    const [useCase, setUseCase] = useState<UseCaseId>("leads");

    // Sync objective with useCase to ensure backend compatibility
    useEffect(() => {
        switch (useCase) {
            case "leads":
                setObjective("leads");
                break;
            case "conversion":
            case "clients":
                setObjective("sales");
                break;
            case "authority":
            case "retention":
                setObjective("authority");
                break;
            default:
                setObjective("authority");
        }
    }, [useCase]);

    // Dynamic placeholders based on useCase
    const getPlaceholder = (uc: string) => {
        // @ts-ignore - Dynamic key access
        return tOutcome(`placeholders.${uc}`);
    };

    const [loadingMessage, setLoadingMessage] = useState(t("form.validating"));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            trackEvent({
                action: 'validate_idea_attempt',
                category: 'validation',
                label: contentType,
                topic_length: topic.length,
                objective: objective,
                audience_level: audienceLevel
            });

            const messages = t.raw("form.loadingMessages") as string[];
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
                audienceLevel,
                useCase
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
                    <OutcomeEntrySection
                        onSelect={(uc) => setUseCase(uc)}
                        selectedUseCase={useCase}
                    />

                    <Card className="border border-slate-200 shadow-xl shadow-slate-900/5 bg-white rounded-3xl overflow-hidden max-w-3xl mx-auto">
                        <CardContent className="p-6 md:p-10">
                            <form onSubmit={handleSubmit} className="space-y-8 text-left text-slate-900">
                                {/* 1. Topic */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-sky-500" />
                                        {t("form.step1")}
                                    </label>
                                    <Input
                                        className="text-lg px-4 py-6 border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl bg-slate-50 transition-all duration-200"
                                        placeholder={getPlaceholder(useCase)}
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
                                        {t("form.step2")}
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
                                                    {t(type.labelKey)}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 3. Audience */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users className="h-4 w-4 text-sky-500" />
                                        {t("form.step3")}
                                    </label>
                                    <Input
                                        className="text-base px-4 py-5 border-2 border-slate-100 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 rounded-xl bg-slate-50 transition-all duration-200"
                                        placeholder={t("form.audiencePlaceholder")}
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
                                    {showAdvanced ? t("form.hideAdvanced") : t("form.advancedOptions")}
                                </button>

                                {showAdvanced && (
                                    <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                {t("form.audienceLevel")}
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
                                                        {t(level.labelKey)}
                                                    </button>
                                                ))}
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
                                            {t("form.validateButton")}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-8 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        <Zap className="h-3 w-3 text-sky-500" />
                                        {tCommon("freeTrials")}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        <Target className="h-3 w-3 text-sky-500" />
                                        {tCommon("realData")}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                        <Sparkles className="h-3 w-3 text-sky-500" />
                                        {tCommon("noRegistration")}
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
