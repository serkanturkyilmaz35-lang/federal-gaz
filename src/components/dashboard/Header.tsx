"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";

interface DashboardHeaderProps {
    user: {
        name: string;
        email: string;
        image?: string;
    };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { unreadCount } = useNotification();
    const searchParams = useSearchParams();

    // Initialize search from URL
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

    const isDashboardOverview = pathname === "/dashboard";

    // Update URL on search change (Debounced to avoid too many refreshes)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!isDashboardOverview) {
                const params = new URLSearchParams(window.location.search);
                if (searchQuery) {
                    params.set("q", searchQuery);
                } else {
                    params.delete("q");
                }
                router.replace(`${pathname}?${params.toString()}`);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, pathname, isDashboardOverview, router]);

    // Get dynamic placeholder based on current page
    const getPlaceholder = () => {
        if (pathname.includes("/orders")) return "Sipariş No, Müşteri, Telefon veya E-posta ara...";
        if (pathname.includes("/users")) return "İsim veya E-posta ara...";
        if (pathname.includes("/notifications")) return "Bildirim başlığı veya içeriği ara...";
        if (pathname.includes("/contacts") || pathname.includes("/messages")) return "İsim, E-posta veya Mesaj ara...";
        return "Sayfa içinde ara...";
    };

    return (
        <header data-print-hide="true" className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#111418] px-6 print:hidden">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Yönetim Paneli</h1>
            </div>

            {/* Central Search Bar - Visible on all pages EXCEPT Overview */}
            {!isDashboardOverview && (
                <div className="flex-1 max-w-md mx-auto px-4">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#137fec] transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 text-sm text-white bg-white/5 border border-transparent rounded-lg focus:outline-none focus:ring-1 focus:ring-[#137fec] focus:bg-[#1c2127] placeholder:text-gray-500 transition-all hover:bg-white/10"
                            placeholder={getPlaceholder()}
                        />
                    </div>
                </div>
            )}
            {isDashboardOverview && <div className="flex-1" />}

            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <Link href="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-[#111418]">
                            {unreadCount}
                        </span>
                    )}
                </Link>

                <div className="h-8 w-px bg-gray-700 mx-2" />

                {/* Profile & Logout Section */}
                <div className="flex items-center gap-4">
                    {/* User Info: Avatar + Name */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#137fec] text-sm font-bold text-white shadow-lg ring-2 ring-[#137fec]/20">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{user.name}</span>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-6 w-px bg-gray-700" />

                    {/* Logout Button */}
                    <button
                        onClick={async () => {
                            try {
                                await fetch('/api/auth/logout', { method: 'POST' });
                                window.location.href = '/';
                            } catch (err) {
                                console.error('Logout error', err);
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
                        <span className="text-xs font-bold uppercase tracking-wide">Çıkış Yap</span>
                    </button>
                </div>
            </div>
        </header >
    );
}
