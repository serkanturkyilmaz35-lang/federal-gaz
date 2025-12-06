"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Medikal Gazlar",
        subtitle: "Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki",
        home: "Ana Sayfa",
        services: "Hizmetler",
        detailsTitle: "Hizmet Detayları",
        details: "Federal Gaz olarak, sağlık sektörünün en hassas ihtiyaçlarını karşılamak için yüksek saflıkta medikal gaz tedariki ve sistemleri sunuyoruz.",
        listTitle: "Sunduğumuz Medikal Gazlar:",
        list: [
            "Medikal Oksijen (O₂)",
            "Medikal Azot (N₂)",
            "Medikal Hava",
            "Karbondioksit (CO₂)",
            "Azot Protoksit (N₂O)",
            "Özel Gaz Karışımları"
        ],
        featuresTitle: "Özellikler:",
        features: [
            "Uluslararası standartlara uygun üretim",
            "Sürekli kalite kontrol",
            "Hızlı ve güvenli teslimat",
            "7/24 teknik destek",
            "Tüp ve tank kiralama seçenekleri"
        ],
        orderBtn: "Sipariş Ver"
    },
    EN: {
        title: "Medical Gases",
        subtitle: "High purity medical gas supply for the sensitive needs of the healthcare sector",
        home: "Home",
        services: "Services",
        detailsTitle: "Service Details",
        details: "As Federal Gaz, we provide high purity medical gas supply and systems to meet the most sensitive needs of the healthcare sector.",
        listTitle: "Medical Gases We Offer:",
        list: [
            "Medical Oxygen (O₂)",
            "Medical Nitrogen (N₂)",
            "Medical Air",
            "Carbon Dioxide (CO₂)",
            "Nitrous Oxide (N₂O)",
            "Special Gas Mixtures"
        ],
        featuresTitle: "Features:",
        features: [
            "Production in accordance with international standards",
            "Continuous quality control",
            "Fast and safe delivery",
            "24/7 technical support",
            "Cylinder and tank rental options"
        ],
        orderBtn: "Order Now"
    }
};

export default function MedikalGazlarPage() {
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
                            <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop" alt={t.title} className="h-96 w-full rounded-xl object-cover shadow-lg" />
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
