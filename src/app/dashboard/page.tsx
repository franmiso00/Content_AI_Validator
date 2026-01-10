
"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { validateIdea } from "@/app/actions"; // Server Action
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const [topic, setTopic] = useState("");
    const [audience, setAudience] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSearch = () => {
        if (!topic) return;

        startTransition(async () => {
            try {
                const result = await validateIdea(topic, audience);
                if (result) {
                    // Save result to DB logic is handled in the server action usually, 
                    // or we pass the result to a results page.
                    // For now, let's redirect to a details page with the ID.
                    router.push(`/dashboard/result/${result.id}`);
                }
            } catch (error) {
                toast.error("Failed to validate idea. Please try again.");
            }
        });
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 space-y-8">
            <div className="text-center space-y-4 max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                    Validate Content Ideas <br />
                    <span className="text-blue-600">Before You Create</span>
                </h1>
                <p className="text-lg text-gray-500">
                    Get real demand signals, pain points, and content angles from Reddit & Perplexity AI.
                </p>
            </div>

            {/* Floating Glass Input - Inspired by "Wishes" UI */}
            <Card className="w-full max-w-3xl border-0 shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
                <CardContent className="p-2 flex flex-col md:flex-row items-center gap-2">

                    <div className="flex-1 w-full px-2">
                        <label className="text-xs text-gray-400 font-medium ml-3 uppercase tracking-wide">Content Topic</label>
                        <Input
                            className="border-0 shadow-none focus-visible:ring-0 text-lg px-3 h-auto py-1"
                            placeholder="e.g. How to start a newsletter"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="hidden md:block w-px h-10 bg-gray-200 mx-2"></div>

                    <div className="flex-1 w-full px-2">
                        <label className="text-xs text-gray-400 font-medium ml-3 uppercase tracking-wide">Audience (Optional)</label>
                        <Input
                            className="border-0 shadow-none focus-visible:ring-0 text-lg px-3 h-auto py-1"
                            placeholder="e.g. Dentists"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                        />
                    </div>

                    <Button
                        size="lg"
                        className="rounded-2xl h-14 px-8 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                        onClick={handleSearch}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="mr-2 h-5 w-5" />
                        )}
                        Validate
                    </Button>

                </CardContent>
            </Card>

            {/* Background Decoration */}
            <div className="fixed -z-10 top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-[30%] right-[20%] w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>
        </div>
    );
}
