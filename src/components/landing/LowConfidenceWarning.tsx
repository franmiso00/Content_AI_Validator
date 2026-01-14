"use client";

import { AlertTriangle, Info } from "lucide-react";

interface LowConfidenceWarningProps {
    conversationsCount: number;
}

export function LowConfidenceWarning({ conversationsCount }: LowConfidenceWarningProps) {
    return (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4 shadow-xl shadow-amber-900/5">
            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-900">Veredicto Tentativo - Baja Confianza</h4>
                <p className="text-sm text-amber-800/80 leading-relaxed font-medium">
                    Este análisis se basa únicamente en <span className="font-black text-amber-950">{conversationsCount}</span> conversación(es) encontrada(s).
                    Los resultados son indicativos pero requieren validación manual o búsquedas con términos más amplios.
                </p>
            </div>
        </div>
    );
}
