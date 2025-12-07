"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
    icon: string;
    label: string;
    href: string;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { icon: "dashboard", label: "Genel Bakış", href: "/dashboard" },
    { icon: "shopping_cart", label: "Siparişler", href: "/dashboard/orders" },
    { icon: "chat_bubble", label: "Talepler", href: "/dashboard/quotes" },
    { icon: "group", label: "Kullanıcılar", href: "/dashboard/users" },
    { icon: "article", label: "İçerik Yönetimi", href: "/dashboard/content" },
    { icon: "image", label: "Medya", href: "/dashboard/media" },
    { icon: "mail", label: "Mailing", href: "/dashboard/mailing" },
    { icon: "pie_chart", label: "Analitik", href: "/dashboard/analytics" },
    { icon: "settings", label: "Ayarlar", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={`${isCollapsed ? "w-20" : "w-64"
                } flex-shrink-0 bg-[#151d27] p-4 transition-all duration-300 flex flex-col`}
        >
            <div className="flex h-full flex-col justify-between">
                {/* Logo & Brand */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-2">
                        <img
                            src="/dashboard-logo.png"
                            alt="Federal Gaz Logo"
                            className={`${isCollapsed ? "h-10 w-10" : "h-12 w-12"} object-contain`}
                        />
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-normal text-white">
                                    Federal Gaz
                                </h1>
                                <p className="text-sm font-normal leading-normal text-gray-400">
                                    Yönetim Paneli
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        {menuItems.map((item) => {
                            // For /dashboard (Genel Bakış), only match exact path
                            // For other pages, also match subpaths
                            const isActive = item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname === item.href || pathname?.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? "bg-[#b13329] text-white"
                                        : "text-gray-300 hover:bg-white/10"
                                        }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <span className={`material-symbols-outlined text-2xl ${isActive ? "text-white" : ""}`}>
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <div className="flex flex-1 items-center justify-between">
                                            <p className={`text-sm font-medium leading-normal ${isActive ? "text-white" : ""}`}>
                                                {item.label}
                                            </p>
                                            {item.badge && (
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f4b834] px-1.5 text-xs font-bold text-[#292828]">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Info & Controls */}
                <div className="flex flex-col gap-2 border-t border-gray-700 pt-4">
                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isCollapsed ? "chevron_right" : "chevron_left"}
                        </span>
                        {!isCollapsed && (
                            <p className="text-sm font-medium leading-normal">Daralt</p>
                        )}
                    </button>

                    {/* Logout */}
                    <Link
                        href="/dashboard/login"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">logout</span>
                        {!isCollapsed && (
                            <p className="text-sm font-medium leading-normal">Çıkış Yap</p>
                        )}
                    </Link>
                </div>
            </div>
        </aside>
    );
}
