
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 hidden md:flex">
                        <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
                            <span className="hidden font-bold sm:inline-block">ContentValidator</span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
                                Validation
                            </Link>
                            <Link href="/dashboard/history" className="transition-colors hover:text-foreground/80 text-foreground/60">
                                History
                            </Link>
                        </nav>
                    </div>
                    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                        <div className="w-full flex-1 md:w-auto md:flex-none">
                            {/* Add search or other nav items here */}
                        </div>
                        <nav className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4">{user.email}</span>
                            <form action="/auth/signout" method="post">
                                <Button variant="ghost" size="sm">Sign Out</Button>
                            </form>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="container py-6">
                {children}
            </main>
        </div>
    );
}
