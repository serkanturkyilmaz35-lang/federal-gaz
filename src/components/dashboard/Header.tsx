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
    const isAnalyticsPage = pathname === "/dashboard/analytics";
    const isMailingPage = pathname === "/dashboard/mailing";
    const isTemplatesPage = pathname === "/dashboard/templates";
    const isContentPage = pathname === "/dashboard/content" || pathname.startsWith("/dashboard/content/");
    const isProductsPage = pathname === "/dashboard/products" || pathname.startsWith("/dashboard/products/");
    const isServicesPage = pathname === "/dashboard/services" || pathname.startsWith("/dashboard/services/");
    const isSettingsPage = pathname === "/dashboard/settings";
    const isMediaPage = pathname === "/dashboard/media";
    const hideSearchBar = isDashboardOverview || isAnalyticsPage || isMailingPage || isTemplatesPage || isContentPage || isProductsPage || isServicesPage || isSettingsPage || isMediaPage;

    // Update URL on search change (Debounced to avoid too many refreshes)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (!hideSearchBar) {
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
    }, [searchQuery, pathname, hideSearchBar, router]);

    // Get dynamic placeholder based on current page
    const getPlaceholder = () => {
        if (pathname.includes("/orders")) return "Sipariş ara...";
        if (pathname.includes("/users")) return "Kullanıcı ara...";
        if (pathname.includes("/notifications")) return "Bildirim ara...";
        if (pathname.includes("/contacts") || pathname.includes("/messages")) return "Mesaj ara...";
        return "Ara...";
    };

    return (
        <header data-print-hide="true" className="flex h-14 lg:h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#111418] px-4 lg:px-6 print:hidden">
            {/* Left: Title - hidden on mobile (hamburger takes this space) */}
            <div className="hidden lg:flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Yönetim Paneli</h1>
            </div>
            {/* Mobile spacer for hamburger menu */}
            <div className="lg:hidden w-12" />

            {/* Central Search Bar - Hidden on Overview and Analytics */}
            {!hideSearchBar && (
                <div className="flex-1 max-w-xs lg:max-w-md mx-2 lg:mx-auto px-2 lg:px-4">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-[#137fec] transition-colors text-xl">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 lg:py-2 text-sm text-white bg-white/5 border border-transparent rounded-lg focus:outline-none focus:ring-1 focus:ring-[#137fec] focus:bg-[#1c2127] placeholder:text-gray-500 transition-all hover:bg-white/10"
                            placeholder={getPlaceholder()}
                        />
                    </div>
                </div>
            )}
            {hideSearchBar && <div className="flex-1" />}

            <div className="flex items-center gap-2 lg:gap-4">
                {/* Notification Bell */}
                <Link href="/dashboard/notifications" className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-[#111418]">
                            {unreadCount}
                        </span>
                    )}
                </Link>

                {/* Separator - hidden on mobile */}
                <div className="hidden lg:block h-8 w-px bg-gray-700 mx-2" />

                {/* Profile & Logout Section */}
                <div className="flex items-center gap-2 lg:gap-4">
                    {/* User Info: Avatar + Name */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-[#137fec] text-xs lg:text-sm font-bold text-white shadow-lg ring-2 ring-[#137fec]/20">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Name hidden on mobile */}
                        <div className="hidden lg:flex flex-col">
                            <span className="text-sm font-bold text-white">{user.name}</span>
                        </div>
                    </div>

                    {/* Separator - hidden on mobile */}
                    <div className="hidden lg:block h-6 w-px bg-gray-700" />

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
                        className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                    >
                        <span className="material-symbols-outlined text-[18px] lg:text-[20px] group-hover:scale-110 transition-transform">logout</span>
                        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wide">Çıkış</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
