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
    { icon: "article", label: "İçerik Yönetimi", href: "/dashboard/content" },
    { icon: "image", label: "Medya", href: "/dashboard/media" },
    { icon: "group", label: "Kullanıcılar", href: "/dashboard/users" },
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
                } flex-shrink-0 bg-[#292828] border-r border-white/10 transition-all duration-300 flex flex-col`}
        >
            <div className="flex h-full flex-col justify-between p-4">
                {/* Logo & Brand */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 px-2">
                        {!isCollapsed && (
                            <>
                                <img
                                    src="/logo.jpg"
                                    alt="Federal Gaz Logo"
                                    className="h-10 w-auto object-contain"
                                />
                                <div className="flex flex-col">
                                    <h1 className="text-base font-bold leading-normal text-white">
                                        Federal Gaz
                                    </h1>
                                    <p className="text-sm font-normal leading-normal text-[#94847c]">
                                        Yönetim Paneli
                                    </p>
                                </div>
                            </>
                        )}
                        {isCollapsed && (
                            <img
                                src="/logo.jpg"
                                alt="Federal Gaz"
                                className="h-10 w-10 rounded-full object-cover"
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isActive
                                        ? "bg-[#b13329] text-white"
                                        : "text-[#ece6e4] hover:bg-white/5"
                                        }`}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <span className="material-symbols-outlined text-2xl">
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <div className="flex flex-1 items-center justify-between">
                                            <p className="text-sm font-medium leading-normal">
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

                {/* User Info & Logout */}
                <div className="flex flex-col gap-2 border-t border-white/20 pt-4">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#ece6e4] hover:bg-white/5"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isCollapsed ? "chevron_right" : "chevron_left"}
                        </span>
                        {!isCollapsed && (
                            <p className="text-sm font-medium leading-normal">Daralt</p>
                        )}
                    </button>
                    <Link
                        href="/dashboard/logout"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#ece6e4] hover:bg-white/5"
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
