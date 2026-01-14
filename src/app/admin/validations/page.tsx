import { getRecentValidations } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminValidationsPage() {
    const validations = await getRecentValidations();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Validations</h1>
                    <p className="text-gray-500 mt-2">Recent validation runs and their scores.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                                    <th className="px-4 py-3">Topic</th>
                                    <th className="px-4 py-3">Audience</th>
                                    <th className="px-4 py-3">Score</th>
                                    <th className="px-4 py-3 rounded-tr-lg">User ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {validations.map((val) => (
                                    <tr key={val.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(val.created_at).toLocaleDateString()} <span className="text-xs">{new Date(val.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate" title={val.input_idea}>
                                            {val.input_idea}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {val.input_audience || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={val.demand_score && val.demand_score >= 70 ? "default" : "secondary"}>
                                                {val.demand_score ?? "N/A"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                                            {val.user_id?.substring(0, 8)}...
                                        </td>
                                    </tr>
                                ))}
                                {validations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                            No validations found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
