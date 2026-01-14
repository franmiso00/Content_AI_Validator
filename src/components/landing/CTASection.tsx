"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CTASection() {
    const t = useTranslations("landing.cta");

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                        {t("noise")} <br />
                        <span className="text-sky-400">{t("impact")}</span>
                    </h2>

                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
                        <div className="flex flex-col items-start gap-4">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                                {t("withValio")}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                {(t.raw("benefits") as string[]).map((benefit, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-300">
                                        <CheckCircle2 className="h-5 w-5 text-sky-500 flex-shrink-0" />
                                        <span className="font-medium">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            size="lg"
                            className="bg-white text-slate-950 hover:bg-slate-100 text-lg h-16 px-10 rounded-xl font-bold shadow-xl shadow-white/5 transition-all active:scale-95 group"
                        >
                            {t("button")}
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>

                        <p className="text-slate-500 text-sm font-medium">
                            {t("free")}
                        </p>
                    </div>

                    {/* Fun proof element */}
                    <div className="mt-20 pt-10 border-t border-white/5">
                        <p className="text-slate-500 italic text-lg lg:text-xl">
                            {t("quote")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
