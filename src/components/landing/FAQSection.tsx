"use client";

import { useState } from "react";
import {
    ChevronDown,
    Database,
    BarChart3,
    Clock,
    RefreshCcw,
    Zap,
    Lightbulb,
    Users,
    Layout
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

const FAQS = [
    {
        question: "¿De dónde saca los datos la herramienta?",
        answer: (
            <>
                <p>ContentValidator analiza conversaciones reales en comunidades online donde tu audiencia ya está hablando. Utilizamos la API de Perplexity para rastrear y sintetizar discusiones en Reddit, foros especializados y otras comunidades públicas.</p>
                <p>No inventamos datos ni usamos predicciones basadas en algoritmos opacos. Todo lo que te mostramos proviene de conversaciones reales: preguntas que hace la gente, problemas que expresan, y temas que generan engagement genuino.</p>
                <p className="font-bold text-sky-600 bg-sky-50 p-3 rounded-lg border border-sky-100 inline-block">Dato clave: No generamos contenido, validamos demanda real.</p>
            </>
        ),
        icon: Database
    },
    {
        question: "¿Qué es el Demand Score y cómo se calcula?",
        answer: (
            <>
                <p>El Demand Score es nuestra métrica principal que indica el nivel de interés real que existe sobre un tema en comunidades online. No es una predicción de "viralidad", sino una señal de demanda existente.</p>
                <div className="space-y-2">
                    <p className="font-semibold text-slate-900">Se calcula combinando:</p>
                    <ul className="grid md:grid-cols-2 gap-2">
                        <li className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                            <strong>Volumen</strong> de conversaciones
                        </li>
                        <li className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                            <strong>Recencia</strong> (últimos 30-90 días)
                        </li>
                        <li className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                            <strong>Tipo</strong> de engagement
                        </li>
                        <li className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                            <strong>Especificidad</strong> del nicho
                        </li>
                    </ul>
                </div>
                <p className="text-slate-500 italic text-sm">El score viene acompañado de una interpretación clara y una recomendación estratégica: crear, pilotar o reconsiderar.</p>
                <p className="font-bold text-sky-600">Importante: Un score alto no garantiza éxito, indica que hay demanda real. Un score bajo puede significar nicho emergente o tema saturado.</p>
            </>
        ),
        icon: BarChart3
    },
    {
        question: "¿Cuánto tiempo tarda en darme resultados?",
        answer: (
            <>
                <p>Entre 10 y 30 segundos, dependiendo de la complejidad del tema y la cantidad de conversaciones que encuentre.</p>
                <p>El análisis es en tiempo real: cada vez que validas una idea, buscamos conversaciones actuales en comunidades relevantes. No usamos bases de datos precargadas ni resultados cacheados.</p>
                <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Manual</p>
                        <p className="text-lg font-bold">2-4 Horas</p>
                    </div>
                    <div className="h-8 w-px bg-slate-700"></div>
                    <div className="text-right">
                        <p className="text-xs text-sky-400 uppercase font-bold tracking-wider">Valio</p>
                        <p className="text-lg font-bold text-sky-400">15-30 Segundos</p>
                    </div>
                </div>
            </>
        ),
        icon: Clock
    },
    {
        question: "¿Los datos están actualizados o son históricos?",
        answer: (
            <>
                <p>Actualizados. Cada validación analiza conversaciones recientes (principalmente de los últimos 90 días) para darte una foto real del momento actual del mercado.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Análisis</p>
                        <p className="font-bold text-slate-900">En tiempo real</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Ventana</p>
                        <p className="font-bold text-slate-900">Últimos 90 días</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Tendencia</p>
                        <p className="font-bold text-slate-900">Creciente/Baja</p>
                    </div>
                </div>
                <p className="font-bold text-sky-600 italic">Por qué importa: Un tema que era tendencia hace 2 años puede estar saturado hoy. Validamos el ahora, no el pasado.</p>
            </>
        ),
        icon: RefreshCcw
    },
    {
        question: "¿En qué se diferencia de BuzzSumo o SparkToro?",
        answer: (
            <>
                <div className="overflow-hidden border rounded-2xl border-slate-200 shadow-sm">
                    <table className="w-full text-xs md:text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Herramienta</th>
                                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Limitación</th>
                                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider bg-sky-50 text-sky-700">Valio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 italic">
                            <tr>
                                <td className="px-4 py-4 font-bold not-italic">BuzzSumo</td>
                                <td className="px-4 py-4 text-slate-500">Contenido ya publicado</td>
                                <td className="px-4 py-4 text-sky-700 font-medium bg-sky-50/30">Validación pre-creación</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4 font-bold not-italic">SparkToro</td>
                                <td className="px-4 py-4 text-slate-500">Análisis de audencias</td>
                                <td className="px-4 py-4 text-sky-700 font-medium bg-sky-50/30">Validación de temas</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-4 font-bold not-italic">Reddit</td>
                                <td className="px-4 py-4 text-slate-500">2-4 h de lectura manual</td>
                                <td className="px-4 py-4 text-sky-700 font-medium bg-sky-50/30">Síntesis en segundos</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="font-bold text-sky-600">Nuestra diferencia clave: No analizamos contenido que ya existe. Validamos si vale la pena crear algo nuevo.</p>
            </>
        ),
        icon: Zap
    },
    {
        question: "¿Cómo me ayuda a tomar decisiones?",
        answer: (
            <>
                <p>ContentValidator no es un dashboard de métricas. Es un sistema de decisión que reduce tu incertidumbre.</p>
                <div className="grid gap-3">
                    {[
                        { t: "Veredicto claro", d: "Crear / Pilotar / Reconsiderar" },
                        { t: "Razonamiento", d: "Por qué sí o por qué no (2-3 puntos)" },
                        { t: "Perfil ideal", d: "Para quién funciona mejor" },
                        { t: "Estrategia", d: "Condiciones de éxito y riesgos" }
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
                <p className="font-bold text-sky-600 underline decoration-sky-200 underline-offset-4">Filosofía: Un SaaS premium no muestra datos—reduce incertidumbre. Sabrás qué hacer, no solo qué dicen los números.</p>
            </>
        ),
        icon: Lightbulb
    },
    {
        question: "¿Funciona para mi nicho específico?",
        answer: (
            <>
                <p>Sí, siempre que tu audiencia tenga presencia en comunidades online (Reddit, foros, Quora, etc.).</p>
                <div className="flex flex-wrap gap-2">
                    {["B2B", "Servicios Pro", "Coaching", "Tech", "SaaS", "Educación", "Salud", "Finanzas"].map(n => (
                        <span key={n} className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-100">{n}</span>
                    ))}
                </div>
                <p className="text-sm text-slate-500"><strong>Limitación honesta:</strong> Si tu nicho es ultra-local o tu audiencia no participa en comunidades online, los resultados serán limitados. En esos casos, te lo indicamos claramente.</p>
            </>
        ),
        icon: Users
    },
    {
        question: "¿Para qué tipos de contenido sirve?",
        answer: (
            <>
                <p>Para cualquier formato donde necesites validar si el TEMA tiene demanda antes de producirlo:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Posts Redes", "YouTube", "TikTok/Reels", "Newsletter", "Blog Posts", "Cursos", "Ebooks", "Webinars"].map(t => (
                        <div key={t} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs font-bold text-slate-700 border border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                            {t}
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-sm"><strong>No hacemos:</strong> No generamos el contenido por ti. Validamos que valga la pena crearlo.</p>
            </>
        ),
        icon: Layout
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="como-funciona" className="py-24 bg-white border-t border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 bg-sky-50 px-4 py-2 rounded-full text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2 border border-sky-100 shadow-sm">
                            <Zap className="w-3 h-3 fill-sky-600" /> FAQ
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                            Despeja tus dudas
                        </h2>
                        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Todo lo que necesitas saber antes de empezar a validar ideas con datos reales.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
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
                            ¿Aún tienes dudas? <a href="mailto:fran@franmillan.com" className="text-sky-500 cursor-pointer hover:underline">Escríbenos</a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
