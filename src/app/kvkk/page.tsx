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
                            Email: {email}
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Your Rights Under KVKK</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Under Article 11 of KVKK, you have the right to: learn whether your data is processed, request information about processing, request correction or deletion of data, object to processing results, and claim compensation for damages.
                        </p>

                        <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">Contact</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            For KVKK-related requests: {email}
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
                        KVKK Aydınlatma Metni
                    </h1>
                    <p className="mt-4 text-white/60">6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark">
                <div className="mx-auto max-w-4xl px-4 prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {companyName} olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri sorumlusu sıfatıyla kişisel verilerinizi işlemekteyiz. Bu aydınlatma metni, haklarınızı ve verilerinizin nasıl işlendiğini açıklamaktadır.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">1. Veri Sorumlusu</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        <strong>{companyName}</strong><br />
                        Adres: {address}<br />
                        E-posta: {email}<br />
                        Telefon: {phone}
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">2. İşlenen Kişisel Veriler</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Aşağıdaki kategorilerdeki kişisel verileriniz işlenebilmektedir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (fatura işlemleri için)</li>
                        <li><strong>İletişim Bilgileri:</strong> Telefon, e-posta, adres</li>
                        <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş detayları, talep bilgileri</li>
                        <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, log kayıtları</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">3. Kişisel Verilerin İşlenme Amaçları</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Mal/hizmet satış süreçlerinin yürütülmesi</li>
                        <li>Sipariş ve teslim süreçlerinin takibi</li>
                        <li>Müşteri ilişkileri yönetimi faaliyetlerinin yürütülmesi</li>
                        <li>İletişim faaliyetlerinin yürütülmesi</li>
                        <li>Finans ve muhasebe işlemlerinin yürütülmesi</li>
                        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                        <li>Yetkili kurum ve kuruluşlara bilgi verilmesi</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">4. Kişisel Verilerin Aktarımı</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verileriniz, KVKK&apos;nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde aşağıdaki taraflara aktarılabilir:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
                        <li>Sipariş teslimatı için iş birliği yaptığımız kargo firmalarına</li>
                        <li>Fatura kesimi için mali müşavir/muhasebe hizmeti sağlayıcılarına</li>
                        <li>Teknik altyapı hizmeti sağlayan iş ortaklarımıza</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Kişisel verileriniz; web sitemiz, iletişim formları, sipariş formları, üyelik kayıt formu, telefon ve e-posta aracılığıyla toplanmaktadır.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        <strong>Hukuki sebepler:</strong>
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
                        <li>Kanunlarda açıkça öngörülmesi</li>
                        <li>Veri sorumlusunun meşru menfaati</li>
                        <li>Açık rızanızın bulunması</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">6. KVKK Kapsamındaki Haklarınız</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        KVKK&apos;nın 11. maddesi gereğince aşağıdaki haklara sahipsiniz:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                        <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                        <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                        <li>KVKK&apos;nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                        <li>Düzeltme, silme veya yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                        <li>Münhasıran otomatik sistemler vasıtasıyla analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                        <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                    </ul>

                    <h2 className="mt-8 text-2xl font-bold text-secondary dark:text-white">7. Başvuru Yöntemi</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
                    </p>
                    <ul className="text-gray-600 dark:text-gray-400 list-disc pl-6 space-y-2">
                        <li><strong>E-posta:</strong> {email} adresine kimlik teyidi ile başvuru</li>
                        <li><strong>Posta:</strong> {address} adresine ıslak imzalı dilekçe ile başvuru</li>
                    </ul>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
                    </p>

                    <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>İletişim:</strong><br />
                            {companyName}<br />
                            E-posta: {email}<br />
                            Telefon: {phone}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
