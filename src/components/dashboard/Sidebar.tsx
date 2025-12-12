"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
    { icon: "person", label: "Üyeler", href: "/dashboard/members" },
    { icon: "inventory_2", label: "Ürünler", href: "/dashboard/products" },
    { icon: "build", label: "Hizmetler", href: "/dashboard/services" },
    { icon: "article", label: "İçerik Yönetimi", href: "/dashboard/content" },
    { icon: "image", label: "Medya", href: "/dashboard/media" },
    { icon: "mail", label: "Mailing", href: "/dashboard/mailing" },
    { icon: "palette", label: "E-posta Şablonları", href: "/dashboard/templates" },
    { icon: "pie_chart", label: "Analitik", href: "/dashboard/analytics" },
    { icon: "settings", label: "Ayarlar", href: "/dashboard/settings" },
];

export default function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMobileOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    // Logo click handler - refresh if on dashboard, navigate otherwise
    const handleLogoClick = () => {
        setIsMobileOpen(false);
        if (pathname === "/dashboard") {
            // Same page - hard refresh
            window.location.reload();
        } else {
            // Different page - navigate to dashboard
            router.push("/dashboard");
        }
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col justify-between">
            {/* Logo & Brand - Clickable */}
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleLogoClick}
                        className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity cursor-pointer"
                    >
                        <img
                            src="/dashboard-logo.png"
                            alt="Federal Gaz Logo"
                            className={`${isCollapsed && !isMobileOpen ? "h-10 w-10" : "h-12 w-12"} object-contain`}
                        />
                        {(!isCollapsed || isMobileOpen) && (
                            <div className="flex flex-col text-left">
                                <h1 className="text-base font-bold leading-normal text-white">
                                    Federal Gaz
                                </h1>
                                <p className="text-sm font-normal leading-normal text-gray-400">
                                    Yönetim Paneli
                                </p>
                            </div>
                        )}
                    </button>
                    {/* Close button for mobile */}
                    {isMobileOpen && (
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => {
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname === item.href || pathname?.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 lg:py-2 rounded-lg transition-colors ${isActive
                                    ? "bg-[#b13329] text-white"
                                    : "text-gray-300 hover:bg-white/10"
                                    }`}
                                title={isCollapsed && !isMobileOpen ? item.label : undefined}
                            >
                                <span className={`material-symbols-outlined text-2xl ${isActive ? "text-white" : ""}`}>
                                    {item.icon}
                                </span>
                                {(!isCollapsed || isMobileOpen) && (
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

            {/* User Info & Controls - Desktop only */}
            <div className="hidden lg:flex flex-col gap-2 border-t border-gray-700 pt-4">
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
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Hamburger Button - Fixed at top left */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-[#151d27] rounded-lg shadow-lg text-white hover:bg-[#1c2530] transition-colors"
                aria-label="Menüyü aç"
            >
                <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <aside
                data-print-hide="true"
                className={`hidden lg:flex ${isCollapsed ? "w-20" : "w-64"
                    } flex-shrink-0 bg-[#151d27] p-4 transition-all duration-300 flex-col print:hidden`}
            >
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar - Slide from left */}
            <aside
                className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-[#151d27] p-4 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent />
            </aside>
        </>
    );
}
