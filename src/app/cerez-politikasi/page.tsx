'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useEffect, useState } from 'react';

interface PageContent {
    title: string;
    titleEn?: string;
    subtitle?: string;
    subtitleEn?: string;
    content: string;
    contentEn?: string;
}

export default function CookiePolicyPage() {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    const companyName = settings.site_name || 'Federal Gaz';
    const email = settings.contact_email || 'federal.gaz@hotmail.com';

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const params = new URLSearchParams({
                    site_name: companyName,
                    contact_email: email,
                });
                const res = await fetch(`/api/pages/cerez-politikasi?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setPageContent(data.page);
                }
            } catch (error) {
                console.error('Error fetching page:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [companyName, email]);

    const replacePlaceholders = (text: string) => {
        return text
            .replace(/\{\{companyName\}\}/g, companyName)
            .replace(/\{\{email\}\}/g, email);
    };

    const title = pageContent
        ? (language === 'EN' ? (pageContent.titleEn || pageContent.title) : pageContent.title)
        : (language === 'EN' ? 'Cookie Policy' : 'Çerez Politikası');

    const subtitle = pageContent
        ? (language === 'EN' ? (pageContent.subtitleEn || pageContent.subtitle) : pageContent.subtitle)
        : (language === 'EN' ? 'Last Updated: December 15, 2025' : 'Son Güncelleme: 15 Aralık 2025');

    const content = pageContent
        ? replacePlaceholders(language === 'EN' ? (pageContent.contentEn || pageContent.content) : pageContent.content)
        : null;

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-white/60">{subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : content ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: content }}
                            className="prose prose-lg dark:prose-invert max-w-none
                                [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary dark:[&_h2]:text-white
                                [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-secondary dark:[&_h3]:text-white
                                [&_p]:text-gray-600 dark:[&_p]:text-gray-400
                                [&_ul]:text-gray-600 dark:[&_ul]:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                                [&_li]:text-gray-600 dark:[&_li]:text-gray-400"
                        />
                    ) : (
                        <FallbackContent language={language} companyName={companyName} email={email} />
                    )}
                </div>
            </section>
        </>
    );
}

function FallbackContent({ language, companyName, email }: { language: string; companyName: string; email: string }) {
    if (language === 'EN') {
        return (
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400">
                    We use cookies to enhance your experience on our website.
                </p>
                <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Contact</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    For questions: {email}
                </p>
            </div>
        );
    }

    return (
        <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-400">
                {companyName} olarak çerezler kullanmaktayız.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">İletişim</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Sorularınız için: {email}
            </p>
        </div>
    );
}
