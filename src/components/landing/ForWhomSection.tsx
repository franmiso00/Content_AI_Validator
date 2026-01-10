import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, X } from "lucide-react";

export function ForWhomSection() {
    const forYou = [
        "Usas contenido para generar leads o ventas",
        "Diriges una agencia, startup B2B o vendes high-ticket",
        "Prefieres datos reales a intuiciones",
        "Quieres menos contenido, pero mejor contenido"
    ];

    const notForYou = [
        "Creadores casuales",
        "Quien busca \"hacerse viral\"",
        "Publicar por publicar"
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                            Para quién es
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* For You */}
                        <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-emerald-50 to-white rounded-3xl overflow-hidden">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
                                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                                    Esto es para ti si:
                                </h3>
                                <ul className="space-y-4">
                                    {forYou.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Not For You */}
                        <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-br from-gray-50 to-white rounded-3xl overflow-hidden">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <X className="h-7 w-7 text-gray-600" />
                                    No es para:
                                </h3>
                                <ul className="space-y-4">
                                    {notForYou.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <X className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
