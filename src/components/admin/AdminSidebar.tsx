"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, Settings, BarChart3 } from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();

    const links = [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/validations", label: "Validations", icon: FileText },
        { href: "/admin/users", label: "Users & Waitlist", icon: Users },
        // { href: "/admin/settings", label: "Settings", icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-6 hidden md:block">
            <div className="mb-8 px-2 flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="text-white h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Admin
                </h2>
            </div>

            <nav className="space-y-1">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-blue-50 text-blue-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-400")} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
