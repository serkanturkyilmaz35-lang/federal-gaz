"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Endüstriyel Gaz Dolumu",
        subtitle: "Hızlı, güvenli ve standartlara uygun endüstriyel tüp dolum hizmetleri",
        home: "Ana Sayfa",
        services: "Hizmetler",
        detailsTitle: "Hizmet Detayları",
        details: "Federal Gaz tesislerinde, her türlü endüstriyel gaz tüpünün dolumu, bakımı ve test işlemleri uzman ekibimiz tarafından titizlikle yapılmaktadır.",
        listTitle: "Dolum Yaptığımız Gazlar:",
        list: [
            "Oksijen (O₂)",
            "Azot (N₂)",
            "Argon (Ar)",
            "Karbondioksit (CO₂)",
            "Helyum (He)",
            "Hidrojen (H₂)",
            "Karışım Gazları"
        ],
        featuresTitle: "Özellikler:",
        features: [
            "Otomatik dolum sistemleri",
            "Dolum öncesi ve sonrası sızdırmazlık testleri",
            "Tüp bakım ve boyama hizmeti",
            "Hidrostatik test sertifikasyonu",
            "Hızlı dolum ve teslimat"
        ],
        orderBtn: "Sipariş Ver"
    },
    EN: {
        title: "Industrial Gas Filling",
        subtitle: "Fast, safe and standard-compliant industrial cylinder filling services",
        home: "Home",
        services: "Services",
        detailsTitle: "Service Details",
        details: "At Federal Gaz facilities, filling, maintenance, and testing operations for all types of industrial gas cylinders are meticulously carried out by our expert team.",
        listTitle: "Gases We Fill:",
        list: [
            "Oxygen (O₂)",
            "Nitrogen (N₂)",
            "Argon (Ar)",
            "Carbon Dioxide (CO₂)",
            "Helium (He)",
            "Hydrogen (H₂)",
            "Mixed Gases"
        ],
        featuresTitle: "Features:",
        features: [
            "Automatic filling systems",
            "Pre- and post-filling leak tests",
            "Cylinder maintenance and painting service",
            "Hydrostatic test certification",
            "Fast filling and delivery"
        ],
        orderBtn: "Order Now"
    }
};

export default function EndustriyelGazDolumuPage() {
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
                            <img src="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop" alt={t.title} className="h-96 w-full rounded-xl object-cover shadow-lg" />
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
