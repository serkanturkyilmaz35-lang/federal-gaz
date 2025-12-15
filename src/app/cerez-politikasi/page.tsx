'use client';

import { useLanguage } from '@/context/LanguageContext';

const translations = {
    TR: {
        title: 'Çerez Politikası',
        lastUpdate: 'Son Güncelleme: 15 Aralık 2025',
        intro: 'Federal Gaz olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek ve size daha iyi hizmet sunmak amacıyla çerezler kullanmaktayız. Bu politika, kullandığımız çerez türlerini ve bunları nasıl kontrol edebileceğinizi açıklamaktadır.',
        whatAreCookies: 'Çerez Nedir?',
        whatAreCookiesDesc: 'Çerezler, web sitelerinin tarayıcınıza gönderdiği ve cihazınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, siteye tekrar girdiğinizde sizi tanımamıza ve tercihlerinizi hatırlamamıza yardımcı olur.',
        cookieTypes: 'Kullandığımız Çerez Türleri',
        necessary: 'Zorunlu Çerezler',
        necessaryDesc: 'Bu çerezler, web sitemizin temel işlevlerinin çalışması için gereklidir. Güvenlik, oturum yönetimi ve temel site işlevselliği için kullanılırlar. Bu çerezler kapatılamaz.',
        analytics: 'Analitik Çerezler',
        analyticsDesc: 'Bu çerezler, ziyaretçilerin sitemizi nasıl kullandığını anlamamıza yardımcı olur. Google Analytics gibi hizmetler aracılığıyla sayfa görüntülemeleri, trafik kaynakları ve kullanıcı davranışları hakkında anonim veriler toplarlar.',
        marketing: 'Pazarlama Çerezleri',
        marketingDesc: 'Bu çerezler, size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır. Üçüncü taraf reklam ağları tarafından ayarlanabilirler.',
        functional: 'Fonksiyonel Çerezler',
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
        necessaryDesc: 'These cookies are essential for the basic functions of our website to work. They are used for security, session management, and basic site functionality. These cookies cannot be disabled.',
        analytics: 'Analytics Cookies',
        analyticsDesc: 'These cookies help us understand how visitors use our site. Through services like Google Analytics, they collect anonymous data about page views, traffic sources, and user behavior.',
        marketing: 'Marketing Cookies',
        marketingDesc: 'These cookies are used to show you ads relevant to your interests. They may be set by third-party advertising networks.',
        functional: 'Functional Cookies',
        functionalDesc: 'These cookies enable advanced features and personalization such as language preference and theme selection.',
        yourRights: 'Your Rights',
        yourRightsDesc: 'Under KVKK and related regulations, you can change your cookie preferences at any time. You can control cookies through the cookie banner that appears on your first visit or through your browser settings.',
        howToManage: 'How to Manage Cookies?',
        howToManageDesc: 'You can delete or block cookies from your browser settings. However, some features of our site may not work properly in this case.',
        contact: 'Contact',
        contactDesc: 'For questions about our cookie policy, you can reach us at federal.gaz@hotmail.com'
    }
};

export default function CookiePolicyPage() {
    const { language } = useLanguage();
    const t = translations[language];

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
                                    <span className="material-symbols-outlined text-primary">lock</span>
                                    {t.necessary}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.necessaryDesc}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">analytics</span>
                                    {t.analytics}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.analyticsDesc}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">campaign</span>
                                    {t.marketing}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {t.marketingDesc}
                                </p>
                            </div>

                            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-secondary dark:text-white">
                                    <span className="material-symbols-outlined text-primary">settings</span>
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
