"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Hizmetlerimiz",
        subtitle: "Endüstriyel gaz ihtiyaçlarınız için kapsamlı çözümler sunuyoruz.",
        home: "Ana Sayfa",
        services: [
            { icon: "medical_services", title: "Medikal Gazlar", desc: "Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki ve sistemleri.", link: "/hizmetler/medikal-gazlar" },
            { icon: "propane_tank", title: "Endüstriyel Gaz Dolumu", desc: "Oksijen, azot, argon ve diğer endüstriyel gazların güvenli ve hızlı dolum hizmetleri.", link: "/hizmetler/endustriyel-gaz-dolumu" },

            { icon: "construction", title: "Kaynak Gazları", desc: "Kaynak işlemleriniz için özel karışım gazlar ve ekipman tedariki.", link: "/hizmetler/kaynak-gazlari" },
            { icon: "restaurant", title: "Gıda Gazları", desc: "Gıda endüstrisi için güvenli ve onaylı gaz çözümleri.", link: "/hizmetler/gida-gazlari" },
            { icon: "science", title: "Özel Gaz Karışımları", desc: "İhtiyaçlarınıza özel hazırlanan gaz karışımları ve danışmanlık hizmetleri.", link: "/hizmetler/ozel-gaz-karisimleri" }
        ]
    },
    EN: {
        title: "Our Services",
        subtitle: "We offer comprehensive solutions for your industrial gas needs.",
        home: "Home",
        services: [
            { icon: "medical_services", title: "Medical Gases", desc: "High-purity medical gas supply and systems for the sensitive needs of the healthcare sector.", link: "/hizmetler/medikal-gazlar" },
            { icon: "propane_tank", title: "Industrial Gas Filling", desc: "Safe and fast filling services for oxygen, nitrogen, argon, and other industrial gases.", link: "/hizmetler/endustriyel-gaz-dolumu" },

            { icon: "construction", title: "Welding Gases", desc: "Special mixture gases and equipment supply for your welding operations.", link: "/hizmetler/kaynak-gazlari" },
            { icon: "restaurant", title: "Food Gases", desc: "Safe and approved gas solutions for the food industry.", link: "/hizmetler/gida-gazlari" },
            { icon: "science", title: "Special Gas Mixtures", desc: "Custom prepared gas mixtures and consultancy services for your needs.", link: "/hizmetler/ozel-gaz-karisimleri" }
        ]
    }
};

export default function HizmetlerPage() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <nav className="mb-4 flex items-center gap-2 text-sm">
                        <Link href="/" className="hover:text-primary">{t.home}</Link>
                        <span>/</span>
                        <span>{t.title}</span>
                    </nav>
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">{t.title}</h1>
                    <p className="mt-4 text-lg text-white/80">{t.subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {t.services.map((service, i) => (
                            <Link key={i} href={service.link} className="flex flex-col items-center rounded-xl bg-white p-8 text-center shadow-md transition-transform hover:scale-105 dark:bg-background-dark">
                                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                    <span className="material-symbols-outlined text-4xl text-primary">{service.icon}</span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">{service.title}</h3>
                                <p className="text-secondary/70 dark:text-white/60">{service.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
