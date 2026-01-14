import { NextRequest, NextResponse } from "next/server";
import { validateIdea as perplexityValidate } from "@/lib/perplexity";

// La lógica de rate limiting ahora se maneja vía Supabase y el endpoint /api/rate-limit

export async function POST(req: NextRequest) {
    try {
        // El control de acceso (isLimited) se realiza ahora en el frontend antes de llamar a este endpoint.
        // No obstante, si el cliente pasa un clientId, el sistema de grabación en el frontend
        // se encargará de persistir el uso.

        const { topic, audience, contentType, objective, audienceLevel } = await req.json();

        if (!topic || topic.trim().length === 0) {
            return NextResponse.json(
                { error: "Topic is required" },
                { status: 400 }
            );
        }

        // Call Perplexity
        const result = await perplexityValidate({
            topic,
            audience,
            contentType,
            objective,
            audienceLevel
        });

        return NextResponse.json({
            ...result,
            remaining_validations: 0, // El contador real se gestiona en el frontend ahora
        });
    } catch (error: any) {
        console.error("[validate-demo] Error:", error);
        console.error("[validate-demo] Error message:", error?.message);
        console.error("[validate-demo] Error stack:", error?.stack);

        return NextResponse.json(
            {
                error: "Failed to validate idea. Please try again.",
                details: process.env.NODE_ENV === "development" ? error?.message : undefined
            },
            { status: 500 }
        );
    }
}
