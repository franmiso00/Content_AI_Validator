// src/app/api/rate-limit/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await request.json();

        if (!clientId) {
            // Fallback to IP-based identification
            const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                request.headers.get("x-real-ip") ||
                "unknown";

            return NextResponse.json({
                used: await getUsageCount(`ip:${ip}`),
                clientId: `ip:${ip}`
            });
        }

        const used = await getUsageCount(clientId);

        return NextResponse.json({ used, clientId });
    } catch (error) {
        console.error("Rate limit check error:", error);
        return NextResponse.json({ used: 0 }, { status: 200 });
    }
}

async function getUsageCount(clientId: string): Promise<number> {
    const supabase = await createClient();

    // Get usage from last 30 days (or adjust as needed)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count, error } = await supabase
        .from("anonymous_usage")
        .select("*", { count: "exact", head: true })
        .eq("client_id", clientId)
        .gte("created_at", thirtyDaysAgo.toISOString());

    if (error) {
        console.error("Error fetching usage:", error);
        return 0;
    }

    return count || 0;
}
