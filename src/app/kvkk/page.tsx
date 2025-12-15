'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';

export default function KVKKPage() {
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
                            KVKK Disclosure Notice
                        </h1>
                        <p className="mt-4 text-white/60">Personal Data Protection Law No. 6698</p>
                    </div>
                </section>

                <section className="bg-background-light py-16 dark:bg-background-dark">
                    <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {companyName} processes your personal data in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK). This notice explains your rights and how your data is processed.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Data Controller</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            <strong>{companyName}</strong><br />
                            Address: {address}<br />
                            Email: {email}<br />
                            Phone: {phone}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Your Rights Under KVKK (Article 11)</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            You have the right to: learn whether your data is processed, request information about processing, learn the purpose of processing, know third parties to whom data is transferred, request correction or deletion of data, object to automated processing results, and claim compensation for damages.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Contact</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            For KVKK-related requests: {email}<br />
                            Your requests will be processed within 30 days.
                        </p>
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
                        6698 Sayılı Kişisel Verilerin Korunması Kanunu Aydınlatma Metni
                    </h1>
                    <p className="mt-4 text-white/60">KVKK Uyarınca Kişisel Verilerin İşlenmesine İlişkin Bilgilendirme</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">

                    {/* Ön Bilgilendirme */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-8 border-l-4 border-blue-500">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                            Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere, kişilerin temel hak ve özgürlüklerini korumak amacıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) yürürlüğe girmiştir. Bu aydınlatma metni ile sizleri; kişisel verilerinizin işlenmesi, aktarılması, toplanma yöntemleri ve KVKK kapsamındaki haklarınız konusunda bilgilendiriyoruz.
                        </p>
                    </div>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">1. Veri Sorumlusu</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        6698 Sayılı Kanun&apos;da tanımlandığı şekli ile &quot;Veri Sorumlusu&quot; sıfatına sahip olan:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong>{companyName}</strong><br />
                        Adres: {address}<br />
                        E-posta: {email}<br />
                        Telefon: {phone}
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verileriniz, KVKK&apos;da belirtilen esaslar dahilinde, otomatik ya da otomatik olmayan yöntemlerle; web sitemiz, iletişim formları, sipariş formları, üyelik kayıt formu, telefon ve e-posta aracılığıyla sözlü, yazılı ya da elektronik olarak toplanmaktadır.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        <strong>Hukuki Sebepler (KVKK Madde 5 ve 6):</strong>
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
                        <li>Kanunlarda açıkça öngörülmesi</li>
                        <li>Hukuki yükümlülüğün yerine getirilmesi</li>
                        <li>Veri sorumlusunun meşru menfaati</li>
                        <li>Bir hakkın tesisi, kullanılması veya korunması</li>
                        <li>Açık rızanızın bulunması</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">3. İşlenen Kişisel Veriler ve İşlenme Amaçları</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Taleplerinizin değerlendirilmesi ve sonuçlandırılması</li>
                        <li>Ürün ve hizmetlerin en iyi koşullarda sağlanması</li>
                        <li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
                        <li>Müşteri memnuniyetinin sağlanması</li>
                        <li>Fatura ve muhasebe işlemlerinin yapılması</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                        <li>İletişim faaliyetlerinin yürütülmesi</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">4. Kişisel Verilerin Aktarımı</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verileriniz, KVKK&apos;nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde ve yukarıda belirtilen amaçlarla sınırlı olmak kaydıyla aşağıdaki taraflara aktarılabilir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
                        <li>Sipariş teslimatı için iş birliği yaptığımız kargo firmalarına</li>
                        <li>Fatura kesimi için mali müşavir/muhasebe hizmeti sağlayıcılarına</li>
                        <li>Teknik altyapı hizmeti sağlayan iş ortaklarımıza</li>
                        <li>Hukuki zorunluluklar çerçevesinde avukat ve danışmanlara</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">5. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel Verilerin Korunması Kanunu&apos;nun 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                        <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                        <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                        <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
                        <li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
                        <li>KVKK&apos;nın 7. maddesindeki şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
                        <li>Düzeltme, silme veya yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                        <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">6. Başvuru Yöntemi</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li><strong>E-posta:</strong> {email} adresine &quot;Kişisel Verilerin Korunması Kanunu Bilgi Talebi&quot; konulu e-posta göndererek</li>
                        <li><strong>Posta:</strong> {address} adresine yazılı dilekçe ile</li>
                        <li><strong>Şahsen:</strong> Kimlik belgesi ile şirketimize bizzat başvurarak</li>
                    </ul>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Başvurularınız, talebin niteliğine göre en kısa sürede ve <strong>en geç 30 (otuz) gün</strong> içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">7. Değişiklikler</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Zaman içerisinde Kanun&apos;da olabilecek değişikliklere bağlı olarak, bu aydınlatma metninde de gerekli güncellemeler yapılacaktır. Güncel metin her zaman web sitemizde yayınlanacaktır.
                    </p>

                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>İletişim Bilgileri:</strong><br />
                            {companyName}<br />
                            Adres: {address}<br />
                            E-posta: {email}<br />
                            Telefon: {phone}
                        </p>
                    </div>

                    <p className="mt-6 text-gray-500 dark:text-gray-500 text-sm">
                        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.
                    </p>
                </div>
            </section>
        </>
    );
}
