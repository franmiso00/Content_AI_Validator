"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg"></div>
                        <span className="font-bold text-xl text-gray-900">ContentValidator</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        <Link href="#como-funciona" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Cómo funciona
                        </Link>
                        <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                            Iniciar sesión
                        </Link>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                            asChild
                        >
                            <Link href="/auth/signup">
                                Empezar gratis
                            </Link>
                        </Button>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                            asChild
                        >
                            <Link href="/auth/signup">
                                Empezar
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
