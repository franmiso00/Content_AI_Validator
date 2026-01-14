// src/hooks/use-validation-limit.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useClientFingerprint, isEarlyAdopter, markAsEarlyAdopter } from "./use-client-fingerprint";

const FREE_LIMIT = 3;
const EARLY_ADOPTER_BONUS = 5;

interface ValidationLimitState {
    remaining: number;
    total: number;
    isLimited: boolean;
    isLoading: boolean;
    isEarlyAdopter: boolean;
}

export function useValidationLimit() {
    const { fingerprint, isLoading: fingerprintLoading } = useClientFingerprint();
    const [state, setState] = useState<ValidationLimitState>({
        remaining: FREE_LIMIT,
        total: FREE_LIMIT,
        isLimited: false,
        isLoading: true,
        isEarlyAdopter: false,
    });

    // Fetch current usage on mount
    useEffect(() => {
        if (!fingerprint || fingerprintLoading) return;

        const fetchUsage = async () => {
            try {
                const earlyAdopter = isEarlyAdopter();
                const response = await fetch("/api/rate-limit/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ clientId: fingerprint }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const total = earlyAdopter ? FREE_LIMIT + EARLY_ADOPTER_BONUS : FREE_LIMIT;
                    const remaining = Math.max(0, total - data.used);

                    setState({
                        remaining,
                        total,
                        isLimited: remaining <= 0,
                        isLoading: false,
                        isEarlyAdopter: earlyAdopter,
                    });
                }
            } catch (error) {
                console.error("Failed to check rate limit:", error);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        fetchUsage();
    }, [fingerprint, fingerprintLoading]);

    // Decrement usage after a validation
    const recordUsage = useCallback(async () => {
        if (!fingerprint) return;

        try {
            const response = await fetch("/api/rate-limit/record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: fingerprint }),
            });

            if (response.ok) {
                setState(prev => {
                    const newRemaining = Math.max(0, prev.remaining - 1);
                    return {
                        ...prev,
                        remaining: newRemaining,
                        isLimited: newRemaining <= 0,
                    };
                });
            }
        } catch (error) {
            console.error("Failed to record usage:", error);
        }
    }, [fingerprint]);

    // Grant early adopter bonus
    const grantEarlyAdopterBonus = useCallback(async () => {
        markAsEarlyAdopter();

        setState(prev => ({
            ...prev,
            remaining: prev.remaining + EARLY_ADOPTER_BONUS,
            total: prev.total + EARLY_ADOPTER_BONUS,
            isLimited: false,
            isEarlyAdopter: true,
        }));
    }, []);

    return {
        ...state,
        fingerprint,
        recordUsage,
        grantEarlyAdopterBonus,
    };
}
