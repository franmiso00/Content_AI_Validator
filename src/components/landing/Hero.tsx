"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface HeroProps {
    onValidate: (topic: string, audience: string) => void;
    isValidating: boolean;
}

export function Hero({ onValidate, isValidating }: HeroProps) {
    const [topic, setTopic] = useState("");
    const [audience, setAudience] = useState("");

    const [loadingMessage, setLoadingMessage] = useState("Analizando...");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            const messages = [
                "Escaneando Reddit...",
                "Identificando dolores...",
                "Analizando demanda...",
                "Generando insights...",
                "Casi listo..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                setLoadingMessage(messages[i % messages.length]);
                i++;
            }, 2500);

            onValidate(topic, audience);

            // Note: interval should ideally be cleared by parent/cleanup
            setTimeout(() => clearInterval(interval), 30000);
        }
    };

    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-400 to-blue-500">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-4">
                            <Sparkles className="h-4 w-4" />
                            Validación con IA en segundos
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                            Valida ideas de contenido<br />
                            <span className="text-cyan-100">antes de crearlas</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                            Descubre si tu idea tiene demanda real usando conversaciones de Reddit
                        </p>
                    </div>

                    {/* Live Validation Input */}
                    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden max-w-3xl mx-auto">
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-3">
                                    <Input
                                        className="text-lg px-6 py-6 border-2 border-gray-200 focus:border-blue-500 rounded-2xl"
                                        placeholder="Ej: Cómo crear newsletters para dentistas"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        disabled={isValidating}
                                        required
                                    />

                                    <Input
                                        className="text-base px-6 py-4 border-2 border-gray-200 focus:border-blue-500 rounded-2xl"
                                        placeholder="Audiencia (opcional): Ej. Dentistas"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        disabled={isValidating}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold"
                                    disabled={isValidating || !topic.trim()}
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            {loadingMessage}
                                        </>
                                    ) : (
                                        <>
                                            Validar ahora gratis
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </Button>

                                <p className="text-gray-500 text-sm text-center">
                                    Sin registro • Resultados en segundos • Gratis
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
