'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useState, useEffect } from 'react';

interface CMSContent {
    header?: { title?: string; subtitle?: string };
    infoBox?: { text?: string };
    section1?: { title?: string; intro?: string };
    section2?: { title?: string; description?: string; legalTitle?: string; legalReasons?: string };
    section3?: { title?: string; description?: string; purposes?: string };
    section4?: { title?: string; description?: string; recipients?: string };
    section5?: { title?: string; description?: string; rights?: string };
    section6?: { title?: string; description?: string; methods?: string; closing?: string };
    disclaimer?: { text?: string };
}

export default function KVKKPage() {
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
                const res = await fetch(`/api/dashboard/page-content?slug=/kvkk&language=${language}`);
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
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

    // Defaults
    const defaultsTR = {
        header: { title: '6698 Sayılı Kişisel Verilerin Korunması Kanunu Aydınlatma Metni', subtitle: 'KVKK Uyarınca Kişisel Verilerin İşlenmesine İlişkin Bilgilendirme' },
        infoBox: { text: 'Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere, kişilerin temel hak ve özgürlüklerini korumak amacıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") yürürlüğe girmiştir. Bu aydınlatma metni ile sizleri; kişisel verilerinizin işlenmesi, aktarılması, toplanma yöntemleri ve KVKK kapsamındaki haklarınız konusunda bilgilendiriyoruz.' },
        section1: { title: '1. Veri Sorumlusu', intro: '6698 Sayılı Kanun\'da tanımlandığı şekli ile "Veri Sorumlusu" sıfatına sahip olan:' },
        section2: { title: '2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi', description: 'Kişisel verileriniz, KVKK\'da belirtilen esaslar dahilinde, otomatik ya da otomatik olmayan yöntemlerle; web sitemiz, iletişim formları, sipariş formları, üyelik kayıt formu, telefon ve e-posta aracılığıyla sözlü, yazılı ya da elektronik olarak toplanmaktadır.', legalTitle: 'Hukuki Sebepler (KVKK Madde 5 ve 6):', legalReasons: 'Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması\nKanunlarda açıkça öngörülmesi\nHukuki yükümlülüğün yerine getirilmesi\nVeri sorumlusunun meşru menfaati\nBir hakkın tesisi, kullanılması veya korunması\nAçık rızanızın bulunması' },
        section3: { title: '3. İşlenen Kişisel Veriler ve İşlenme Amaçları', description: 'Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:', purposes: 'Taleplerinizin değerlendirilmesi ve sonuçlandırılması\nÜrün ve hizmetlerin en iyi koşullarda sağlanması\nSipariş ve teslimat süreçlerinin yürütülmesi\nMüşteri memnuniyetinin sağlanması\nFatura ve muhasebe işlemlerinin yapılması\nYasal yükümlülüklerin yerine getirilmesi\nİletişim faaliyetlerinin yürütülmesi' },
        section4: { title: '4. Kişisel Verilerin Aktarımı', description: 'Kişisel verileriniz, KVKK\'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde ve yukarıda belirtilen amaçlarla sınırlı olmak kaydıyla aşağıdaki taraflara aktarılabilir:', recipients: 'Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına\nSipariş teslimatı için iş birliği yaptığımız kargo firmalarına\nFatura kesimi için mali müşavir/muhasebe hizmeti sağlayıcılarına\nTeknik altyapı hizmeti sağlayan iş ortaklarımıza\nHukuki zorunluluklar çerçevesinde avukat ve danışmanlara' },
        section5: { title: '5. KVKK Madde 11 Kapsamındaki Haklarınız', description: 'Kişisel Verilerin Korunması Kanunu\'nun 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:', rights: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme\nKişisel verileriniz işlenmişse buna ilişkin bilgi talep etme\nKişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme\nYurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme\nKişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme\nKVKK\'nın 7. maddesindeki şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme\nDüzeltme, silme veya yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme\nİşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme' },
        section6: { title: '6. Başvuru Yöntemi', description: 'Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:', methods: `E-posta: ${email} adresine "Kişisel Verilerin Korunması Kanunu Bilgi Talebi" konulu e-posta göndererek\nPosta: ${address} adresine yazılı dilekçe ile\nŞahsen: Kimlik belgesi ile şirketimize bizzat başvurarak`, closing: 'Başvurularınız, talebin niteliğine göre en kısa sürede sonuçlandırılacaktır.' },
        disclaimer: { text: 'Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu\'nun 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.' },
    };

    const defaultsEN = {
        header: { title: 'KVKK Disclosure Notice', subtitle: 'Personal Data Protection Law No. 6698' },
        infoBox: { text: `${companyName} processes your personal data in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK). This notice explains your rights and how your data is processed.` },
        section1: { title: 'Data Controller', intro: 'As defined by Law No. 6698, the Data Controller is:' },
        section2: { title: 'Data Collection Methods and Legal Basis', description: 'Your personal data is collected through automatic or non-automatic methods via our website, contact forms, order forms, membership registration, phone and email.', legalTitle: 'Legal Bases (KVKK Article 5 and 6):', legalReasons: 'Direct relation to establishing or performing a contract\nExplicit provision in laws\nFulfillment of legal obligations\nLegitimate interests of the data controller\nEstablishment, exercise or protection of a right\nExistence of your explicit consent' },
        section3: { title: 'Processed Data and Processing Purposes', description: 'Your personal data is processed for the following purposes:', purposes: 'Evaluation and conclusion of your requests\nProviding products and services under best conditions\nOrder and delivery processes\nEnsuring customer satisfaction\nInvoicing and accounting operations\nFulfilling legal obligations\nConducting communication activities' },
        section4: { title: 'Data Transfer', description: 'Your personal data may be transferred to the following parties:', recipients: 'Authorized public institutions when legally required\nCargo companies for order delivery\nAccounting service providers for invoicing\nTechnical infrastructure partners\nLawyers and consultants for legal requirements' },
        section5: { title: 'Your Rights Under KVKK (Article 11)', description: 'Under Article 11 of the Personal Data Protection Law, you have the following rights:', rights: 'Learn whether your personal data is processed\nRequest information about processing\nLearn the purpose of processing\nKnow third parties to whom your data is transferred\nRequest correction of incomplete or incorrect data\nRequest deletion or destruction of data\nRequest notification of corrections to third parties\nObject to automated analysis results' },
        section6: { title: 'Application Method', description: 'You can apply using the following methods:', methods: `Email: ${email}\nMail: ${address}\nIn Person: With identification document`, closing: 'Your applications will be processed within 30 days.' },
        disclaimer: { text: 'This disclosure notice has been prepared in accordance with Article 10 of the Personal Data Protection Law No. 6698.' },
    };

    const defaults = language === 'TR' ? defaultsTR : defaultsEN;

    // Merge CMS with defaults
    const t = {
        header: { title: cms.header?.title || defaults.header.title, subtitle: cms.header?.subtitle || defaults.header.subtitle },
        infoBox: { text: cms.infoBox?.text || defaults.infoBox.text },
        section1: { title: cms.section1?.title || defaults.section1.title, intro: cms.section1?.intro || defaults.section1.intro },
        section2: { title: cms.section2?.title || defaults.section2.title, description: cms.section2?.description || defaults.section2.description, legalTitle: cms.section2?.legalTitle || defaults.section2.legalTitle, legalReasons: cms.section2?.legalReasons || defaults.section2.legalReasons },
        section3: { title: cms.section3?.title || defaults.section3.title, description: cms.section3?.description || defaults.section3.description, purposes: cms.section3?.purposes || defaults.section3.purposes },
        section4: { title: cms.section4?.title || defaults.section4.title, description: cms.section4?.description || defaults.section4.description, recipients: cms.section4?.recipients || defaults.section4.recipients },
        section5: { title: cms.section5?.title || defaults.section5.title, description: cms.section5?.description || defaults.section5.description, rights: cms.section5?.rights || defaults.section5.rights },
        section6: { title: cms.section6?.title || defaults.section6.title, description: cms.section6?.description || defaults.section6.description, methods: cms.section6?.methods || defaults.section6.methods, closing: cms.section6?.closing || defaults.section6.closing },
        disclaimer: { text: cms.disclaimer?.text || defaults.disclaimer.text },
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

                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-8 border-l-4 border-blue-500">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {t.infoBox.text}
                        </p>
                    </div>

                    {/* Section 1 - Veri Sorumlusu */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section1.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section1.intro}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong>{companyName}</strong><br />
                        {language === 'TR' ? 'Adres' : 'Address'}: {address}<br />
                        {language === 'TR' ? 'E-posta' : 'Email'}: {email}<br />
                        {language === 'TR' ? 'Telefon' : 'Phone'}: {phone}
                    </p>

                    {/* Section 2 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section2.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section2.description}</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-4"><strong>{t.section2.legalTitle}</strong></p>
                    {renderList(t.section2.legalReasons)}

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
                    {renderList(t.section5.rights)}

                    {/* Section 6 */}
                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">{t.section6.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{t.section6.description}</p>
                    {renderList(t.section6.methods)}
                    <p className="text-gray-600 dark:text-gray-400 mt-4">{t.section6.closing}</p>

                    {/* Contact Box */}
                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>{language === 'TR' ? 'İletişim Bilgileri' : 'Contact Information'}:</strong><br />
                            {companyName}<br />
                            {language === 'TR' ? 'Adres' : 'Address'}: {address}<br />
                            {language === 'TR' ? 'E-posta' : 'Email'}: {email}<br />
                            {language === 'TR' ? 'Telefon' : 'Phone'}: {phone}
                        </p>
                    </div>

                    {/* Disclaimer */}
                    <p className="mt-6 text-gray-500 dark:text-gray-500 text-sm">
                        {t.disclaimer.text}
                    </p>
                </div>
            </section>
        </>
    );
}
