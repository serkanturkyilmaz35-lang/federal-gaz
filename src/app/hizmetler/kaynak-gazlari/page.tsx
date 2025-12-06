"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Kaynak Gazları",
        subtitle: "Metal işleme ve kaynak uygulamaları için yüksek performanslı gaz çözümleri",
        home: "Ana Sayfa",
        services: "Hizmetler",
        detailsTitle: "Hizmet Detayları",
        details: "Federal Gaz olarak, kaynak kalite ve verimliliğinizi artırmak için özel olarak hazırlanmış koruyucu kaynak gazları ve karışımları sunuyoruz.",
        listTitle: "Sunduğumuz Kaynak Gazları:",
        list: [
            "Asetilen (C₂H₂)",
            "Argon (Ar)",
            "Karbondioksit (CO₂)",
            "Argon-Karbondioksit Karışımları",
            "Oksijen (O₂)",
            "Özel Kaynak Karışımları"
        ],
        featuresTitle: "Özellikler:",
        features: [
            "Yüksek saflıkta gazlar",
            "Stabil ark oluşumu sağlayan karışımlar",
            "Sıçramayı azaltan formüller",
            "Farklı ambalaj seçenekleri",
            "Teknik danışmanlık hizmeti"
        ],
        orderBtn: "Sipariş Ver"
    },
    EN: {
        title: "Welding Gases",
        subtitle: "High-performance gas solutions for metal processing and welding applications",
        home: "Home",
        services: "Services",
        detailsTitle: "Service Details",
        details: "As Federal Gaz, we offer specially prepared shielding welding gases and mixtures to increase your welding quality and efficiency.",
        listTitle: "Welding Gases We Offer:",
        list: [
            "Acetylene (C₂H₂)",
            "Argon (Ar)",
            "Carbon Dioxide (CO₂)",
            "Argon-Carbon Dioxide Mixtures",
            "Oxygen (O₂)",
            "Special Welding Mixtures"
        ],
        featuresTitle: "Features:",
        features: [
            "High purity gases",
            "Mixtures ensuring stable arc formation",
            "Spatter-reducing formulas",
            "Various packaging options",
            "Technical consultancy service"
        ],
        orderBtn: "Order Now"
    }
};

export default function KaynakGazlariPage() {
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
                            <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop" alt={t.title} className="h-96 w-full rounded-xl object-cover shadow-lg" />
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
