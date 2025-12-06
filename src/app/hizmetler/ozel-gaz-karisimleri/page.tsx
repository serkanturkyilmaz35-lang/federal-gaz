"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Özel Gaz Karışımları",
        subtitle: "Laboratuvar, analiz ve özel üretim prosesleriniz için hassas gaz karışımları",
        home: "Ana Sayfa",
        services: "Hizmetler",
        detailsTitle: "Hizmet Detayları",
        details: "Araştırma, kalite kontrol ve hassas üretim süreçleriniz için, ppm seviyesine kadar hassasiyetle hazırlanan sertifikalı özel gaz karışımları sunuyoruz.",
        listTitle: "Özel Karışım Çözümlerimiz:",
        list: [
            "Kalibrasyon Gazları",
            "Laboratuvar Gazları (5.0, 6.0 Saflık)",
            "Lazer Kesim Gazları",
            "Emisyon Ölçüm Gazları",
            "Özel Proses Karışımları",
            "Elektronik Sektörü Gazları"
        ],
        featuresTitle: "Özellikler:",
        features: [
            "Gravimetrik dolum teknolojisi",
            "ISO 17025 akreditasyonlu analiz sertifikası",
            "Karışım stabilitesi garantisi",
            "Özel regülatör ve ekipman desteği",
            "Teknik uygulama danışmanlığı"
        ],
        orderBtn: "Sipariş Ver"
    },
    EN: {
        title: "Special Gas Mixtures",
        subtitle: "Precise gas mixtures for your laboratory, analysis and special production processes",
        home: "Home",
        services: "Services",
        detailsTitle: "Service Details",
        details: "We offer certified special gas mixtures prepared with precision down to ppm level for your research, quality control and sensitive production processes.",
        listTitle: "Our Special Mixture Solutions:",
        list: [
            "Calibration Gases",
            "Laboratory Gases (5.0, 6.0 Purity)",
            "Laser Cutting Gases",
            "Emission Measurement Gases",
            "Special Process Mixtures",
            "Electronics Sector Gases"
        ],
        featuresTitle: "Features:",
        features: [
            "Gravimetric filling technology",
            "ISO 17025 accredited analysis certificate",
            "Mixture stability guarantee",
            "Special regulator and equipment support",
            "Technical application consultancy"
        ],
        orderBtn: "Order Now"
    }
};

export default function OzelGazKarisimleriPage() {
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
                            <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop" alt={t.title} className="h-96 w-full rounded-xl object-cover shadow-lg" />
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
