import { NextRequest, NextResponse } from "next/server";
import { validateIdea as perplexityValidate } from "@/lib/perplexity";

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: NextRequest): string {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const limit = rateLimitMap.get(key);

    if (!limit || now > limit.resetTime) {
        // Reset or create new limit (5 requests per hour)
        rateLimitMap.set(key, {
            count: 1,
            resetTime: now + 60 * 60 * 1000, // 1 hour
        });
        return { allowed: true, remaining: 4 };
    }

    if (limit.count >= 5) {
        return { allowed: false, remaining: 0 };
    }

    limit.count++;
    return { allowed: true, remaining: 5 - limit.count };
}

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const rateLimitKey = getRateLimitKey(req);
        const { allowed, remaining } = checkRateLimit(rateLimitKey);

        if (!allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Please sign up for unlimited validations." },
                { status: 429 }
            );
        }

        const { topic, audience } = await req.json();

        if (!topic || topic.trim().length === 0) {
            return NextResponse.json(
                { error: "Topic is required" },
                { status: 400 }
            );
        }

        // Call Perplexity
        const result = await perplexityValidate(topic, audience);

        return NextResponse.json({
            ...result,
            remaining_validations: remaining,
        });
    } catch (error) {
        console.error("Demo validation error:", error);
        return NextResponse.json(
            { error: "Failed to validate idea. Please try again." },
            { status: 500 }
        );
    }
}
