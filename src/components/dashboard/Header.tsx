"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);

    const isDashboardOverview = pathname === "/dashboard";

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.length > 0) {
            router.push(`/dashboard/orders?search=${encodeURIComponent(searchQuery)}`);
            setShowResults(false);
            setSearchQuery("");
        }
    };

    // Mock search data
    const mockData = [
        { path: "/dashboard/orders", label: "Siparişler", icon: "shopping_cart" },
        { path: "/dashboard/users", label: "Müşteriler", icon: "group" },
        { path: "/dashboard/content", label: "İçerik Yönetimi", icon: "article" },
        { path: "/dashboard/settings", label: "Ayarlar", icon: "settings" },
        { path: "/dashboard/orders/1", label: "Ahmet Yılmaz", icon: "person", detail: "#12548 - 0532 123 45 67" },
        { path: "/dashboard/orders/2", label: "Ayşe Kaya", icon: "person", detail: "#12547 - 0533 234 56 78" },
        { path: "/dashboard/contacts/1", label: "Murat Özkan", icon: "mail", detail: "Fiyat Teklifi" },
    ];

    const filteredResults = mockData.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
            item.label.toLowerCase().includes(query) ||
            item.detail?.toLowerCase().includes(query)
        );
    });

    const handleResultClick = (path: string) => {
        router.push(path);
        setShowResults(false);
        setSearchQuery("");
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-[#111418] px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-white">Yönetim Paneli</h1>
            </div>

            {/* Search Bar - Hidden on Overview */}
            {!isDashboardOverview && (
                <div className="relative w-full max-w-sm mx-8">
                    <form onSubmit={handleSearch}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowResults(e.target.value.length > 0);
                            }}
                            onFocus={() => searchQuery.length > 0 && setShowResults(true)}
                            onBlur={() => setTimeout(() => setShowResults(false), 200)}
                            className="block w-full pl-10 pr-4 py-2 text-sm text-white bg-white/5 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent placeholder:text-gray-500"
                            placeholder="Sayfa, sipariş, müşteri veya telefon ara..."
                        />
                    </form>

                    {/* Search Results Dropdown */}
                    {showResults && filteredResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c2127] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                            {filteredResults.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleResultClick(item.path)}
                                    className="w-full flex items-start gap-3 px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-gray-800 last:border-0"
                                >
                                    <span className="material-symbols-outlined text-gray-400 mt-0.5">{item.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium block truncate">{item.label}</span>
                                        {item.detail && <span className="text-xs text-gray-500 block truncate">{item.detail}</span>}
                                    </div>
                                    <span className="text-xs text-[#137fec] ml-2 shrink-0">Git</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {showResults && searchQuery.length > 0 && filteredResults.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c2127] border border-gray-700 rounded-lg shadow-xl p-4 z-50">
                            <p className="text-sm text-gray-400 text-center">Sonuç bulunamadı</p>
                            <p className="text-xs text-gray-500 text-center mt-1">
                                Enter&apos;a basarak detaylı arama yapabilirsiniz
                            </p>
                        </div>
                    )}
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

                <div className="h-4 w-px bg-gray-700" />

                {/* Profile */}
                <Link href="/dashboard/settings" className="flex items-center gap-3 pl-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-700 ring-2 ring-gray-700">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#137fec] text-sm font-medium text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
