// src/components/early-adopter/ValidationCounter.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ValidationCounterProps {
    remaining: number;
    total: number;
    isEarlyAdopter: boolean;
    onUpgradeClick?: () => void;
}

export function ValidationCounter({
    remaining,
    total,
    isEarlyAdopter,
    onUpgradeClick,
}: ValidationCounterProps) {
    const t = useTranslations("earlyAdopter.counter");
    const percentage = (remaining / total) * 100;

    return (
        <div className="flex items-center gap-3">
            {/* Counter badge */}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                {/* Progress indicator */}
                <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                        <circle
                            className="text-gray-200"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="transparent"
                            r="15"
                            cx="18"
                            cy="18"
                        />
                        <circle
                            className={`${remaining === 0 ? 'text-red-500' : remaining <= 1 ? 'text-amber-500' : 'text-blue-500'} transition-all duration-500`}
                            strokeWidth="3"
                            strokeDasharray={`${percentage}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="15"
                            cx="18"
                            cy="18"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                        {remaining}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className={`text-sm font-medium ${remaining === 0 ? "text-red-600" : remaining <= 1 ? "text-amber-600" : "text-gray-600"
                        }`}>
                        {remaining === 0 ? (
                            t("noValidations")
                        ) : (
                            <>
                                {remaining} {t("of")} {total}
                            </>
                        )}
                    </span>
                    <span className="text-xs text-gray-400">
                        {isEarlyAdopter ? t("earlyAdopter") : t("freePlan")}
                    </span>
                </div>
            </div>

            {/* Early adopter badge or upgrade button */}
            {isEarlyAdopter ? (
                <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300 px-3 py-1"
                >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {t("earlyAdopter")}
                </Badge>
            ) : remaining <= 1 && onUpgradeClick ? (
                <button
                    onClick={onUpgradeClick}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                >
                    <AlertTriangle className="w-3 h-3" />
                    {t("upgrade")}
                </button>
            ) : null}
        </div>
    );
}
