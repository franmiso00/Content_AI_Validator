"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, HelpCircle, Lightbulb, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ValidationResult {
    demand_score: number;
    demand_summary: string;
    pain_points: string[];
    questions: string[];
    content_angles: string[];
    remaining_validations?: number;
}

interface ResultsDisplayProps {
    result: ValidationResult;
    topic: string;
    onReset: () => void;
}

export function ResultsDisplay({ result, topic, onReset }: ResultsDisplayProps) {
    const showSignupCTA = result.remaining_validations !== undefined && result.remaining_validations <= 2;

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold">
                            ✅ Análisis completado
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            "{topic}"
                        </h2>
                        {result.remaining_validations !== undefined && (
                            <p className="text-sm text-gray-500">
                                {result.remaining_validations > 0
                                    ? `Te quedan ${result.remaining_validations} validaciones gratis`
                                    : "Has alcanzado el límite gratuito"
                                }
                            </p>
                        )}
                    </div>

                    {/* Demand Score Hero */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="col-span-2 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-indigo-700">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>Resumen de Demanda</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    {result.demand_summary}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col justify-center items-center bg-white shadow-lg border-2 border-blue-100">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-sm font-medium uppercase tracking-wider text-gray-500">
                                    Demand Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-6xl font-black text-blue-600">
                                    {result.demand_score}
                                    <span className="text-2xl text-gray-300 font-normal">/100</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Insights Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Pain Points */}
                        <Card className="border-t-4 border-t-red-400 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-lg">
                                    <Target className="h-5 w-5 text-red-500" />
                                    <span>Pain Points</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {result.pain_points.slice(0, 3).map((point, i) => (
                                        <li key={i} className="flex items-start text-sm">
                                            <span className="mr-2 mt-1 block h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Questions */}
                        <Card className="border-t-4 border-t-amber-400 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-lg">
                                    <HelpCircle className="h-5 w-5 text-amber-500" />
                                    <span>Preguntas Clave</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {result.questions.slice(0, 3).map((q, i) => (
                                        <li key={i} className="flex items-start text-sm">
                                            <span className="mr-2 mt-1 block h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Content Angles */}
                        <Card className="border-t-4 border-t-emerald-400 shadow-lg md:col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-lg">
                                    <Lightbulb className="h-5 w-5 text-emerald-500" />
                                    <span>Ángulos</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {result.content_angles.slice(0, 2).map((angle, i) => (
                                        <li key={i} className="p-3 bg-emerald-50/50 rounded-lg text-sm text-emerald-900 border border-emerald-100">
                                            {angle}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* CTA Section */}
                    {showSignupCTA ? (
                        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xl">
                            <CardContent className="p-8 text-center space-y-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    ¿Te gustó el análisis?
                                </h3>
                                <p className="text-gray-600 max-w-2xl mx-auto">
                                    Crea una cuenta gratis para validaciones ilimitadas, guardar tus análisis y acceder al historial completo.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Button
                                        size="lg"
                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold"
                                        asChild
                                    >
                                        <Link href="/auth/signup">
                                            Crear cuenta gratis
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-2xl font-semibold"
                                        onClick={onReset}
                                    >
                                        <RefreshCw className="mr-2 h-5 w-5" />
                                        Validar otra idea
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="text-center">
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-2xl font-semibold"
                                onClick={onReset}
                            >
                                <RefreshCw className="mr-2 h-5 w-5" />
                                Validar otra idea
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
