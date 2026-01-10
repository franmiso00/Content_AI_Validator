import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

export function ProblemSection() {
    const problems = [
        "Tienes ideas que suenan bien, pero luego no funcionan",
        "Publicas contenido \"correcto\" que no genera leads",
        "Tu equipo crea por intuición, no por demanda real",
        "Pierdes horas investigando Reddit sin saber qué mirar"
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                            Si creas contenido para vender<br />
                            <span className="text-gray-600">—no solo para likes—</span><br />
                            seguramente te pasa esto:
                        </h2>
                    </div>

                    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <ul className="space-y-6 text-left">
                                {problems.map((problem, i) => (
                                    <li key={i} className="flex items-start gap-4 text-lg text-gray-700">
                                        <X className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                                        <span>{problem}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <div className="space-y-2 pt-8">
                        <p className="text-2xl md:text-3xl font-bold text-gray-900">
                            El problema no es tu contenido.
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-blue-600">
                            Es que lo decides sin evidencia.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
