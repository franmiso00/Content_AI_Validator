"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    Zap,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Rocket,
    Gift,
    Users,
    Mail,
    Briefcase,
    Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";

interface EarlyAdopterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientId: string | null;
    maxFreeValidations: number;
    onSuccess: () => void;
    reason?: "limit_reached" | "voluntary";
}

export function EarlyAdopterModal({
    open,
    onOpenChange,
    clientId,
    maxFreeValidations,
    onSuccess,
    reason = "voluntary"
}: EarlyAdopterModalProps) {
    const t = useTranslations("earlyAdopter");
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [niche, setNiche] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (open) {
            setStep(1);
            setEmail("");
            setName("");
            setNiche("");
            setIsSuccess(false);
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error: submitError } = await supabase
                .from('early_adopters')
                .insert([{
                    email,
                    full_name: name,
                    niche,
                    client_id: clientId,
                    registration_reason: reason
                }]);

            if (submitError) {
                if (submitError.code === '23505') {
                    toast.error(t("errors.alreadyRegistered"));
                } else {
                    toast.error(t("errors.generic"));
                }
                return;
            }

            setIsSuccess(true);
            trackEvent({
                action: 'lead_captured',
                category: 'conversion',
                label: 'early_adopter_form',
                reason: reason
            });
            onSuccess();
        } catch (err) {
            toast.error(t("errors.generic"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500"></div>

                <div className="p-8 md:p-10 space-y-8 max-h-[90vh] overflow-y-auto">
                    {!isSuccess ? (
                        <>
                            {step === 1 ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-4 text-center">
                                        <div className="inline-flex items-center gap-2 bg-sky-50 px-4 py-2 rounded-full text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] border border-sky-100 mb-2">
                                            <Sparkles className="w-3 h-3 fill-sky-600" />
                                            {reason === "limit_reached" ? `Límite alcanzado (${maxFreeValidations})` : t("step1.badge")}
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                                            {reason === "limit_reached" ? t("step1.limitTitle") : t("step1.title")}
                                        </h3>
                                        <p className="text-slate-500 text-lg font-medium">
                                            {t("step1.subtitle")}
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        {(t.raw("step1.benefits") as any[]).map((benefit: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:border-sky-100 hover:shadow-md group">
                                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-sky-500 border border-slate-100 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all">
                                                    {i === 0 ? <Zap className="h-5 w-5" /> : i === 1 ? <Gift className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-slate-900 leading-tight">{benefit.title}</p>
                                                    <p className="text-sm text-slate-500">{benefit.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => setStep(2)}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white h-16 rounded-2xl font-black text-lg transition-all active:scale-95 group shadow-xl shadow-slate-200"
                                    >
                                        {t("step1.continue")}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900">{t("step2.title")}</h3>
                                        <p className="text-slate-500 font-medium">{t("step2.subtitle")}</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">{t("step2.nameLabel")}</Label>
                                                <div className="relative">
                                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        id="name"
                                                        placeholder={t("step2.namePlaceholder")}
                                                        className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-sky-500 transition-all font-medium"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">{t("step2.emailLabel")}</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder={t("step2.emailPlaceholder")}
                                                        className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-sky-500 transition-all font-medium"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="niche" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">{t("step2.nicheLabel")}</Label>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                    <Input
                                                        id="niche"
                                                        placeholder={t("step2.nichePlaceholder")}
                                                        className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-sky-500 transition-all font-medium"
                                                        value={niche}
                                                        onChange={(e) => setNiche(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-sky-500 hover:bg-sky-600 text-white h-16 rounded-2xl font-black text-lg shadow-xl shadow-sky-100 transition-all active:scale-95"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        {t("step2.submitting")}
                                                    </span>
                                                ) : (
                                                    t("step2.submit")
                                                )}
                                            </Button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="w-full text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest py-2 transition-colors"
                                            >
                                                {t("step2.back")}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center space-y-8 py-4 animate-in zoom-in-95 duration-500">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                                <div className="relative h-24 w-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30">
                                    <CheckCircle2 className="h-12 w-12" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-slate-900 leading-tight">
                                    {t("success.title")}
                                </h3>
                                <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">
                                    {t("success.subtitle")}
                                </p>
                            </div>

                            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 space-y-4">
                                <p className="text-sm font-bold text-emerald-800 uppercase tracking-widest">{t("success.nextSteps")}</p>
                                <ul className="text-left space-y-3">
                                    {(t.raw("success.steps") as string[]).map((step, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white h-16 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl shadow-slate-200"
                            >
                                {t("success.close")}
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
