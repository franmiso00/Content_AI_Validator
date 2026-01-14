// src/components/early-adopter/EarlyAdopterModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

interface EarlyAdopterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string | null;
    maxFreeValidations: number;
    onSuccess: () => void;
    reason?: "limit_reached" | "voluntary";
}

interface FormData {
    email: string;
    role: string;
    contentFrequency: string;
    biggestChallenge: string;
    howDidYouFind: string;
}

const roles = [
    { id: "creator", label: "Creador de contenido", icon: "✍️" },
    { id: "marketer", label: "Marketing / Growth", icon: "📈" },
    { id: "founder", label: "Founder / CEO", icon: "🚀" },
    { id: "agency", label: "Agencia", icon: "🏢" },
    { id: "other", label: "Otro", icon: "💼" },
];

const frequencies = [
    { id: "daily", label: "Diario" },
    { id: "weekly", label: "Semanal" },
    { id: "monthly", label: "Mensual" },
    { id: "occasionally", label: "Ocasional" },
];

const challenges = [
    { id: "ideas", label: "Encontrar ideas que funcionen" },
    { id: "time", label: "No tengo tiempo para investigar" },
    { id: "conversion", label: "Mi contenido no convierte" },
    { id: "consistency", label: "Mantener consistencia" },
];

const sources = [
    { id: "twitter", label: "Twitter/X" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "google", label: "Google" },
    { id: "friend", label: "Recomendación" },
    { id: "other", label: "Otro" },
];

