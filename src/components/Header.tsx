"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

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
        language: "TR"
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
        language: "EN"
    }
};

export default function Header() {
    const { language, setLanguage, toggleLanguage } = useLanguage();
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const t = translations[language];

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    };

    const navigation = [
        { name: t.home, href: "/" },
        { name: t.about, href: "/hakkimizda" },
        { name: t.services, href: "/hizmetler" },
        { name: t.products, href: "/urunler" },
        { name: t.gallery, href: "/galeri" },
        { name: t.contact, href: "/iletisim" },
    ];

    const navLinkClass = (path: string) => {
        const baseClass = "rounded-lg border-2 px-4 py-2 text-sm font-bold shadow-sm transition-all";
        if (isActive(path)) {
            return `${baseClass} border-primary bg-primary text-white`;
        }
        return `${baseClass} border-secondary/20 bg-white text-secondary hover:border-primary hover:bg-primary hover:text-white dark:bg-background-dark dark:text-white`;
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
            <div className="flex justify-center px-4 lg:px-10">
                <div className="flex w-full max-w-7xl items-center justify-between whitespace-nowrap border-b border-solid border-secondary/10 py-3 dark:border-white/10">
                    <Link href="/" className="flex items-center gap-4 text-secondary dark:text-white">
                        <img src="/logo.jpg" alt="Federal Gaz Logo" className="h-24 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
                    </Link>
                    <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex">
                        {navigation.map((item) => (
                            <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                        ) : user ? (
                            <Link href="/profil" className="flex h-10 items-center gap-2 rounded-lg px-4 font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: '#686868' }}>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{user.name}</span>
                            </Link>
                        ) : (
                            <Link href="/giris" className="flex h-10 items-center gap-2 rounded-lg px-4 font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: '#686868' }}>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{t.login}</span>
                            </Link>
                        )}
                        <button onClick={toggleLanguage} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg px-4">
                            <span className={`text-base font-bold transition-colors ${language === 'TR' ? 'text-primary' : 'text-secondary/50'}`}>TR</span>
                            <span className="text-secondary">/</span>
                            <span className={`text-base font-bold transition-colors ${language === 'EN' ? 'text-primary' : 'text-secondary/50'}`}>EN</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
