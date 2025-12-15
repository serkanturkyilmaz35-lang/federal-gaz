'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

export default function PrivacyPolicyPage() {
    const { language } = useLanguage();
    const { settings } = useSettings();

    const companyName = settings.site_name || 'Federal Gaz';
    const email = settings.contact_email || 'federal.gaz@hotmail.com';
    const phone = settings.contact_phone || '(0312) 395 35 95';
    const address = settings.contact_address || 'İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara';

    if (language === 'EN') {
        return (
            <>
                <section className="bg-secondary py-16 text-white">
                    <div className="mx-auto max-w-4xl px-4">
                        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                            Privacy Policy
                        </h1>
                        <p className="mt-4 text-white/60">Last Updated: December 15, 2025</p>
                    </div>
                </section>

                <section className="bg-background-light py-16 dark:bg-background-dark">
                    <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {companyName} (&quot;Company&quot;) is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our website and services.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">1. Data Controller</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            <strong>{companyName}</strong><br />
                            Address: {address}<br />
                            Email: {email}<br />
                            Phone: {phone}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">2. Data We Collect</h2>
                        <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                            <li><strong>Identity Information:</strong> Name, surname</li>
                            <li><strong>Contact Information:</strong> Email, phone number, address</li>
                            <li><strong>Order Information:</strong> Product preferences, order history</li>
                            <li><strong>Membership Information:</strong> Username, encrypted password</li>
                        </ul>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">3. Purpose of Processing</h2>
                        <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                            <li>Processing and delivering your orders</li>
                            <li>Responding to your inquiries</li>
                            <li>Providing customer support</li>
                            <li>Improving our services</li>
                            <li>Fulfilling legal obligations</li>
                        </ul>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">4. Data Sharing</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your personal data will not be shared with third parties except for legally required situations, cargo/logistics companies for order delivery, and technical service providers.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">5. Disclaimer</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            The information on this website is for informational purposes only. {companyName} does not guarantee the accuracy, completeness, or timeliness of the information provided.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">6. External Links</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            This policy applies only to our website. We are not responsible for the privacy practices of external websites linked from our site.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">7. Changes</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {companyName} reserves the right to modify this privacy policy at any time without prior notice.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">8. Contact</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            For questions about this policy: {email}
                        </p>

                        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                By accessing and using this website, you agree to the terms of this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-4xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        Gizlilik Politikası
                    </h1>
                    <p className="mt-4 text-white/60">Son Güncelleme: 15 Aralık 2025</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {companyName} olarak müşterilerimizin bilgilerinin gizliliğini korumak amacıyla aşağıda belirtilen temel kuralları benimsemiştir. Kişisel verilerinizin güvenliği ve gizliliği bizim için son derece önemlidir.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">1. Veri Sorumlusu</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong>{companyName}</strong><br />
                        Adres: {address}<br />
                        E-posta: {email}<br />
                        Telefon: {phone}
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">2. Toplanan Veriler</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Web sitemiz ve hizmetlerimiz aracılığıyla aşağıdaki kişisel veriler toplanabilir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
                        <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
                        <li><strong>Sipariş Bilgileri:</strong> Ürün tercihleri, sipariş geçmişi, teslimat adresi</li>
                        <li><strong>Üyelik Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş olarak)</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">3. Verilerin İşlenme Amaçları</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Sipariş ve talep süreçlerinin yürütülmesi</li>
                        <li>Ürün ve hizmet tesliminin sağlanması</li>
                        <li>İletişim taleplerinizin cevaplanması</li>
                        <li>Müşteri hizmetleri desteği sağlanması</li>
                        <li>Hizmet kalitesinin iyileştirilmesi</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                        <li>Fatura ve muhasebe işlemlerinin yapılması</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">4. Verilerin Paylaşımı</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {companyName}, müşterinin izni haricinde veya yasal bir zorunluluk olmadığı sürece müşterilerine ait bilgiyi herhangi bir üçüncü şahıs, kurum ve kuruluş ile paylaşmayacağını, bu bilgileri en yüksek güvenlik ve gizlilik standartlarında koruyacağını taahhüt eder. Veriler yalnızca aşağıdaki durumlarda paylaşılabilir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Yasal zorunluluk halinde yetkili kamu kurumlarıyla</li>
                        <li>Sipariş teslimatı için kargo/lojistik firmalarıyla</li>
                        <li>Teknik altyapı hizmeti sağlayıcılarıyla (hosting, e-posta vb.)</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">5. Veri Güvenliği</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verilerinizin güvenliği için SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolü gibi teknik ve idari tedbirler uygulanmaktadır.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">6. Sorumluluk Reddi</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {companyName} web sitesinde bulunan tüm bilgi, içerik ve görüşler sadece bilgi vermek amaçlı olup hiçbir şekilde alış veya satış teklifi olarak değerlendirilemez. {companyName}, web sitesinde bulunan bilgi, içerik ve görüşlerin doğruluğu, tamlığı ve eksiksizliğini garanti etmemekle birlikte bu bilgilerdeki eksiklikler ve yanlışlıklardan dolayı hiçbir şekilde sorumlu bulunmamaktadır.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">7. Dış Bağlantılar</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gizlilik politikalarımızda yer alan taahhütlerimiz sadece web sitemiz için geçerlidir. {companyName} web sitesinden link verilen web sitelerini veya ziyaret edilen diğer web sitelerini kapsamamakta olup bu sitelerden uğranabilecek maddi/manevi zarar ve kayıplardan firmamız sorumlu tutulamaz.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">8. Değişiklik Hakkı</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {companyName}, web sitesinde yer alan tüm bilgileri, ürün ve hizmetleri ile işbu gizlilik politikasını önceden bildirimde bulunmadan değiştirme hakkına sahiptir.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">9. Haklarınız</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınız için <a href="/kvkk" className="text-primary hover:underline">KVKK Aydınlatma Metnimizi</a> inceleyebilirsiniz.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">10. İletişim</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gizlilik politikamız hakkında sorularınız için:<br />
                        E-posta: {email}<br />
                        Telefon: {phone}
                    </p>

                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Kabul Beyanı:</strong> Müşterilerimiz, {companyName} web sitesine girerek ve web sitesinde yer alan bilgileri kullanarak, yukarıda belirtilen koşulları kabul ettiğini taahhüt etmiş olur.
                        </p>
                    </div>

                    <p className="mt-6 text-gray-500 dark:text-gray-500 text-sm text-right">
                        Saygılarımızla,<br />
                        <strong>{companyName}</strong>
                    </p>
                </div>
            </section>
        </>
    );
}
