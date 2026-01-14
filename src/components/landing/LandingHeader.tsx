"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import ValioLogo from "@/components/ui/ValioLogo";

interface LandingHeaderProps {
    onJoinWaitlist?: () => void;
}

export function LandingHeader({ onJoinWaitlist }: LandingHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                        <ValioLogo size={28} />
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="#como-funciona" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            Cómo funciona
                        </Link>
                        <Button
                            onClick={onJoinWaitlist}
                            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-200 flex items-center gap-2 border-0"
                        >
                            <Sparkles className="w-4 h-4" />
                            Unirme al Early Access
                        </Button>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            size="sm"
                            onClick={onJoinWaitlist}
                            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-xl shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-200 flex items-center gap-2 border-0"
                        >
                            <Sparkles className="w-4 h-4" />
                            Early Access
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
