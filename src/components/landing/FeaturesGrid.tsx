import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, HelpCircle, MessageSquare, Lightbulb, Shield } from "lucide-react";

export function FeaturesGrid() {
    const features = [
        {
            icon: TrendingUp,
            title: "Señales reales de demanda",
            description: "Qué tan activo está el tema en conversaciones actuales.",
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            icon: Target,
            title: "Dolores y frustraciones recurrentes",
            description: "Lo que tu audiencia ya está diciendo (en sus palabras).",
            color: "text-red-600",
            bgColor: "bg-red-50"
        },
        {
            icon: HelpCircle,
            title: "Preguntas y objeciones frecuentes",
            description: "Perfectas para contenido que convierte.",
            color: "text-amber-600",
            bgColor: "bg-amber-50"
        },
        {
            icon: MessageSquare,
            title: "Lenguaje real del mercado",
            description: "Palabras y frases que puedes usar tal cual.",
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            icon: Lightbulb,
            title: "Ángulos de contenido recomendados",
            description: "Ideas accionables alineadas con demanda existente.",
            color: "text-emerald-600",
            bgColor: "bg-emerald-50"
        },
        {
            icon: Shield,
            title: "Nivel de confianza del tema",
            description: "No \"viralidad\", sino claridad para decidir.",
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Qué obtienes exactamente
                        </h2>
                        <p className="text-xl text-gray-600">
                            Cada validación te entrega:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={i}
                                    className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-2xl overflow-hidden group"
                                >
                                    <CardHeader>
                                        <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`h-7 w-7 ${feature.color}`} />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-gray-900">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
