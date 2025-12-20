'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState, useEffect } from 'react';

// Default translations (fallback)
const defaultTranslations = {
    TR: {
        title: 'Çerez Politikası',
        lastUpdate: 'Son Güncelleme: 15 Aralık 2024',
        intro: 'Federal Gaz olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek ve size daha iyi hizmet sunmak amacıyla çerezler kullanmaktayız. Bu politika, kullandığımız çerez türlerini ve bunları nasıl kontrol edebileceğinizi açıklamaktadır.',
        whatAreCookies: 'Çerez Nedir?',
        whatAreCookiesDesc: 'Çerezler, web sitelerinin tarayıcınıza gönderdiği ve cihazınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, siteye tekrar girdiğinizde sizi tanımamıza ve tercihlerinizi hatırlamamıza yardımcı olur.',
        cookieTypes: 'Kullandığımız Çerez Türleri',
        necessary: 'Zorunlu Çerezler',
        necessaryIcon: 'lock',
        necessaryDesc: 'Bu çerezler, web sitemizin temel işlevlerinin çalışması için gereklidir. Güvenlik, oturum yönetimi ve temel site işlevselliği için kullanılırlar. Bu çerezler kapatılamaz.',
        analytics: 'Analitik Çerezler',
        analyticsIcon: 'analytics',
        analyticsDesc: 'Bu çerezler, ziyaretçilerin sitemizi nasıl kullandığını anlamamıza yardımcı olur. Google Analytics gibi hizmetler aracılığıyla sayfa görüntülemeleri, trafik kaynakları ve kullanıcı davranışları hakkında anonim veriler toplarlar.',
        marketing: 'Pazarlama Çerezleri',
        marketingIcon: 'campaign',
        marketingDesc: 'Bu çerezler, size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır. Üçüncü taraf reklam ağları tarafından ayarlanabilirler.',
        functional: 'Fonksiyonel Çerezler',
        functionalIcon: 'settings',
        functionalDesc: 'Bu çerezler, dil tercihi, tema seçimi gibi gelişmiş özelliklerin ve kişiselleştirmelerin çalışmasını sağlar.',
        yourRights: 'Haklarınız',
        yourRightsDesc: 'KVKK ve ilgili mevzuat kapsamında, çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Sitemizi ilk ziyaretinizde çıkan çerez banner\'ı üzerinden veya tarayıcı ayarlarınızdan çerezleri kontrol edebilirsiniz.',
        howToManage: 'Çerezleri Nasıl Yönetebilirsiniz?',
        howToManageDesc: 'Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda sitemizin bazı özellikleri düzgün çalışmayabilir.',
        contact: 'İletişim',
        contactDesc: 'Çerez politikamız hakkında sorularınız için federal.gaz@hotmail.com adresinden bize ulaşabilirsiniz.'
    },
    EN: {
        title: 'Cookie Policy',
        lastUpdate: 'Last Updated: December 15, 2024',
        intro: 'At Federal Gaz, we use cookies when you visit our website to enhance your experience and provide better service. This policy explains the types of cookies we use and how you can control them.',
        whatAreCookies: 'What Are Cookies?',
        whatAreCookiesDesc: 'Cookies are small text files that websites send to your browser and store on your device. These files help us recognize you and remember your preferences when you return to the site.',
        cookieTypes: 'Types of Cookies We Use',
        necessary: 'Necessary Cookies',
        necessaryIcon: 'lock',
        necessaryDesc: 'These cookies are essential for the basic functions of our website to work. They are used for security, session management, and basic site functionality. These cookies cannot be disabled.',
        analytics: 'Analytics Cookies',
        analyticsIcon: 'analytics',
        analyticsDesc: 'These cookies help us understand how visitors use our site. Through services like Google Analytics, they collect anonymous data about page views, traffic sources, and user behavior.',
        marketing: 'Marketing Cookies',
        marketingIcon: 'campaign',
        marketingDesc: 'These cookies are used to show you ads relevant to your interests. They may be set by third-party advertising networks.',
        functional: 'Functional Cookies',
        functionalIcon: 'settings',
        functionalDesc: 'These cookies enable advanced features and personalization such as language preference and theme selection.',
        yourRights: 'Your Rights',
        yourRightsDesc: 'Under KVKK and related regulations, you can change your cookie preferences at any time. You can control cookies through the cookie banner that appears on your first visit or through your browser settings.',
        howToManage: 'How to Manage Cookies?',
        howToManageDesc: 'You can delete or block cookies from your browser settings. However, some features of our site may not work properly in this case.',
        contact: 'Contact',
        contactDesc: 'For questions about our cookie policy, you can reach us at federal.gaz@hotmail.com'
    }
};

