"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { parseIcon } from "@/utils/iconUtils";

const translations = {
    TR: {
        title: "Hizmetlerimiz",
        subtitle: "Endüstriyel gaz ihtiyaçlarınız için kapsamlı çözümler sunuyoruz.",
        home: "Ana Sayfa"
    },
    EN: {
        title: "Our Services",
        subtitle: "We offer comprehensive solutions for your industrial gas needs.",
        home: "Home"
    }
};

export default function HizmetlerPage() {
    const { language } = useLanguage();
    const t = translations[language];
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/dashboard/services');
                if (res.ok) {
                    const data = await res.json();
                    setServices(data.services || []);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

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
                    {loading ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {services.filter(s => s.isActive).map((service) => {
                                const { name: iconName, color: iconColor } = parseIcon(service.icon);
                                return (
                                    <Link
                                        key={service.id}
                                        href={`/hizmetler/${service.slug}`}
                                        className="group flex flex-col items-center rounded-xl bg-white p-8 text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-[#1c2127] dark:border dark:border-[#3b4754]"
                                    >
                                        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                                            <span
                                                className={`material-symbols-outlined text-4xl transition-colors ${!iconColor ? 'text-primary' : ''}`}
                                                style={{ color: iconColor }}
                                            >
                                                {iconName}
                                            </span>
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold text-secondary dark:text-white group-hover:text-primary transition-colors">
                                            {language === 'TR' ? service.titleTR : service.titleEN}
                                        </h3>
                                        <p className="mb-6 text-base text-secondary/70 dark:text-gray-400">
                                            {language === 'TR' ? service.descTR : service.descEN}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section >
        </>
    );
}
