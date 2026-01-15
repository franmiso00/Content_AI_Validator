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

export async function getAnonymousUsersStats() {
    const isAdmin = await checkAdminAccess();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = await createClient();

    // Fetch all anonymous usage
    // Note: In a production app with millions of rows, this should be done via SQL View or RPC.
    // For now, we aggregate in JS.
    const { data: usageData, error: usageError } = await supabase
        .from("anonymous_usage")
        .select("client_id, created_at")
        .order('created_at', { ascending: false });

    if (usageError) throw usageError;

    const { data: earlyAdopters, error: eaError } = await supabase
        .from("early_adopters")
        .select("client_id");

    if (eaError) throw eaError;

    const earlyAdopterIds = new Set(earlyAdopters?.map(ea => ea.client_id) || []);

    const userStats = new Map<string, {
        client_id: string;
        total_requests: number;
        last_request: string;
        first_request: string;
        is_early_adopter: boolean;
    }>();

    usageData?.forEach(usage => {
        const current = userStats.get(usage.client_id) || {
            client_id: usage.client_id,
            total_requests: 0,
            last_request: usage.created_at,
            first_request: usage.created_at,
            is_early_adopter: earlyAdopterIds.has(usage.client_id)
        };

        current.total_requests++;
        if (new Date(usage.created_at) > new Date(current.last_request)) {
            current.last_request = usage.created_at;
        }
        if (new Date(usage.created_at) < new Date(current.first_request)) {
            current.first_request = usage.created_at;
        }

        userStats.set(usage.client_id, current);
    });

    const FREE_LIMIT = 3;
    const EARLY_ADOPTER_LIMIT = 8; // 3 + 5

    return Array.from(userStats.values()).map(stat => {
        const limit = stat.is_early_adopter ? EARLY_ADOPTER_LIMIT : FREE_LIMIT;
        const remaining = Math.max(0, limit - stat.total_requests);
        const avg_requests_per_day = 0; // simplistic, maybe add diff between first and last

        return {
            ...stat,
            limit,
            remaining,
            status: remaining <= 0 ? 'Exhausted' : 'Active'
        };
    }).sort((a, b) => new Date(b.last_request).getTime() - new Date(a.last_request).getTime());
}
