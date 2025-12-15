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

export default function KVKKPage() {
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
                const res = await fetch('/api/pages/kvkk');
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
        : (language === 'EN' ? 'KVKK Disclosure Notice' : '6698 Sayılı KVKK Aydınlatma Metni');

    const content = pageContent
        ? (language === 'EN' ? (pageContent.contentEn || pageContent.content) : pageContent.content)
        : null;

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
                        {language === 'EN' ? 'Personal Data Protection Law No. 6698' : 'KVKK Uyarınca Kişisel Verilerin İşlenmesine İlişkin Bilgilendirme'}
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
                            className="[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary dark:[&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-secondary dark:[&_h3]:text-white [&_p]:text-gray-600 dark:[&_p]:text-gray-400 [&_ul]:text-gray-600 dark:[&_ul]:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:text-gray-600 dark:[&_li]:text-gray-400"
                        />
                    ) : (
                        <FallbackContent language={language} companyName={companyName} email={email} phone={phone} address={address} />
                    )}
                </div>
            </section>
        </>
    );
}

function FallbackContent({ language, companyName, email, phone, address }: { language: string; companyName: string; email: string; phone: string; address: string }) {
    if (language === 'EN') {
        return (
            <>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {companyName} processes your personal data in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK).
                </p>
                <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Data Controller</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    <strong>{companyName}</strong><br />
                    Address: {address}<br />
                    Email: {email}<br />
                    Phone: {phone}
                </p>
            </>
        );
    }

    return (
        <>
            <p className="text-lg text-gray-600 dark:text-gray-400">
                Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere, kişilerin temel hak ve özgürlüklerini korumak amacıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu yürürlüğe girmiştir.
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Veri Sorumlusu</h2>
            <p className="text-gray-600 dark:text-gray-400">
                <strong>{companyName}</strong><br />
                Adres: {address}<br />
                E-posta: {email}<br />
                Telefon: {phone}
            </p>
            <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Başvuru</h2>
            <p className="text-gray-600 dark:text-gray-400">
                E-posta: {email}
            </p>
        </>
    );
}
