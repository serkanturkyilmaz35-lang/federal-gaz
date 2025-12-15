'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useEffect, useState } from 'react';

interface PageContent {
    title: string;
    titleEn?: string;
    content: string;
    contentEn?: string;
}

export default function PrivacyPolicyPage() {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    const companyName = settings.site_name || 'Federal Gaz';
    const email = settings.contact_email || 'federal.gaz@hotmail.com';
    const phone = settings.contact_phone || '(0312) 395 35 95';
    const address = settings.contact_address || 'İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara';

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch('/api/pages/gizlilik-politikasi');
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

    // If we have database content, use it
    const title = pageContent
        ? (language === 'EN' ? (pageContent.titleEn || pageContent.title) : pageContent.title)
        : (language === 'EN' ? 'Privacy Policy' : 'Gizlilik Politikası');

    const content = pageContent
        ? (language === 'EN' ? (pageContent.contentEn || pageContent.content) : pageContent.content)
        : null;

    // Replace placeholders in content
    const processedContent = content
        ? content
            .replace(/\{companyName\}/g, companyName)
            .replace(/\{email\}/g, email)
            .replace(/\{phone\}/g, phone)
            .replace(/\{address\}/g, address)
        : null;

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-white/60">
                        {language === 'EN' ? 'Last Updated: December 15, 2025' : 'Son Güncelleme: 15 Aralık 2025'}
                    </p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    ) : processedContent ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: processedContent }}
                            className="[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary dark:[&_h2]:text-white [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_ul]:text-gray-600 dark:[&_ul]:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-gray-600 dark:[&_li]:text-gray-400"
                        />
                    ) : (
                        <FallbackContent language={language} companyName={companyName} email={email} phone={phone} address={address} />
                    )}
                </div>
            </section>
        </>
    );
}

// Fallback content if database is not available
function FallbackContent({ language, companyName, email, phone, address }: { language: string; companyName: string; email: string; phone: string; address: string }) {
    if (language === 'EN') {
        return (
            <>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {companyName} (&quot;Company&quot;) is committed to protecting your personal data.
                </p>
                <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Data Controller</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    <strong>{companyName}</strong><br />
                    Address: {address}<br />
                    Email: {email}<br />
                    Phone: {phone}
                </p>
                <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Contact</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    For questions about this policy: {email}
                </p>
            </>
        );
    }

    return (
        <>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                {companyName} olarak müşterilerimizin bilgilerinin gizliliğini korumak amacıyla aşağıda belirtilen temel kuralları benimsemiştir.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Veri Sorumlusu</h2>
            <p className="text-gray-600 dark:text-gray-400">
                <strong>{companyName}</strong><br />
                Adres: {address}<br />
                E-posta: {email}<br />
                Telefon: {phone}
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">İletişim</h2>
            <p className="text-gray-600 dark:text-gray-400">
                Gizlilik politikamız hakkında sorularınız için: {email}
            </p>
        </>
    );
}
