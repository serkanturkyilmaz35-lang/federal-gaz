'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CMSContent {
    header?: { title?: string; subtitle?: string };
    intro?: { text?: string };
    section1?: { title?: string };
    section2?: { title?: string; description?: string; dataTypes?: string };
    section3?: { title?: string; description?: string; purposes?: string };
    section4?: { title?: string; description?: string; recipients?: string };
    section5?: { title?: string; description?: string };
    section6?: { title?: string; description?: string };
    section7?: { title?: string; description?: string };
    section8?: { title?: string; description?: string };
    section9?: { title?: string; description?: string };
    section10?: { title?: string; description?: string };
    acceptance?: { text?: string };
}

export default function PrivacyPolicyPage() {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const [cms, setCms] = useState<CMSContent>({});

    const companyName = settings.site_name || 'Federal Gaz';
    const email = settings.contact_email || 'federal.gaz@hotmail.com';
    const phone = settings.contact_phone || '(0312) 395 35 95';
    const address = settings.contact_address || 'İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara';

    // Fetch CMS content
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/dashboard/page-content?slug=/gizlilik-politikasi&language=${language}`);
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

    // Helper to render list from newline-separated string
    const renderList = (text: string | undefined) => {
        if (!text) return null;
        const items = text.split('\n').filter(item => item.trim());
        return (
            <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                {items.map((item, index) => {
                    const parts = item.split(':');
                    if (parts.length > 1) {
                        return (
                            <li key={index}>
                                <strong>{parts[0]}:</strong> {parts.slice(1).join(':')}
                            </li>
                        );
                    }
                    return <li key={index}>{item}</li>;
                })}
            </ul>
        );
    };

    // Defaults based on language
    const isTR = language === 'TR';
    const defaults = {
        header: { title: isTR ? 'Gizlilik Politikası' : 'Privacy Policy', subtitle: isTR ? 'Son Güncelleme: 15 Aralık 2025' : 'Last Updated: December 15, 2025' },
        intro: { text: isTR ? `${companyName} olarak müşterilerimizin bilgilerinin gizliliğini korumak amacıyla aşağıda belirtilen temel kuralları benimsemiştir. Kişisel verilerinizin güvenliği ve gizliliği bizim için son derece önemlidir.` : `${companyName} ("Company") is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our website and services.` },
        section1: { title: isTR ? '1. Veri Sorumlusu' : '1. Data Controller' },
        section2: { title: isTR ? '2. Toplanan Veriler' : '2. Data We Collect', description: isTR ? 'Web sitemiz ve hizmetlerimiz aracılığıyla aşağıdaki kişisel veriler toplanabilir:' : 'The following personal data may be collected through our website and services:', dataTypes: isTR ? 'Kimlik Bilgileri: Ad, soyad\nİletişim Bilgileri: E-posta adresi, telefon numarası, adres\nSipariş Bilgileri: Ürün tercihleri, sipariş geçmişi, teslimat adresi\nÜyelik Bilgileri: Kullanıcı adı, şifre (şifrelenmiş olarak)' : 'Identity Information: Name, surname\nContact Information: Email, phone number, address\nOrder Information: Product preferences, order history\nMembership Information: Username, encrypted password' },
        section3: { title: isTR ? '3. Verilerin İşlenme Amaçları' : '3. Purpose of Processing', description: isTR ? 'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:' : 'Your personal data is processed for the following purposes:', purposes: isTR ? 'Sipariş ve talep süreçlerinin yürütülmesi\nÜrün ve hizmet tesliminin sağlanması\nİletişim taleplerinizin cevaplanması\nMüşteri hizmetleri desteği sağlanması\nHizmet kalitesinin iyileştirilmesi\nYasal yükümlülüklerin yerine getirilmesi\nFatura ve muhasebe işlemlerinin yapılması' : 'Processing and delivering your orders\nResponding to your inquiries\nProviding customer support\nImproving our services\nFulfilling legal obligations' },
        section4: { title: isTR ? '4. Verilerin Paylaşımı' : '4. Data Sharing', description: isTR ? `${companyName}, müşterinin izni haricinde veya yasal bir zorunluluk olmadığı sürece müşterilerine ait bilgiyi herhangi bir üçüncü şahıs, kurum ve kuruluş ile paylaşmayacağını, bu bilgileri en yüksek güvenlik ve gizlilik standartlarında koruyacağını taahhüt eder. Veriler yalnızca aşağıdaki durumlarda paylaşılabilir:` : 'Your personal data will not be shared with third parties except for:', recipients: isTR ? 'Yasal zorunluluk halinde yetkili kamu kurumlarıyla\nSipariş teslimatı için kargo/lojistik firmalarıyla\nTeknik altyapı hizmeti sağlayıcılarıyla (hosting, e-posta vb.)' : 'Legally required situations with authorized institutions\nCargo/logistics companies for order delivery\nTechnical service providers (hosting, email, etc.)' },
        section5: { title: isTR ? '5. Veri Güvenliği' : '5. Data Security', description: isTR ? 'Kişisel verilerinizin güvenliği için SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolü gibi teknik ve idari tedbirler uygulanmaktadır.' : 'Technical and administrative measures such as SSL encryption, secure server infrastructure and access control are applied for the security of your personal data.' },
        section6: { title: isTR ? '6. Sorumluluk Reddi' : '6. Disclaimer', description: isTR ? `${companyName} web sitesinde bulunan tüm bilgi, içerik ve görüşler sadece bilgi vermek amaçlı olup hiçbir şekilde alış veya satış teklifi olarak değerlendirilemez. ${companyName}, web sitesinde bulunan bilgi, içerik ve görüşlerin doğruluğu, tamlığı ve eksiksizliğini garanti etmemekle birlikte bu bilgilerdeki eksiklikler ve yanlışlıklardan dolayı hiçbir şekilde sorumlu bulunmamaktadır.` : `The information on this website is for informational purposes only. ${companyName} does not guarantee the accuracy, completeness, or timeliness of the information provided.` },
        section7: { title: isTR ? '7. Dış Bağlantılar' : '7. External Links', description: isTR ? `Gizlilik politikalarımızda yer alan taahhütlerimiz sadece web sitemiz için geçerlidir. ${companyName} web sitesinden link verilen web sitelerini veya ziyaret edilen diğer web sitelerini kapsamamakta olup bu sitelerden uğranabilecek maddi/manevi zarar ve kayıplardan firmamız sorumlu tutulamaz.` : 'This policy applies only to our website. We are not responsible for the privacy practices of external websites linked from our site.' },
        section8: { title: isTR ? '8. Değişiklik Hakkı' : '8. Changes', description: isTR ? `${companyName}, web sitesinde yer alan tüm bilgileri, ürün ve hizmetleri ile işbu gizlilik politikasını önceden bildirimde bulunmadan değiştirme hakkına sahiptir.` : `${companyName} reserves the right to modify this privacy policy at any time without prior notice.` },
        section9: { title: isTR ? '9. Haklarınız' : '9. Your Rights', description: isTR ? '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınız için KVKK Aydınlatma Metnimizi inceleyebilirsiniz.' : 'For your rights under the Personal Data Protection Law, please review our KVKK Disclosure Notice.' },
        section10: { title: isTR ? '10. İletişim' : '10. Contact', description: isTR ? 'Gizlilik politikamız hakkında sorularınız için:' : 'For questions about this policy:' },
        acceptance: { text: isTR ? `Müşterilerimiz, ${companyName} web sitesine girerek ve web sitesinde yer alan bilgileri kullanarak, yukarıda belirtilen koşulları kabul ettiğini taahhüt etmiş olur.` : 'By accessing and using this website, you agree to the terms of this Privacy Policy.' },
    };

    // Merge CMS with defaults
    const t = {
        header: { title: cms.header?.title || defaults.header.title, subtitle: cms.header?.subtitle || defaults.header.subtitle },
        intro: { text: cms.intro?.text || defaults.intro.text },
        section1: { title: cms.section1?.title || defaults.section1.title },
        section2: { title: cms.section2?.title || defaults.section2.title, description: cms.section2?.description || defaults.section2.description, dataTypes: cms.section2?.dataTypes || defaults.section2.dataTypes },
        section3: { title: cms.section3?.title || defaults.section3.title, description: cms.section3?.description || defaults.section3.description, purposes: cms.section3?.purposes || defaults.section3.purposes },
        section4: { title: cms.section4?.title || defaults.section4.title, description: cms.section4?.description || defaults.section4.description, recipients: cms.section4?.recipients || defaults.section4.recipients },
        section5: { title: cms.section5?.title || defaults.section5.title, description: cms.section5?.description || defaults.section5.description },
        section6: { title: cms.section6?.title || defaults.section6.title, description: cms.section6?.description || defaults.section6.description },
        section7: { title: cms.section7?.title || defaults.section7.title, description: cms.section7?.description || defaults.section7.description },
        section8: { title: cms.section8?.title || defaults.section8.title, description: cms.section8?.description || defaults.section8.description },
        section9: { title: cms.section9?.title || defaults.section9.title, description: cms.section9?.description || defaults.section9.description },
        section10: { title: cms.section10?.title || defaults.section10.title, description: cms.section10?.description || defaults.section10.description },
        acceptance: { text: cms.acceptance?.text || defaults.acceptance.text },
    };

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        {t.header.title}
                    </h1>
                    <p className="mt-4 text-white/60">{t.header.subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-600 dark:text-gray-400">{t.intro.text}</p>

                    {/* Section 1 - Veri Sorumlusu */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section1.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong>{companyName}</strong><br />
                        {isTR ? 'Adres' : 'Address'}: {address}<br />
                        {isTR ? 'E-posta' : 'Email'}: {email}<br />
                        {isTR ? 'Telefon' : 'Phone'}: {phone}
                    </p>

                    {/* Section 2 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section2.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section2.description}</p>
                    {renderList(t.section2.dataTypes)}

                    {/* Section 3 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section3.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section3.description}</p>
                    {renderList(t.section3.purposes)}

                    {/* Section 4 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section4.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section4.description}</p>
                    {renderList(t.section4.recipients)}

                    {/* Section 5 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section5.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section5.description}</p>

                    {/* Section 6 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section6.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section6.description}</p>

                    {/* Section 7 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section7.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section7.description}</p>

                    {/* Section 8 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section8.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section8.description}</p>

                    {/* Section 9 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section9.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t.section9.description}{' '}
                        <Link href="/kvkk" className="text-primary hover:underline">
                            {isTR ? 'KVKK Aydınlatma Metni' : 'KVKK Disclosure Notice'}
                        </Link>
                    </p>

                    {/* Section 10 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section10.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {t.section10.description}<br />
                        {isTR ? 'E-posta' : 'Email'}: {email}<br />
                        {isTR ? 'Telefon' : 'Phone'}: {phone}
                    </p>

                    {/* Acceptance Box */}
                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{isTR ? 'Kabul Beyanı:' : 'Acceptance Statement:'}</strong> {t.acceptance.text}
                        </p>
                    </div>

                    <p className="mt-6 text-gray-500 dark:text-gray-500 text-sm text-right">
                        {isTR ? 'Saygılarımızla,' : 'Regards,'}<br />
                        <strong>{companyName}</strong>
                    </p>
                </div>
            </section>
        </>
    );
}
