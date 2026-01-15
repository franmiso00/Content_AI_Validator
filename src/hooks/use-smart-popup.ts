"use client";

import { useState, useEffect, useCallback } from "react";

interface SmartPopupProps {
    isLimited: boolean;
    isEarlyAdopter: boolean;
    isValidating: boolean; // Don't interrupt user while they are waiting for results
    onTrigger: () => void;
}

export function useSmartPopup({
    isLimited,
    isEarlyAdopter,
    isValidating,
    onTrigger,
}: SmartPopupProps) {
    const [timeSpent, setTimeSpent] = useState(false);
    const [scrollDepth, setScrollDepth] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    // 1. Time on page trigger
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeSpent(true);
        }, 60000); // 60 seconds

        return () => clearTimeout(timer);
    }, []);

    // 2. Scroll depth trigger
    useEffect(() => {
        const handleScroll = () => {
            if (scrollDepth) return; // Optimization

            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

            if (scrollPercent >= 50) {
                setScrollDepth(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrollDepth]);

    // 3. Logic check
    useEffect(() => {
        if (hasTriggered) return;

        // Aggressive check: IF user is currently validating, absolutely DO NOT show popup
        if (isValidating) return;

        // Conditions to show:
        // - Time requirement met
        // - Scroll requirement met
        // - Not limited (if limited, they see modal by action)
        // - Not already an early adopter
        if (timeSpent && scrollDepth && !isLimited && !isEarlyAdopter) {

            // Persistence checks
            const isDismissedThisSession = sessionStorage.getItem("valio_popup_dismissed");
            const isRegisteredEver = localStorage.getItem("valio_early_access_registered");

            if (!isDismissedThisSession && !isRegisteredEver) {
                setHasTriggered(true);
                onTrigger();
            }
        }
    }, [
        timeSpent,
        scrollDepth,
        isLimited,
        isEarlyAdopter,
        isValidating,
        hasTriggered,
        onTrigger
    ]);

    const markAsDismissed = useCallback(() => {
        sessionStorage.setItem("valio_popup_dismissed", "true");
    }, []);

    return {
        markAsDismissed
    };
}
