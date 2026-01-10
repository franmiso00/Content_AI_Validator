"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
            {/* Background with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <div className="max-w-5xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                        Crea contenido con <span className="text-cyan-100">confianza</span>,<br />
                        no con suposiciones
                    </h1>

                    <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium">
                        Valida tus ideas usando datos reales de conversaciones en Reddit antes de invertir tiempo, dinero o equipo en producirlas.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-6 rounded-2xl shadow-2xl hover:shadow-xl transition-all font-bold"
                            asChild
                        >
                            <Link href="/auth/signup">
                                Valida tu próxima idea gratis
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/20 text-lg px-8 py-6 rounded-2xl font-semibold"
                            asChild
                        >
                            <Link href="#como-funciona">
                                Ver cómo funciona
                            </Link>
                        </Button>
                    </div>

                    <p className="text-white/70 text-sm pt-4">
                        Sin tarjeta de crédito • Resultados en minutos
                    </p>
                </div>
            </div>
        </section>
    );
}
