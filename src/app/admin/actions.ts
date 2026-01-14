"use server";

import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = [process.env.ADMIN_EMAIL || "fran@franmillan.com"];

export async function checkAdminAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const allowedEmails = [
        "fran@franmillan.com",
        "fran@franmillan.es",
        "smjf2000@gmail.com", // Adding user for testing
        process.env.ADMIN_EMAIL
    ].filter(Boolean).map(e => e?.toLowerCase());

    const userEmail = user?.email?.toLowerCase();

    console.log("Admin Check - Current User:", userEmail);
    console.log("Admin Check - Allowed:", allowedEmails);

    if (!userEmail) return false;
    return allowedEmails.includes(userEmail);
}

export async function getAdminStats() {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = await createClient();

    const [
        { count: validationsCount },
        { count: usersCount },
        { count: earlyAdoptersCount },
        { data: anonymousUsageData }
    ] = await Promise.all([
        supabase.from("anonymous_usage").select("*", { count: "exact", head: true }).eq("action", "validation"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("early_adopters").select("*", { count: "exact", head: true }),
        supabase.from("anonymous_usage").select("client_id")
    ]);

    // Calculate unique anonymous users
    const uniqueClients = new Set(anonymousUsageData?.map(u => u.client_id));
    const anonymousUsersCount = uniqueClients.size;

    // Calculate conversion rate (Waitlist / Anonymous Users)
    const conversionRate = anonymousUsersCount > 0
        ? ((earlyAdoptersCount || 0) / anonymousUsersCount) * 100
        : 0;

    return {
        validationsCount: validationsCount || 0,
        usersCount: usersCount || 0,
        earlyAdoptersCount: earlyAdoptersCount || 0,
        anonymousUsersCount,
        conversionRate,
    };
}

export async function getRecentValidations() {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("validations")
        .select("id, input_idea, input_audience, demand_score, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    return data;
}

export async function getEarlyAdopters() {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("early_adopters")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;
    return data;
}

export async function getUsers() {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;
    return data;
}

export async function getValidationsPerDay() {
    // This is a simplified version. Ideally we do this aggregation in SQL or a stored procedure.
    // For now we fetch last 30 days and aggregate in JS to avoid complex raw SQL queries if not needed.
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = await createClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
        .from("anonymous_usage")
        .select("created_at")
        .eq("action", "validation")
        .gte("created_at", thirtyDaysAgo.toISOString());

    if (error) throw error;

    const counts: Record<string, number> = {};
    data.forEach((v) => {
        const date = new Date(v.created_at).toLocaleDateString();
        counts[date] = (counts[date] || 0) + 1;
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
}