export function EarlyAdopterModal({
    open,
    onOpenChange,
    clientId,
    maxFreeValidations,
    onSuccess,
    reason = "limit_reached",
}: EarlyAdopterModalProps) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [position, setPosition] = useState<number | null>(null);
    const [totalAdopters, setTotalAdopters] = useState<number | null>(null);

    const [formData, setFormData] = useState<FormData>({
        email: "",
        role: "",
        contentFrequency: "",
        biggestChallenge: "",
        howDidYouFind: "",
    });

    // Reset state when modal is opened
    useEffect(() => {
        if (open) {
            setStep(1);
            setSubmitted(false);
            setFormData({
                email: "",
                role: "",
                contentFrequency: "",
                biggestChallenge: "",
                howDidYouFind: "",
            });
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!clientId) {
            toast.error("Error de identificación. Por favor, recarga la página.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/early-adopters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    clientId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al registrarte");
            }

            setPosition(data.position);
            setTotalAdopters(data.totalEarlyAdopters);
            setSubmitted(true);
            toast.success("¡Bienvenido a la lista de early adopters!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al registrarte");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleComplete = () => {
        onSuccess();
        onOpenChange(false);
        // Reset state for next time
        setTimeout(() => {
            setStep(1);
            setSubmitted(false);
            setFormData({
                email: "",
                role: "",
                contentFrequency: "",
                biggestChallenge: "",
                howDidYouFind: "",
            });
        }, 300);
    };

    const isStep1Valid = formData.email && formData.role;
    const isStep2Valid = formData.biggestChallenge;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-lg p-0 gap-0 overflow-y-auto max-h-[90dvh] rounded-3xl border-0 !block"
                showCloseButton={!submitted}
            >
                {!submitted ? (
                    <div className="flex flex-col min-h-full">
                        <div className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-500 p-5 text-white flex-shrink-0">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium mb-3 w-fit">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                {reason === "limit_reached" ? "Límite alcanzado" : "Early Access"}
                            </div>

                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-xl font-bold text-white text-left leading-tight">
                                    {reason === "limit_reached"
                                        ? `🎉 Has agotado tus ${maxFreeValidations} validaciones gratuitas`
                                        : "🚀 Únete al acceso prioritario de ContentValidator"}
                                </DialogTitle>
                                <p className="text-sm text-white/90 font-normal text-left leading-snug">
                                    {reason === "limit_reached"
                                        ? "Únete a la lista de early adopters y obtén "
                                        : "Sé de los primeros en usar la herramienta completa y obtén "}
                                    <span className="font-bold text-cyan-200">+5 validaciones extra</span>
                                </p>
                            </DialogHeader>
                        </div>

                        <div className="flex-1">
                            {/* Progress bar */}
                            <div className="px-6 pt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2].map((s) => (
                                        <div
                                            key={s}
                                            className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-blue-500" : "bg-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">Paso {step} de 2 • Solo 30 segundos</p>
                            </div>

                            {/* Form Content */}
                            <div className="p-5 space-y-4">
                                {step === 1 ? (
                                    <>
                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Tu email <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                placeholder="tu@email.com"
                                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 h-auto"
                                            />
                                        </div>

                                        {/* Role Selection */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                ¿Cuál es tu rol? <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {roles.map((role) => (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({ ...formData, role: role.id })
                                                        }
                                                        className={`p-2.5 rounded-xl border-2 text-left transition-all ${formData.role === role.id
                                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                                            : "border-gray-200 hover:border-gray-300"
                                                            }`}
                                                    >
                                                        <span className="text-base mr-2">{role.icon}</span>
                                                        <span className="text-sm font-medium">{role.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Content Frequency */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                ¿Con qué frecuencia creas contenido?
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {frequencies.map((freq) => (
                                                    <button
                                                        key={freq.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({ ...formData, contentFrequency: freq.id })
                                                        }
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.contentFrequency === freq.id
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        {freq.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Biggest Challenge */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                ¿Cuál es tu mayor reto con el contenido?{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                {challenges.map((challenge) => (
                                                    <button
                                                        key={challenge.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                biggestChallenge: challenge.id,
                                                            })
                                                        }
                                                        className={`w-full p-2.5 rounded-xl border-2 text-left transition-all ${formData.biggestChallenge === challenge.id
                                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                                            : "border-gray-200 hover:border-gray-300"
                                                            }`}
                                                    >
                                                        <span className="text-sm font-medium">
                                                            {challenge.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Source */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                ¿Cómo nos encontraste?
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {sources.map((source) => (
                                                    <button
                                                        key={source.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({ ...formData, howDidYouFind: source.id })
                                                        }
                                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.howDidYouFind === source.id
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                            }`}
                                                    >
                                                        {source.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Benefits reminder */}
                                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-3 border border-blue-100">
                                            <p className="text-sm font-medium text-blue-800 mb-2">
                                                Al unirte obtienes:
                                            </p>
                                            <ul className="space-y-1.5 text-sm text-blue-700">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                    +5 validaciones extra inmediatas
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                    Acceso prioritario al lanzamiento
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                    Precio especial de fundador (-40%)
                                                </li>
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 pt-4 flex gap-3 border-t bg-gray-50/50 mt-auto flex-shrink-0">
                            {step === 2 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    disabled={isSubmitting}
                                >
                                    Atrás
                                </Button>
                            )}
                            <Button
                                onClick={() => (step === 1 ? setStep(2) : handleSubmit())}
                                disabled={
                                    isSubmitting || (step === 1 ? !isStep1Valid : !isStep2Valid)
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registrando...
                                    </>
                                ) : step === 1 ? (
                                    "Continuar"
                                ) : (
                                    <>
                                        Unirme a Early Access
                                        <Sparkles className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Success State */
                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/30">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">
                                ¡Bienvenido a bordo!
                            </h3>
                            <p className="text-gray-600">
                                Ya tienes{" "}
                                <span className="font-bold text-blue-600">+5 validaciones</span>{" "}
                                disponibles.
                            </p>
                        </div>

                        {position && (
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <p className="text-sm text-gray-500">Tu posición en la lista:</p>
                                <p className="text-3xl font-bold text-gray-900">#{position}</p>
                                {totalAdopters && (
                                    <p className="text-xs text-gray-400">
                                        de {totalAdopters} early adopters
                                    </p>
                                )}
                            </div>
                        )}

                        <Button
                            onClick={handleComplete}
                            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                        >
                            Continuar validando →
                        </Button>

                        <p className="text-xs text-gray-400">
                            Te avisaremos por email cuando lancemos oficialmente
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
