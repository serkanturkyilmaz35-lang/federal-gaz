'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useEffect, useState } from 'react';

interface PageContent {
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
}

export default function CookiePolicyPage() {
    const { language } = useLanguage();
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch('/api/pages/cerez-politikasi');
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
    }, []);

    const title = pageContent
        ? (language === 'EN' ? (pageContent.titleEn || pageContent.title) : pageContent.title)
        : (language === 'EN' ? 'Cookie Policy' : 'Çerez Politikası');

    const subtitle = language === 'EN' ? 'Last Updated: December 15, 2025' : 'Son Güncelleme: 15 Aralık 2025';

    const content = pageContent
        ? (language === 'EN' ? (pageContent.contentEn || pageContent.content) : pageContent.content)
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
                <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : content ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: content }}
                            className="[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary dark:[&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-secondary dark:[&_h3]:text-white [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_ul]:text-gray-600 dark:[&_ul]:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-gray-600 dark:[&_li]:text-gray-400"
                        />
                    ) : (
                        <FallbackContent language={language} />
                    )}
                </div>
            </section>
        </>
    );
}

function FallbackContent({ language }: { language: string }) {
    if (language === 'EN') {
        return (
            <>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    We use cookies to enhance your experience on our website. This policy explains the types of cookies we use and how you can control them.
                </p>
                <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">What are Cookies?</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Cookies are small text files stored on your device when you visit websites.
                </p>
                <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Contact</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    For questions about our cookie policy: federal.gaz@hotmail.com
                </p>
            </>
        );
    }

    return (
        <>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Federal Gaz olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek ve size daha iyi hizmet sunmak amacıyla çerezler kullanmaktayız.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Çerez Nedir?</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Çerezler, web sitelerinin tarayıcınıza gönderdiği ve cihazınızda saklanan küçük metin dosyalarıdır.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">İletişim</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Çerez politikamız hakkında sorularınız için: federal.gaz@hotmail.com
            </p>
        </>
    );
}
