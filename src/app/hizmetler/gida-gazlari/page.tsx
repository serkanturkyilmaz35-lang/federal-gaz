"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Gıda Gazları",
        subtitle: "Gıda güvenliği ve raf ömrü uzatma için sertifikalı gaz çözümleri",
        home: "Ana Sayfa",
        services: "Hizmetler",
        detailsTitle: "Hizmet Detayları",
        details: "Federal Gaz olarak, gıda ve içecek sektöründe tazeliği korumak ve kaliteyi artırmak için gıda sınıfı gazlar sunuyoruz.",
        listTitle: "Sunduğumuz Gıda Gazları:",
        list: [
            "Gıda Sınıfı Karbondioksit (CO₂)",
            "Gıda Sınıfı Azot (N₂)",
            "MAP (Modifiye Atmosfer Paketleme) Gazları",
            "Kuru Buz",
            "Oksijen (O₂)",
            "İçecek Gazlama Çözümleri"
        ],
        featuresTitle: "Özellikler:",
        features: [
            "Gıda güvenliği sertifikalı üretim",
            "Raf ömrünü uzatan özel karışımlar",
            "Bakteri oluşumunu engelleyen çözümler",
            "Tazelik ve lezzet koruma",
            "Düzenli tedarik ve stok takibi"
        ],
        orderBtn: "Sipariş Ver"
    },
    EN: {
        title: "Food Gases",
        subtitle: "Certified gas solutions for food safety and shelf life extension",
        home: "Home",
        services: "Services",
        detailsTitle: "Service Details",
        details: "As Federal Gaz, we offer food grade gases to preserve freshness and enhance quality in the food and beverage industry.",
        listTitle: "Food Gases We Offer:",
        list: [
            "Food Grade Carbon Dioxide (CO₂)",
            "Food Grade Nitrogen (N₂)",
            "MAP (Modified Atmosphere Packaging) Gases",
            "Dry Ice",
            "Oxygen (O₂)",
            "Beverage Carbonation Solutions"
        ],
        featuresTitle: "Features:",
        features: [
            "Food safety certified production",
            "Special mixtures extending shelf life",
            "Solutions preventing bacterial growth",
            "Preserving freshness and taste",
            "Regular supply and stock tracking"
        ],
        orderBtn: "Order Now"
    }
};

export default function GidaGazlariPage() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <nav className="mb-4 flex items-center gap-2 text-sm">
                        <Link href="/" className="hover:text-primary">{t.home}</Link>
                        <span>/</span>
                        <Link href="/hizmetler" className="hover:text-primary">{t.services}</Link>
                        <span>/</span>
                        <span>{t.title}</span>
                    </nav>
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">{t.title}</h1>
                    <p className="mt-4 text-lg text-white/80">{t.subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-12 lg:grid-cols-2">
                        <div>
                            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop" alt={t.title} className="h-96 w-full rounded-xl object-cover shadow-lg" />
                        </div>
                        <div>
                            <h2 className="mb-6 text-3xl font-bold text-secondary dark:text-white">{t.detailsTitle}</h2>
                            <div className="space-y-4 text-secondary/80 dark:text-white/70">
                                <p>{t.details}</p>
                                <h3 className="mt-6 text-xl font-bold text-secondary dark:text-white">{t.listTitle}</h3>
                                <ul className="list-disc space-y-2 pl-6">
                                    {t.list.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                                <h3 className="mt-6 text-xl font-bold text-secondary dark:text-white">{t.featuresTitle}</h3>
                                <ul className="list-disc space-y-2 pl-6">
                                    {t.features.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-8">
                                <Link href="/siparis" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90">
                                    <span>{t.orderBtn}</span>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
