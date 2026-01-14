"use client";

interface ConfidenceBarProps {
    level: 'insufficient' | 'low' | 'medium' | 'high';
    percentage: number;
    conversationsCount: number;
}

export function ConfidenceBar({ level, percentage, conversationsCount }: ConfidenceBarProps) {
    const config = {
        insufficient: { color: 'bg-slate-300', text: 'text-slate-500', label: 'Sin datos' },
        low: { color: 'bg-amber-400', text: 'text-amber-700', label: 'Baja confianza' },
        medium: { color: 'bg-sky-500', text: 'text-sky-700', label: 'Confianza media' },
        high: { color: 'bg-emerald-500', text: 'text-emerald-700', label: 'Alta confianza' }
    };

    const { color, text, label } = config[level];

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className={text}>{label}</span>
                <span className="text-slate-400">
                    {conversationsCount} conversaciones · {percentage}%
                </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
