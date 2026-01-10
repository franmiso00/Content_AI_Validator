
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Note: Need to verify if Badge exists or use custom
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Target, HelpCircle, Lightbulb, TrendingUp } from "lucide-react";

export default async function ResultPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: validation, error } = await supabase
        .from("validations")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !validation) {
        return notFound();
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-10">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{validation.input_idea}</h1>
                    <p className="text-muted-foreground">{validation.input_audience || "General Audience"}</p>
                </div>
            </div>

            {/* Demand Score Hero */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="col-span-2 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-indigo-700">
                            <TrendingUp className="h-5 w-5" />
                            <span>Market Demand Summary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start justify-between">
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {validation.demand_summary}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center items-center bg-white shadow-sm border-2 border-blue-50">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500">Demand Score</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="text-6xl font-black text-blue-600">
                            {validation.demand_score}
                            <span className="text-2xl text-gray-300 font-normal">/100</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Pain Points */}
                <Card className="border-t-4 border-t-red-400 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Target className="h-5 w-5 text-red-500" />
                            <span>Pain Points</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {validation.pain_points.map((point: string, i: number) => (
                                <li key={i} className="flex items-start text-sm">
                                    <span className="mr-2 mt-1 block h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Common Questions */}
                <Card className="border-t-4 border-t-amber-400 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <HelpCircle className="h-5 w-5 text-amber-500" />
                            <span>Questions to Answer</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {validation.questions.map((q: string, i: number) => (
                                <li key={i} className="flex items-start text-sm">
                                    <span className="mr-2 mt-1 block h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Content Angles */}
                <Card className="border-t-4 border-t-emerald-400 shadow-sm md:col-span-2 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Lightbulb className="h-5 w-5 text-emerald-500" />
                            <span>Content Angles</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {validation.content_angles.map((angle: string, i: number) => (
                                <li key={i} className="p-3 bg-emerald-50/50 rounded-lg text-sm text-emerald-900 border border-emerald-100">
                                    {angle}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
