"use client";

import { useState } from "react";

interface DashboardHeaderProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 bg-[#ece6e4]/80 px-6 py-4 backdrop-blur-sm dark:border-[#94847c]/30 dark:bg-[#292828]/80">
            {/* Search */}
            <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[#94847c]">
                        search
                    </span>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none focus:ring-2 focus:ring-[#b13329]/20 dark:border-[#94847c]/30 dark:bg-[#1c2127] dark:text-white"
                    placeholder="Ara..."
                />
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-[#292828] hover:bg-gray-100 dark:border-[#94847c]/30 dark:bg-[#1c2127] dark:text-white dark:hover:bg-[#283039]">
                    <span className="material-symbols-outlined text-xl">
                        notifications
                    </span>
                </button>

                {/* User Avatar & Info */}
                <div className="flex items-center gap-3">
                    {user?.avatar ? (
                        <div
                            className="h-10 w-10 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${user.avatar})` }}
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b13329]">
                            <span className="font-bold text-white">
                                {user?.name?.charAt(0) || "A"}
                            </span>
                        </div>
                    )}
                    <div className="hidden flex-col sm:flex">
                        <p className="text-sm font-medium text-[#292828] dark:text-white">
                            {user?.name || "Admin"}
                        </p>
                        <p className="text-xs text-[#94847c]">
                            {user?.email || "admin@federalgaz.com"}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
