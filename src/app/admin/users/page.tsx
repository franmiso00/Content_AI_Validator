import { getEarlyAdopters, getUsers, getAnonymousUsersStats } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminUsersPage() {
    const [earlyAdopters, users, anonymousUsers] = await Promise.all([
        getEarlyAdopters(),
        getUsers(),
        getAnonymousUsersStats()
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users & Community</h1>
                <p className="text-gray-500 mt-2">Manage registered users, waitlist entries, and anonymous usage.</p>
            </div>

            <Tabs defaultValue="waitlist" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="waitlist">Waitlist ({earlyAdopters.length})</TabsTrigger>
                    <TabsTrigger value="users">Registered ({users.length})</TabsTrigger>
                    <TabsTrigger value="anonymous">Anonymous ({anonymousUsers.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="waitlist" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Early Adopters</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Biggest Challenge</th>
                                            <th className="px-4 py-3">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {earlyAdopters.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 capitalize">
                                                    {user.biggest_challenge}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 capitalize">
                                                    {user.how_did_you_find || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                        {earlyAdopters.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                    No waitlist entries found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Member Since</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Tier</th>
                                            <th className="px-4 py-3">Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                                                        {user.subscription_tier}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {user.credits_remaining}
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                    No users found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="anonymous" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Anonymous Usage Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Last Active</th>
                                            <th className="px-4 py-3">Client ID</th>
                                            <th className="px-4 py-3 text-center">Requests</th>
                                            <th className="px-4 py-3 text-center">Remaining</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {anonymousUsers.map((user) => (
                                            <tr key={user.client_id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                    {new Date(user.last_request).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-gray-500" title={user.client_id}>
                                                    {user.client_id.substring(0, 12)}...
                                                    {user.is_early_adopter && (
                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700">
                                                            Early Adopter
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center font-medium text-gray-900">
                                                    {user.total_requests}
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-600">
                                                    {user.remaining} <span className="text-gray-400 text-xs">/ {user.limit}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active'
                                                            ? 'bg-green-50 text-green-700'
                                                            : 'bg-red-50 text-red-700'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {anonymousUsers.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                    No anonymous usage recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
