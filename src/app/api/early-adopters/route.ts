// src/app/api/early-adopters/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface EarlyAdopterPayload {
    email: string;
    clientId: string;
    role: string;
    contentFrequency?: string;
    biggestChallenge: string;
    howDidYouFind?: string;
}

export async function POST(request: NextRequest) {
    try {
        const payload: EarlyAdopterPayload = await request.json();
        const supabase = await createClient();

        // Validate required fields
        if (!payload.email || !payload.clientId || !payload.role || !payload.biggestChallenge) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const { data: existingByEmail } = await supabase
            .from("early_adopters")
            .select("id, position")
            .eq("email", payload.email)
            .single();

        if (existingByEmail) {
            return NextResponse.json({
                success: true,
                alreadyExists: true,
                position: existingByEmail.position,
                message: "Ya estás en la lista de early adopters"
            });
        }

        // Check if clientId already exists (same device, different email)
        const { data: existingByClient } = await supabase
            .from("early_adopters")
            .select("id, email")
            .eq("client_id", payload.clientId)
            .single();

        if (existingByClient) {
            return NextResponse.json({
                success: true,
                alreadyExists: true,
                message: "Este dispositivo ya está registrado como early adopter"
            });
        }

        // Get current count for position
        const { count } = await supabase
            .from("early_adopters")
            .select("*", { count: "exact", head: true });

        const position = (count || 0) + 1;

        // Get IP for analytics
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            null;

        // Insert new early adopter
        const { data, error } = await supabase
            .from("early_adopters")
            .insert({
                email: payload.email.toLowerCase().trim(),
                client_id: payload.clientId,
                role: payload.role,
                content_frequency: payload.contentFrequency || null,
                biggest_challenge: payload.biggestChallenge,
                how_did_you_find: payload.howDidYouFind || null,
                position,
                ip_address: ip,
                user_agent: request.headers.get("user-agent"),
                metadata: {
                    source: "landing_page",
                    version: "1.0"
                }
            })
            .select()
            .single();

        if (error) {
            console.error("Error inserting early adopter:", error);

            // Handle unique constraint violation
            if (error.code === "23505") {
                return NextResponse.json({
                    success: true,
                    alreadyExists: true,
                    message: "Ya estás registrado"
                });
            }

            return NextResponse.json(
                { error: "Failed to register" },
                { status: 500 }
            );
        }

        // Return success with position
        return NextResponse.json({
            success: true,
            position,
            totalEarlyAdopters: position,
            bonusValidations: 5,
            message: "¡Bienvenido a la lista de early adopters!"
        });

    } catch (error) {
        console.error("Early adopter registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const clientId = searchParams.get("clientId");

        if (!email && !clientId) {
            return NextResponse.json(
                { error: "Email or clientId required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        let query = supabase
            .from("early_adopters")
            .select("position, created_at") as any;

        if (email) {
            query = query.eq("email", email.toLowerCase().trim());
        } else if (clientId) {
            query = query.eq("client_id", clientId);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            return NextResponse.json({ isEarlyAdopter: false });
        }

        // Get total count
        const { count } = await supabase
            .from("early_adopters")
            .select("*", { count: "exact", head: true });

        return NextResponse.json({
            isEarlyAdopter: true,
            position: data.position,
            totalEarlyAdopters: count || 0,
            joinedAt: data.created_at
        });

    } catch (error) {
        console.error("Early adopter check error:", error);
        return NextResponse.json({ isEarlyAdopter: false });
    }
}