interface CMSContent {
    header?: { title?: string; lastUpdate?: string };
    intro?: { text?: string; whatAreCookies?: string; whatAreCookiesDesc?: string; cookieTypes?: string };
    cookieTypes?: {
        necessaryIcon?: string; necessary?: string; necessaryDesc?: string;
        analyticsIcon?: string; analytics?: string; analyticsDesc?: string;
        marketingIcon?: string; marketing?: string; marketingDesc?: string;
        functionalIcon?: string; functional?: string; functionalDesc?: string;
    };
    additional?: {
        yourRights?: string; yourRightsDesc?: string;
        howToManage?: string; howToManageDesc?: string;
        contact?: string; contactDesc?: string;
    };
}

export default function CookiePolicyPage() {
    const { language } = useLanguage();
    const defaults = defaultTranslations[language];
    const [cms, setCms] = useState<CMSContent>({});

    // Fetch CMS content
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/dashboard/page-content?slug=/cerez-politikasi&language=${language}`);
                if (res.ok) {
                    const data = await res.json();
                    const contentObj: CMSContent = {};
                    data.sections?.forEach((section: { key: string; content: object }) => {
                        contentObj[section.key as keyof CMSContent] = section.content as CMSContent[keyof CMSContent];
                    });
                    setCms(contentObj);
                }
            } catch (err) {
                console.error('Error fetching CMS content:', err);
            }
        };
        fetchContent();
    }, [language]);

    // Merge CMS with defaults
    const t = {
        title: cms.header?.title || defaults.title,
        lastUpdate: cms.header?.lastUpdate || defaults.lastUpdate,
        intro: cms.intro?.text || defaults.intro,
        whatAreCookies: cms.intro?.whatAreCookies || defaults.whatAreCookies,
        whatAreCookiesDesc: cms.intro?.whatAreCookiesDesc || defaults.whatAreCookiesDesc,
        cookieTypes: cms.intro?.cookieTypes || defaults.cookieTypes,
        necessary: cms.cookieTypes?.necessary || defaults.necessary,
        necessaryIcon: cms.cookieTypes?.necessaryIcon || defaults.necessaryIcon,
        necessaryDesc: cms.cookieTypes?.necessaryDesc || defaults.necessaryDesc,
        analytics: cms.cookieTypes?.analytics || defaults.analytics,
        analyticsIcon: cms.cookieTypes?.analyticsIcon || defaults.analyticsIcon,
        analyticsDesc: cms.cookieTypes?.analyticsDesc || defaults.analyticsDesc,
        marketing: cms.cookieTypes?.marketing || defaults.marketing,
        marketingIcon: cms.cookieTypes?.marketingIcon || defaults.marketingIcon,
        marketingDesc: cms.cookieTypes?.marketingDesc || defaults.marketingDesc,
        functional: cms.cookieTypes?.functional || defaults.functional,
        functionalIcon: cms.cookieTypes?.functionalIcon || defaults.functionalIcon,
        functionalDesc: cms.cookieTypes?.functionalDesc || defaults.functionalDesc,
        yourRights: cms.additional?.yourRights || defaults.yourRights,
        yourRightsDesc: cms.additional?.yourRightsDesc || defaults.yourRightsDesc,
        howToManage: cms.additional?.howToManage || defaults.howToManage,
        howToManageDesc: cms.additional?.howToManageDesc || defaults.howToManageDesc,
        contact: cms.additional?.contact || defaults.contact,
        contactDesc: cms.additional?.contactDesc || defaults.contactDesc,
    };

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        {t.title}
                    </h1>
                    <p className="mt-4 text-white/60">{t.lastUpdate}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {t.intro}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">
                            {t.whatAreCookies}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t.whatAreCookiesDesc}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">
                            {t.cookieTypes}
                        </h2>

                        <div className="mt-6 space-y-6">
                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">{t.necessaryIcon}</span>
                                    {t.necessary}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.necessaryDesc}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">{t.analyticsIcon}</span>
                                    {t.analytics}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.analyticsDesc}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">{t.marketingIcon}</span>
                                    {t.marketing}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.marketingDesc}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">{t.functionalIcon}</span>
                                    {t.functional}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.functionalDesc}
                                </p>
                            </div>
                        </div>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">
                            {t.yourRights}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t.yourRightsDesc}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">
                            {t.howToManage}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t.howToManageDesc}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">
                            {t.contact}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t.contactDesc}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
