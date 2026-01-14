// src/hooks/use-client-fingerprint.ts
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cv_client_id";

/**
 * Generates a semi-persistent client fingerprint without cookies.
 * Uses a combination of browser characteristics + localStorage.
 * This is for rate limiting, not tracking users across sites.
 */
export function useClientFingerprint() {
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateFingerprint = async () => {
            // Check localStorage first
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setFingerprint(stored);
                setIsLoading(false);
                return;
            }

            // Generate new fingerprint
            const fp = await createFingerprint();
            localStorage.setItem(STORAGE_KEY, fp);
            setFingerprint(fp);
            setIsLoading(false);
        };

        generateFingerprint();
    }, []);

    return { fingerprint, isLoading };
}

async function createFingerprint(): Promise<string> {
    const components: string[] = [];

    // 1. Canvas fingerprint (most reliable)
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Valio.pro", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Valio.pro", 4, 17);
            components.push(canvas.toDataURL());
        }
    } catch {
        components.push("canvas-error");
    }

    // 2. WebGL renderer
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl && gl instanceof WebGLRenderingContext) {
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (debugInfo) {
                components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "");
                components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "");
            }
        }
    } catch {
        components.push("webgl-error");
    }

    // 3. Screen properties
    components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
    components.push(String(screen.pixelDepth));

    // 4. Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // 5. Language
    components.push(navigator.language);
    components.push(navigator.languages?.join(",") || "");

    // 6. Platform
    components.push(navigator.platform);

    // 7. Hardware concurrency
    components.push(String(navigator.hardwareConcurrency || 0));

    // 8. Device memory (if available)
    // @ts-ignore - deviceMemory is not in all browsers
    components.push(String(navigator.deviceMemory || 0));

    // 9. Touch support
    components.push(String(navigator.maxTouchPoints || 0));

    // Generate hash
    const hash = await hashString(components.join("|"));

    // Add timestamp component for uniqueness
    const timestamp = Date.now().toString(36);

    return `${hash}-${timestamp}`;
}

async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

/**
 * Utility to get the fingerprint synchronously if already stored
 */
export function getStoredFingerprint(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
}

/**
 * Mark that this client is an early adopter (increases limit)
 */
export function markAsEarlyAdopter() {
    if (typeof window === "undefined") return;
    localStorage.setItem("cv_early_adopter", "true");
}

/**
 * Check if client is early adopter
 */
export function isEarlyAdopter(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cv_early_adopter") === "true";
}
