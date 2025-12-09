"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const translations = {
    TR: {
        home: "Ana Sayfa",
        about: "Hakkımızda",
        services: "Hizmetlerimiz",
        products: "Ürünlerimiz",
        contact: "İletişim",
        gallery: "Galeri",
        getOffer: "Teklif Al",
        login: "Üye Girişi",
        register: "Kayıt Ol",
        language: "TR",
        menu: "Menü",
        order: "Sipariş Ver"
    },
    EN: {
        home: "Home",
        about: "About Us",
        services: "Services",
        products: "Products",
        contact: "Contact",
        gallery: "Gallery",
        getOffer: "Get Offer",
        login: "Login",
        register: "Register",
        language: "EN",
        menu: "Menu",
        order: "Order Now"
    }
};

export default function Header() {
    const { language, setLanguage, toggleLanguage } = useLanguage();
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const t = translations[language];
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    };

    const navigation = [
        { name: t.home, href: "/", title: language === 'TR' ? 'Federal Gaz Ana Sayfa' : 'Federal Gaz Home' },
        { name: t.about, href: "/hakkimizda", title: language === 'TR' ? 'Federal Gaz Hakkında' : 'About Federal Gaz' },
        { name: t.services, href: "/hizmetler", title: language === 'TR' ? 'Federal Gaz Hizmetleri' : 'Federal Gaz Services' },
        { name: t.products, href: "/urunler", title: language === 'TR' ? 'Endüstriyel Gaz Ürünleri' : 'Industrial Gas Products' },
        { name: t.gallery, href: "/galeri", title: language === 'TR' ? 'Federal Gaz Galeri' : 'Federal Gaz Gallery' },
        { name: t.contact, href: "/iletisim", title: language === 'TR' ? 'Federal Gaz İletişim' : 'Contact Federal Gaz' },
    ];

    const navLinkClass = (path: string, isMobile = false) => {
        const baseClass = isMobile
            ? "block w-full rounded-lg px-4 py-3 text-lg font-bold transition-all border-l-4 border-transparent active:scale-[0.98] active:bg-gray-50"
            : "rounded-lg border-2 px-4 py-2 text-sm font-bold shadow-sm transition-all";

        if (isActive(path)) {
            return isMobile
                ? `${baseClass} text-primary border-primary bg-primary/5`
                : `${baseClass} border-primary bg-primary text-white`;
        }
        return isMobile
            ? `${baseClass} text-secondary dark:text-white`
            : `${baseClass} border-secondary/20 bg-white text-secondary hover:border-primary hover:bg-primary hover:text-white dark:bg-background-dark dark:text-white`;
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
                <div className="flex justify-center px-4 lg:px-10">
                    <div className="flex w-full max-w-7xl items-center justify-between py-3">

                        {/* Mobile Hamburger Button (Left) */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-secondary hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo (Centered on Mobile, Left on Desktop) */}
                        <Link href="/" className="relative flex items-center justify-center lg:justify-start">
                            <img src="/logo.jpg" alt="Federal Gaz Logo" className="h-16 lg:h-24 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
                        </Link>

                        {/* Mobile Login Button (Right) */}
                        <div className="lg:hidden flex items-center">
                            {user ? (
                                <Link href="/profil" rel="nofollow" className="flex h-10 items-center justify-center rounded-lg px-3 font-bold text-white text-xs whitespace-nowrap" style={{ backgroundColor: '#686868' }}>
                                    <span>{user.name.split(' ')[0]}</span>
                                </Link>
                            ) : (
                                <Link href="/giris" rel="nofollow" className="flex h-10 items-center justify-center rounded-lg px-3 font-bold text-white text-xs whitespace-nowrap" style={{ backgroundColor: '#686868' }}>
                                    <span>{t.login}</span>
                                </Link>
                            )}
                        </div>

                        <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex">
                            {navigation.map((item) => (
                                <Link key={item.href} href={item.href} title={item.title} className={navLinkClass(item.href)}>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right Side Actions (Desktop Only) */}
                        <div className="hidden lg:flex items-center gap-3">
                            {loading ? (
                                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                            ) : user ? (
                                <Link href="/profil" rel="nofollow" className="flex h-10 items-center gap-2 rounded-lg px-4 font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: '#686868' }}>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{user.name}</span>
                                </Link>
                            ) : (
                                <Link href="/giris" rel="nofollow" className="flex h-10 items-center gap-2 rounded-lg px-4 font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: '#686868' }}>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{t.login}</span>
                                </Link>
                            )}
                            <button onClick={toggleLanguage} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-secondary/10 px-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                                <span className={`text-base font-bold transition-colors ${language === 'TR' ? 'text-primary' : 'text-secondary/50'}`}>TR</span>
                                <span className="text-secondary">/</span>
                                <span className={`text-base font-bold transition-colors ${language === 'EN' ? 'text-primary' : 'text-secondary/50'}`}>EN</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay (Full Screen Z-50) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    {/* Fake Header inside Menu for seamless look */}
                    <div className="flex justify-center px-4 shadow-sm bg-white">
                        <div className="flex w-full max-w-7xl items-center justify-between py-3">
                            {/* Close Button (Left) */}
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-secondary hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Logo (Center) */}
                            <div className="relative flex items-center justify-center">
                                <img src="/logo.jpg" alt="Federal Gaz Logo" className="h-16 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
                            </div>

                            {/* Login Button (Right) */}
                            <div className="flex items-center">
                                {user ? (
                                    <Link href="/profil" onClick={() => setIsMobileMenuOpen(false)} className="flex h-10 items-center justify-center rounded-lg px-3 font-bold text-white text-xs whitespace-nowrap" style={{ backgroundColor: '#686868' }}>
                                        <span>{user.name.split(' ')[0]}</span>
                                    </Link>
                                ) : (
                                    <Link href="/giris" onClick={() => setIsMobileMenuOpen(false)} className="flex h-10 items-center justify-center rounded-lg px-3 font-bold text-white text-xs whitespace-nowrap" style={{ backgroundColor: '#686868' }}>
                                        <span>{t.login}</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Menu Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={item.title}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={navLinkClass(item.href, true)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Footer Area */}
                    <div className="p-4 bg-gray-50 flex flex-col gap-4 border-t border-gray-100">
                        {/* Order Button */}
                        <Link
                            href="/siparis"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-white text-lg font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                        >
                            <span>{t.order}</span>
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </Link>

                        {/* Language Selector */}
                        <button onClick={toggleLanguage} className="flex h-12 w-full items-center justify-center gap-4 rounded-lg bg-white border-2 border-secondary/10">
                            <span className={`text-lg font-bold ${language === 'TR' ? 'text-primary' : 'text-gray-400'}`}>TR</span>
                            <span className="text-gray-300">|</span>
                            <span className={`text-lg font-bold ${language === 'EN' ? 'text-primary' : 'text-gray-400'}`}>EN</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

