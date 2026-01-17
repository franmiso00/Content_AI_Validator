"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
    Target,
    Zap,
    Award,
    Users,
    Briefcase,
    Info,
    CheckCircle2
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Define the Use Cases
export const USE_CASES = [
    { id: "leads", icon: Target },
    { id: "conversion", icon: Zap },
    { id: "authority", icon: Award },
    { id: "retention", icon: Users },
    { id: "clients", icon: Briefcase },
] as const;

export type UseCaseId = typeof USE_CASES[number]["id"];

interface OutcomeEntrySectionProps {
    onSelect: (useCase: UseCaseId) => void;
    selectedUseCase?: string;
}

export function OutcomeEntrySection({ onSelect }: OutcomeEntrySectionProps) {
    const t = useTranslations("landing.outcome");
    const tHero = useTranslations("landing.hero");

    const [activeId, setActiveId] = useState<UseCaseId>("leads");
    const [isAutoRotating, setIsAutoRotating] = useState(true);
    const [hasSelected, setHasSelected] = useState(false);
    const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Stop rotation on interaction
    const stopRotation = () => {
        if (isAutoRotating) {
            setIsAutoRotating(false);
            if (rotationIntervalRef.current) {
                clearInterval(rotationIntervalRef.current);
            }
        }
    };

    // Handle manual selection
    const handleSelect = (id: UseCaseId) => {
        stopRotation();
        setActiveId(id);
        setHasSelected(true);
        onSelect(id);
    };

    // Auto-rotation effect
    useEffect(() => {
        if (!isAutoRotating || hasSelected) return;

        rotationIntervalRef.current = setInterval(() => {
            setActiveId((current) => {
                const currentIndex = USE_CASES.findIndex(u => u.id === current);
                const nextIndex = (currentIndex + 1) % USE_CASES.length;
                return USE_CASES[nextIndex].id;
            });
        }, 1500); // Speed increased to 1.5s

        return () => {
            if (rotationIntervalRef.current) {
                clearInterval(rotationIntervalRef.current);
            }
        };
    }, [isAutoRotating, hasSelected]);

    return (
        <div className="w-full max-w-5xl mx-auto mb-12 space-y-8">
            {/* 1. Dynamic Title & Header */}
            <div className="text-center space-y-6">

                {/* Badge/Banner */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-bold tracking-wide uppercase animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="h-4 w-4" />
                    {tHero("badge")}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                    {t("prefix")}{" "}
                    <span
                        key={activeId} // Key change triggers animation
                        className={cn(
                            "inline-block bg-clip-text text-transparent bg-gradient-to-r",
                            "animate-in fade-in slide-in-from-bottom-2 duration-500",
                            {
                                "from-sky-500 to-blue-600": activeId === "leads",
                                "from-amber-500 to-orange-600": activeId === "conversion",
                                "from-purple-500 to-indigo-600": activeId === "authority",
                                "from-emerald-500 to-teal-600": activeId === "retention",
                                "from-rose-500 to-pink-600": activeId === "clients",
                            }
                        )}
                    >
                        {t(`title.${activeId}`)}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    {tHero("subtitle")}
                </p>
            </div>

            {/* 2. Use Case Selector (Cards) */}
            <div
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
                onMouseEnter={stopRotation} // Stop on hover over the container
                onTouchStart={stopRotation}
            >
                {USE_CASES.map((useCase) => (
                    <UseCaseCard
                        key={useCase.id}
                        id={useCase.id}
                        icon={useCase.icon}
                        isActive={activeId === useCase.id}
                        onSelect={() => handleSelect(useCase.id)}
                        isSelected={hasSelected && activeId === useCase.id}
                    />
                ))}
            </div>
        </div>
    );
}

// Inner Component for individual cards
function UseCaseCard({
    id,
    icon: Icon,
    isActive,
    onSelect,
    isSelected
}: {
    id: UseCaseId;
    icon: any;
    isActive: boolean;
    onSelect: () => void;
    isSelected: boolean;
}) {
    const t = useTranslations("landing.outcome");

    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-1 bg-white",
                isActive
                    ? "border-sky-500 shadow-md ring-2 ring-sky-500/10 scale-105 md:scale-105 z-10"
                    : "border-slate-100 hover:border-sky-200 text-slate-500"
            )}
        >
            <div className="flex flex-col h-full space-y-3">
                <div className="flex justify-between items-start">
                    <div className={cn(
                        "p-2 rounded-lg transition-colors",
                        isActive ? "bg-sky-50 text-sky-600" : "bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>

                    {/* Info Tooltip */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <TooltipProvider>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <button className="text-slate-300 hover:text-sky-500 transition-colors">
                                        <Info className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs p-4 bg-slate-900 border-slate-800 text-slate-100">
                                    <div className="space-y-3 text-xs">
                                        <div>
                                            <span className="font-bold text-sky-400 block mb-1">{t("tooltip_labels.what")}</span>
                                            {t(`cards.${id}.tooltip.what`)}
                                        </div>
                                        <div>
                                            <span className="font-bold text-sky-400 block mb-1">{t("tooltip_labels.when")}</span>
                                            {t(`cards.${id}.tooltip.when`)}
                                        </div>
                                        <div>
                                            <span className="font-bold text-rose-400 block mb-1">{t("tooltip_labels.not_when")}</span>
                                            {t(`cards.${id}.tooltip.not_when`)}
                                        </div>
                                        <div className="pt-2 border-t border-slate-700">
                                            <span className="font-bold text-slate-400 block mb-1">{t("tooltip_labels.examples")}</span>
                                            <span className="text-slate-400 italic">{t(`cards.${id}.tooltip.examples`)}</span>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div>
                    <h3 className={cn(
                        "font-bold text-sm mb-1 transition-colors",
                        isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                    )}>
                        {t(`cards.${id}.title`)}
                    </h3>
                    <p className="text-xs text-slate-500 leading-snug">
                        {t(`cards.${id}.desc`)}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Check utils import - assuming "@/lib/utils" exists as it's standard in shadcn/ui.
