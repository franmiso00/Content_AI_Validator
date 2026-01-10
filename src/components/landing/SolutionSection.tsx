import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function SolutionSection() {
    const steps = [
        "Analizamos conversaciones reales en Reddit",
        "Detectamos dolores, objeciones y preguntas recurrentes",
        "Identificamos cómo habla realmente tu audiencia",
        "Te mostramos si una idea tiene tracción o está saturada"
    ];

    return (
        <section id="como-funciona" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            La solución
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            <strong className="text-gray-900">ContentValidator</strong> es una plataforma de validación de ideas de contenido para negocios que venden con contenido.
                        </p>
                    </div>

                    <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8">Antes de crear:</h3>

                            <ul className="space-y-6">
                                {steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <CheckCircle2 className="h-7 w-7 text-blue-600 shrink-0 mt-0.5" />
                                        <span className="text-lg text-gray-700 font-medium">{step}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-12 pt-8 border-t border-blue-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                    <div>
                                        <p className="text-3xl font-black text-blue-600">Minutos</p>
                                        <p className="text-sm text-gray-600 mt-1">Todo en minutos</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-blue-600">Sin scroll</p>
                                        <p className="text-sm text-gray-600 mt-1">Sin scroll infinito</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-blue-600">Real</p>
                                        <p className="text-sm text-gray-600 mt-1">Sin "predicciones mágicas"</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
