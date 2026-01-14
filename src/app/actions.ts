
"use server";

import { createClient } from "@/lib/supabase/server";
import { validateIdea as perplexityValidate } from "@/lib/perplexity"; // The function we created earlier
import { revalidatePath } from "next/cache";

export async function validateIdea(topic: string, audience?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    // 1. Call Perplexity
    const result = await perplexityValidate({
        topic,
        audience: audience || "",
        contentType: "article",
        objective: "authority",
        audienceLevel: "intermediate"
    });

    // 2. Save to Supabase
    const { data, error } = await supabase
        .from("validations")
        .insert({
            user_id: user.id,
            input_idea: topic,
            input_audience: audience,
            demand_score: result.demand_score,
            demand_summary: result.demand_summary,
            pain_points: result.pain_points, // Ensure DB has jsonb type
            questions: result.questions,
            content_angles: result.content_angles,
        })
        .select()
        .single();

    if (error) {
        console.error("DB Insert Error:", error);
        throw new Error("Failed to save validation");
    }

    revalidatePath("/dashboard");
    return data;
}
