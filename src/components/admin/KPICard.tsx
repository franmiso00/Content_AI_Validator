import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: string; // e.g. "+12%"
    trendUp?: boolean;
}

export function KPICard({ title, value, description, icon: Icon, trend, trendUp }: KPICardProps) {
    return (
        <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    {trend && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {trend}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-gray-400 mt-2">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
