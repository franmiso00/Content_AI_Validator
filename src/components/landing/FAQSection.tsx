"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    ChevronDown,
    Database,
    BarChart3,
    Clock,
    RefreshCcw,
    Zap,
    Lightbulb,
    Users,
    Layout,
    Mail
} from "lucide-react";

interface FAQItemProps {
    question: string;
    answer: React.ReactNode;
    icon: any;
    isOpen: boolean;
    onClick: () => void;
    index: number;
}

function FAQItem({ question, answer, icon: Icon, isOpen, onClick, index }: FAQItemProps) {
    const isEven = index % 2 === 0;

    return (
        <div
            className={`border rounded-2xl transition-all duration-500 overflow-hidden ${isOpen
                ? "border-sky-200 bg-sky-50/50 shadow-xl shadow-sky-500/5 ring-1 ring-sky-500/10"
                : `${isEven ? "bg-white" : "bg-slate-50/50"} border-slate-100 hover:border-slate-200 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50`
                }`}
        >
            <button
                onClick={onClick}
                className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-4 group"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-500 ${isOpen ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30 rotate-0" : "bg-white text-slate-400 group-hover:text-sky-500 border border-slate-100 group-hover:border-sky-100 -rotate-3 group-hover:rotate-0"
                        }`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-lg md:text-xl font-bold transition-all duration-300 ${isOpen ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
                        }`}>
                        {question}
                    </span>
                </div>
                <div className={`p-2 rounded-full transition-all duration-500 ${isOpen ? "bg-sky-100 text-sky-500 rotate-180" : "bg-slate-50 text-slate-300 group-hover:bg-sky-50 group-hover:text-sky-400"}`}>
                    <ChevronDown className="h-5 w-5" />
                </div>
            </button>

            <div className={`transition-all duration-500 ease-in-out ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                }`}>
                <div className="px-6 pb-8 md:px-8 md:pb-10 pt-0 text-slate-600 leading-relaxed pl-[76px] md:pl-[84px]">
                    <div className="text-base md:text-lg space-y-4">
                        {answer}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function FAQSection() {
    const t = useTranslations("landing.faq");
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            icon: Database,
            question: t("items.sources.q"),
            answer: (
                <>
                    <p>{t("items.sources.a1")}</p>
                    <p>{t("items.sources.a2")}</p>
                    <p className="font-bold text-sky-600 bg-sky-50 p-3 rounded-lg border border-sky-100 inline-block">{t("items.sources.keyData")}</p>
                </>
            )
        },
        {
            icon: BarChart3,
            question: t("items.demandScore.q"),
            answer: (
                <>
                    <p>{t("items.demandScore.a1")}</p>
                    <div className="space-y-2">
                        <p className="font-semibold text-slate-900">{t("items.demandScore.calcTitle")}</p>
                        <ul className="grid md:grid-cols-2 gap-2">
                            {[
                                { label: t("items.demandScore.vol"), icon: "bg-sky-500" },
                                { label: t("items.demandScore.recency"), icon: "bg-sky-500" },
                                { label: t("items.demandScore.engagement"), icon: "bg-sky-500" },
                                { label: t("items.demandScore.specificity"), icon: "bg-sky-500" },
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-100">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.icon}`}></div>
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-slate-500 italic text-sm">{t("items.demandScore.interpretation")}</p>
                    <p className="font-bold text-sky-600">{t("items.demandScore.important")}</p>
                </>
            )
        },
        {
            icon: Clock,
            question: t("items.time.q"),
            answer: (
                <>
                    <p>{t("items.time.a1")}</p>
                    <p>{t("items.time.a2")}</p>
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t("items.time.manual")}</p>
                            <p className="text-lg font-bold">{t("items.time.manualTime")}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-700"></div>
                        <div className="text-right">
                            <p className="text-xs text-sky-400 uppercase font-bold tracking-wider">{t("items.time.valio")}</p>
                            <p className="text-lg font-bold text-sky-400">{t("items.time.valioTime")}</p>
                        </div>
                    </div>
                </>
            )
        },
        {
            icon: RefreshCcw,
            question: t("items.updated.q"),
            answer: (
                <>
                    <p>{t("items.updated.a1")}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{t("items.decisions.reasoning")}</p>
                            <p className="font-bold text-slate-900">{t("items.updated.realTime")}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Ventana</p>
                            <p className="font-bold text-slate-900">{t("items.updated.window")}</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-100 text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Tendencia</p>
                            <p className="font-bold text-slate-900">{t("items.updated.trend")}</p>
                        </div>
                    </div>
                    <p className="font-bold text-sky-600 italic">{t("items.updated.whyItMatters")}</p>
                </>
            )
        },
        {
            icon: Zap,
            question: t("items.diff.q"),
            answer: (
                <>
                    <div className="overflow-hidden border rounded-2xl border-slate-200 shadow-sm">
                        <table className="w-full text-xs md:text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">{t("items.diff.tool")}</th>
                                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">{t("items.diff.limitation")}</th>
                                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wider bg-sky-50 text-sky-700">{t("items.diff.valio")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 italic">
                                <tr>
                                    <td className="px-4 py-4 font-bold not-italic">BuzzSumo</td>
                                    <td className="px-4 py-4 text-slate-500">{t("items.diff.buzzsumo")}</td>
                                    <td className="px-4 py-4 text-sky-700 font-medium bg-sky-50/30">{t("items.diff.preCreation")}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 font-bold not-italic">SparkToro</td>
                                    <td className="px-4 py-4 text-slate-500">{t("items.diff.sparktoro")}</td>
                                    <td className="px-4 py-4 text-sky-700 font-medium bg-sky-50/30">{t("items.diff.topicValidation")}</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-4 font-bold not-italic">Reddit</td>
                                    <td className="px-4 py-4 text-slate-500">{t("items.diff.reddit")}</td>
                                    <td className="px-4 py-4 text-sky-700 font-medium bg-sky-50/30">{t("items.diff.synthesis")}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="font-bold text-sky-600">{t("items.diff.diffKey")}</p>
                </>
            )
        },
        {
            icon: Lightbulb,
            question: t("items.decisions.q"),
            answer: (
                <>
                    <p>{t("items.decisions.a1")}</p>
                    <div className="grid gap-3">
                        {[
                            { t: t("items.decisions.verdict"), d: t("items.decisions.verdictDesc") },
                            { t: t("items.decisions.reasoning"), d: t("items.decisions.reasoningDesc") },
                            { t: t("items.decisions.profile"), d: t("items.decisions.profileDesc") },
                            { t: t("items.decisions.strategy"), d: t("items.decisions.strategyDesc") }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</div>
                                <div>
                                    <span className="font-bold text-slate-900">{item.t}: </span>
                                    <span className="text-slate-500">{item.d}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="font-bold text-sky-600 underline decoration-sky-200 underline-offset-4">{t("items.decisions.philosophy")}</p>
                </>
            )
        },
        {
            icon: Users,
            question: t("items.niche.q"),
            answer: (
                <>
                    <p>{t("items.niche.a1")}</p>
                    <p className="text-sm text-slate-500">{t("items.niche.limitation")}</p>
                </>
            )
        },
        {
            icon: Layout,
            question: t("items.formats.q"),
            answer: (
                <>
                    <p>{t("items.formats.a1")}</p>
                    <p className="mt-2 text-sm">{t("items.formats.noGen")}</p>
                </>
            )
        }
    ];

    return (
        <section id="como-funciona" className="py-24 bg-white border-t border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-sky-50 px-4 py-2 rounded-full text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-sky-100 shadow-sm">
                            <Zap className="w-3 h-3 fill-sky-600" /> {t("badge")}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            {t("title")}
                        </h2>
                        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                index={index}
                                question={faq.question}
                                answer={faq.answer}
                                icon={faq.icon}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>

                    <div className="pt-8 text-center">
                        <p className="text-slate-400 text-sm font-medium">
                            {t("stillHaveDoubts")} <a href="mailto:fran@franmillan.com" className="text-sky-500 cursor-pointer hover:underline">{t("writeUs")}</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
