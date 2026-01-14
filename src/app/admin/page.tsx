import { Suspense } from "react";
import { getAdminStats, getValidationsPerDay } from "./actions";
import { KPICard } from "@/components/admin/KPICard";
import { AdminCharts } from "@/components/admin/AdminCharts";
import { FileText, Users, TrendingUp, Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Overview of content validation performance and user growth.</p>
            </div>

            <Suspense fallback={<DashboardLoading />}>
                <DashboardContent />
            </Suspense>
        </div>
    );
}

async function DashboardContent() {
    const stats = await getAdminStats();
    const chartData = await getValidationsPerDay();

    return (
        <>
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="Total Validations"
                    value={stats.validationsCount}
                    icon={FileText}
                    description="All time validations run"
                    trend="+12%" // Placeholder
                    trendUp={true}
                />
                <KPICard
                    title="Anonymous Users"
                    value={stats.anonymousUsersCount}
                    icon={Users}
                    description="Unique visitors testing the tool"
                />
                <KPICard
                    title="Waitlist Signups"
                    value={stats.earlyAdoptersCount}
                    icon={TrendingUp}
                    description="Users interested in early access"
                    trend={`${stats.conversionRate.toFixed(1)}%`}
                    trendUp={true}
                />
                <KPICard
                    title="Conversion Rate"
                    value={`${stats.conversionRate.toFixed(1)}%`}
                    icon={TrendingUp}
                    description="Visitors -> Waitlist conversion"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <div className="md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Validations Over Time</h3>
                        <p className="text-sm text-gray-500">Last 30 days activity</p>
                    </div>
                    <AdminCharts data={chartData} />
                </div>

                <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <p className="text-sm text-gray-500">Manage platform settings</p>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-xl text-blue-700 text-sm">
                            <p className="font-medium">System Status</p>
                            <p className="opacity-80 mt-1">All services operational. API quotas within limits.</p>
                        </div>
                        {/* Add more quick widgets here if needed */}
                    </div>
                </div>
            </div>
        </>
    );
}

function DashboardLoading() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
    );
}
