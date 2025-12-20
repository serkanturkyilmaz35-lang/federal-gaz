"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        home: "Ana Sayfa",
        services: "Hizmetler",
        loading: "Yükleniyor...",
        notFound: "Hizmet bulunamadı."
    },
    EN: {
        home: "Home",
        services: "Services",
        loading: "Loading...",
        notFound: "Service not found."
    }
};

export default function ServiceDetailPage() {
    const { slug } = useParams();
    const { language } = useLanguage();
    const t = translations[language];
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await fetch(`/api/dashboard/services?slug=${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setService(data.service);
                } else {
                    setService(null);
                }
            } catch (error) {
                console.error('Failed to fetch service:', error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchService();
    }, [slug]);

    if (loading) {
        return (
            <>
                <section className="bg-secondary py-16 text-white">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="h-12 w-3/4 animate-pulse rounded bg-white/20"></div>
                        <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-white/10"></div>
                    </div>
                </section>
                <section className="bg-background-light py-16 dark:bg-background-dark">
                    <div className="mx-auto max-w-7xl px-4">
                        <div className="h-96 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                </section>
            </>
        );
    }

    if (!service) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
                <h1 className="text-2xl font-bold text-secondary dark:text-white mb-4">{t.notFound}</h1>
                <Link href="/hizmetler" className="text-primary hover:underline">
                    {t.services}
                </Link>
            </div>
        );
    }

    // Helper to get localized content
    const loc = (keyTR: string, keyEN: string) => language === 'TR' ? service[keyTR] : service[keyEN];

    const title = loc('titleTR', 'titleEN');
    const subtitle = loc('subtitleTR', 'subtitleEN');
    const image = service.image;
    const detailsTitle = loc('detailsTitleTR', 'detailsTitleEN');
    const details = loc('detailsTR', 'detailsEN');

    const listTitle = loc('listTitleTR', 'listTitleEN');
    const listItems = loc('listItemsTR', 'listItemsEN')?.split('\n').filter(Boolean) || [];

    const featuresTitle = loc('featuresTitleTR', 'featuresTitleEN');
    const featureItems = loc('featureItemsTR', 'featureItemsEN')?.split('\n').filter(Boolean) || [];

    const ctaText = loc('ctaButtonTextTR', 'ctaButtonTextEN');
    const ctaLink = service.ctaButtonLink;

    return (
        <>
            {/* Header Section */}
            <section className="bg-secondary py-16 text-white text-center sm:text-left">
                <div className="mx-auto max-w-7xl px-4">
                    <nav className="mb-4 flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-400">
                        <Link href="/" className="hover:text-white transition-colors">{t.home}</Link>
                        <span>/</span>
                        <Link href="/hizmetler" className="hover:text-white transition-colors">{t.services}</Link>
                        <span>/</span>
                        <span className="text-white">{title}</span>
                    </nav>

                    {/* Title: Matches live site (Large, Bold, White) */}
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight mb-4">
                        {title}
                    </h1>

                    {/* Subtitle: Matches live site (Generic size, gray/white) */}
                    <p className="text-lg text-gray-300 max-w-3xl">
                        {subtitle}
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {/* Image Column */}
                        <div>
                            {image && (
                                <img
                                    src={image}
                                    alt={title}
                                    className="h-96 w-full rounded-xl object-cover shadow-lg bg-gray-200 dark:bg-gray-800"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            )}
                        </div>

                        {/* Content Column */}
                        <div>
                            {/* Main Details */}
                            {details && (
                                <div className="mb-8">
                                    {/* H2 Title: Large, Bold - Matches live 'Hizmet Detayları' */}
                                    <h2 className="mb-4 text-3xl font-bold text-secondary dark:text-white">
                                        {detailsTitle || (language === 'TR' ? 'Hizmet Detayları' : 'Service Details')}
                                    </h2>
                                    {/* Body Text: Readable, standard size */}
                                    <p className="text-base text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                        {details}
                                    </p>
                                </div>
                            )}

                            {/* Lists & Features */}
                            <div className="space-y-8 text-secondary/80 dark:text-white/70">
                                {listItems.length > 0 && (
                                    <div>
                                        {/* H3 Title: Matches live 'Sunduğumuz...' */}
                                        <h3 className="mb-3 text-xl font-bold text-secondary dark:text-white">
                                            {listTitle}
                                        </h3>
                                        {/* List: Bullet points */}
                                        <ul className="list-disc space-y-2 pl-5 text-base text-gray-600 dark:text-gray-300">
                                            {listItems.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {featureItems.length > 0 && (
                                    <div>
                                        <h3 className="mb-3 text-xl font-bold text-secondary dark:text-white">
                                            {featuresTitle}
                                        </h3>
                                        <ul className="list-disc space-y-2 pl-5 text-base text-gray-600 dark:text-gray-300">
                                            {featureItems.map((item: string, i: number) => (
                                                <li key={i}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            {ctaLink && ctaText && (
                                <div className="mt-10">
                                    <Link
                                        href={ctaLink}
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90 shadow-lg shadow-blue-500/20"
                                    >
                                        <span>{ctaText}</span>
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
