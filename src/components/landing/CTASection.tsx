import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function CTASection() {
    const benefits = [
        "Produces contenido con intención",
        "Reduces contenido que no convierte",
        "Tomas decisiones con evidencia",
        "Aumentas el ROI de tu contenido"
    ];

    return (
        <section className="py-20 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                            Menos ruido.<br />
                            Más impacto.
                        </h2>
                        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                            Deja de adivinar. Empieza a decidir con datos.
                        </p>
                    </div>

                    <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                Con ContentValidator:
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4 mb-8">
                                {benefits.map((benefit, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                                        <span className="text-gray-700 font-medium">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <Button
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-6 rounded-2xl shadow-xl font-bold"
                                    asChild
                                >
                                    <Link href="/auth/signup">
                                        Valida tu próxima idea ahora
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>

                            <p className="text-center text-gray-500 text-sm mt-6">
                                Gratis para empezar • Sin tarjeta de crédito
                            </p>
                        </CardContent>
                    </Card>

                    <p className="text-center text-white/80 text-lg italic">
                        "Un sistema para reducir el riesgo de crear contenido que no convierte"
                    </p>
                </div>
            </div>
        </section>
    );
}
