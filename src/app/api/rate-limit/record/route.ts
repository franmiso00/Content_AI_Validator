// src/app/api/rate-limit/record/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FREE_LIMIT = 3;
const EARLY_ADOPTER_LIMIT = 8; // 3 + 5 bonus

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await request.json();
        const supabase = await createClient();

        // Determine effective client ID
        const effectiveClientId = clientId ||
            `ip:${request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            request.headers.get("x-real-ip") ||
            "unknown"}`;

        // Check if this client is an early adopter (in DB)
        const { data: earlyAdopterData } = await supabase
            .from("early_adopters")
            .select("id")
            .eq("client_id", effectiveClientId)
            .single();

        const limit = earlyAdopterData ? EARLY_ADOPTER_LIMIT : FREE_LIMIT;

        // Get current usage count
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count } = await supabase
            .from("anonymous_usage")
            .select("*", { count: "exact", head: true })
            .eq("client_id", effectiveClientId)
            .gte("created_at", thirtyDaysAgo.toISOString());

        const currentCount = count || 0;

        // Check if limit exceeded
        if (currentCount >= limit) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    used: currentCount,
                    limit,
                    isEarlyAdopter: !!earlyAdopterData
                },
                { status: 429 }
            );
        }

        console.log("SERVER_RECORD: Intentando grabar en DB...");

        // Record the usage - Using RPC as it is more robust (bypasses RLS via SECURITY DEFINER)
        const { error: rpcError } = await supabase.rpc("record_anonymous_usage", {
            p_client_id: effectiveClientId,
            p_action: "validation",
            p_metadata: {
                userAgent: request.headers.get("user-agent"),
                timestamp: new Date().toISOString()
            }
        });

        if (rpcError) {
            console.error("SERVER_RECORD: Error en RPC Supabase:", rpcError);

            // Fallback to standard insert if RPC fails for some reason
            const { error: insertError } = await supabase
                .from("anonymous_usage")
                .insert({
                    client_id: effectiveClientId,
                    action: "validation",
                    metadata: {
                        userAgent: request.headers.get("user-agent"),
                        timestamp: new Date().toISOString()
                    }
                });

            if (insertError) {
                console.error("SERVER_RECORD: Error en insert fallback:", insertError);
                return NextResponse.json({
                    error: "Failed to record usage",
                    details: insertError.message
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            used: currentCount + 1,
            remaining: limit - (currentCount + 1),
            limit
        });

    } catch (error) {
        console.error("Rate limit record error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
