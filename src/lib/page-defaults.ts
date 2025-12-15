// Default page content for all editable pages
// These are used when no database override exists

export interface PageDefault {
    slug: string;
    title: string;
    titleEn: string;
    subtitle?: string;
    subtitleEn?: string;
    content: string;
    contentEn: string;
    type: 'legal' | 'static' | 'dynamic';
    editable: boolean;
}

// Placeholders that will be replaced with actual settings:
// {{companyName}}, {{email}}, {{phone}}, {{address}}

export const pageDefaults: Record<string, PageDefault> = {
    'gizlilik-politikasi': {
        slug: 'gizlilik-politikasi',
        title: 'Gizlilik Politikası',
        titleEn: 'Privacy Policy',
        subtitle: 'Son Güncelleme: 15 Aralık 2025',
        subtitleEn: 'Last Updated: December 15, 2025',
        type: 'legal',
        editable: true,
        content: `<p>{{companyName}} olarak müşterilerimizin bilgilerinin gizliliğini korumak amacıyla aşağıda belirtilen temel kuralları benimsemiştir. Kişisel verilerinizin güvenliği ve gizliliği bizim için son derece önemlidir.</p>

<h2>1. Veri Sorumlusu</h2>
<p><strong>{{companyName}}</strong><br/>
Adres: {{address}}<br/>
E-posta: {{email}}<br/>
Telefon: {{phone}}</p>

<h2>2. Toplanan Veriler</h2>
<p>Web sitemiz ve hizmetlerimiz aracılığıyla aşağıdaki kişisel veriler toplanabilir:</p>
<ul>
<li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
<li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres</li>
<li><strong>Sipariş Bilgileri:</strong> Ürün tercihleri, sipariş geçmişi, teslimat adresi</li>
<li><strong>Üyelik Bilgileri:</strong> Kullanıcı adı, şifre (şifrelenmiş olarak)</li>
</ul>

<h2>3. Verilerin İşlenme Amaçları</h2>
<p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
<ul>
<li>Sipariş ve talep süreçlerinin yürütülmesi</li>
<li>Ürün ve hizmet tesliminin sağlanması</li>
<li>İletişim taleplerinizin cevaplanması</li>
<li>Müşteri hizmetleri desteği sağlanması</li>
<li>Hizmet kalitesinin iyileştirilmesi</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>Fatura ve muhasebe işlemlerinin yapılması</li>
</ul>

<h2>4. Verilerin Paylaşımı</h2>
<p>{{companyName}}, müşterinin izni haricinde veya yasal bir zorunluluk olmadığı sürece müşterilerine ait bilgiyi herhangi bir üçüncü şahıs, kurum ve kuruluş ile paylaşmayacağını, bu bilgileri en yüksek güvenlik ve gizlilik standartlarında koruyacağını taahhüt eder.</p>

<h2>5. Veri Güvenliği</h2>
<p>Kişisel verilerinizin güvenliği için SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolü gibi teknik ve idari tedbirler uygulanmaktadır.</p>

<h2>6. Sorumluluk Reddi</h2>
<p>{{companyName}} web sitesinde bulunan tüm bilgi, içerik ve görüşler sadece bilgi vermek amaçlı olup hiçbir şekilde alış veya satış teklifi olarak değerlendirilemez.</p>

<h2>7. Dış Bağlantılar</h2>
<p>Gizlilik politikalarımızda yer alan taahhütlerimiz sadece web sitemiz için geçerlidir.</p>

<h2>8. Değişiklik Hakkı</h2>
<p>{{companyName}}, web sitesinde yer alan tüm bilgileri önceden bildirimde bulunmadan değiştirme hakkına sahiptir.</p>

<h2>9. İletişim</h2>
<p>Gizlilik politikamız hakkında sorularınız için: {{email}}</p>

<div class="acceptance-box">
<p>Bu web sitesine erişerek ve siteyi kullanarak, bu Gizlilik Politikası şartlarını kabul etmiş sayılırsınız.</p>
</div>`,
        contentEn: `<p>{{companyName}} ("Company") is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you use our website and services.</p>

<h2>1. Data Controller</h2>
<p><strong>{{companyName}}</strong><br/>
Address: {{address}}<br/>
Email: {{email}}<br/>
Phone: {{phone}}</p>

<h2>2. Data We Collect</h2>
<ul>
<li><strong>Identity Information:</strong> Name, surname</li>
<li><strong>Contact Information:</strong> Email, phone number, address</li>
<li><strong>Order Information:</strong> Product preferences, order history</li>
<li><strong>Membership Information:</strong> Username, encrypted password</li>
</ul>

<h2>3. Purpose of Processing</h2>
<ul>
<li>Processing and delivering your orders</li>
<li>Responding to your inquiries</li>
<li>Providing customer support</li>
<li>Improving our services</li>
<li>Fulfilling legal obligations</li>
</ul>

<h2>4. Data Sharing</h2>
<p>Your personal data will not be shared with third parties except for legally required situations, cargo/logistics companies for order delivery, and technical service providers.</p>

<h2>5. Disclaimer</h2>
<p>The information on this website is for informational purposes only. {{companyName}} does not guarantee the accuracy, completeness, or timeliness of the information provided.</p>

<h2>6. External Links</h2>
<p>This policy applies only to our website. We are not responsible for the privacy practices of external websites linked from our site.</p>

<h2>7. Changes</h2>
<p>{{companyName}} reserves the right to modify this privacy policy at any time without prior notice.</p>

<h2>8. Contact</h2>
<p>For questions about this policy: {{email}}</p>

<div class="acceptance-box">
<p>By accessing and using this website, you agree to the terms of this Privacy Policy.</p>
</div>`,
    },

    'kvkk': {
        slug: 'kvkk',
        title: '6698 Sayılı Kişisel Verilerin Korunması Kanunu Aydınlatma Metni',
        titleEn: 'KVKK Disclosure Notice',
        subtitle: 'KVKK Uyarınca Kişisel Verilerin İşlenmesine İlişkin Bilgilendirme',
        subtitleEn: 'Personal Data Protection Law No. 6698',
        type: 'legal',
        editable: true,
        content: `<div class="info-box">
<p>Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere, kişilerin temel hak ve özgürlüklerini korumak amacıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") yürürlüğe girmiştir. Bu aydınlatma metni ile sizleri; kişisel verilerinizin işlenmesi, aktarılması, toplanma yöntemleri ve KVKK kapsamındaki haklarınız konusunda bilgilendiriyoruz.</p>
</div>

<h2>1. Veri Sorumlusu</h2>
<p>6698 Sayılı Kanun'da tanımlandığı şekli ile "Veri Sorumlusu" sıfatına sahip olan:</p>
<p><strong>{{companyName}}</strong><br/>
Adres: {{address}}<br/>
E-posta: {{email}}<br/>
Telefon: {{phone}}</p>

<h2>2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
<p>Kişisel verileriniz, KVKK'da belirtilen esaslar dahilinde, otomatik ya da otomatik olmayan yöntemlerle; web sitemiz, iletişim formları, sipariş formları, üyelik kayıt formu, telefon ve e-posta aracılığıyla sözlü, yazılı ya da elektronik olarak toplanmaktadır.</p>
<p><strong>Hukuki Sebepler (KVKK Madde 5 ve 6):</strong></p>
<ul>
<li>Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
<li>Kanunlarda açıkça öngörülmesi</li>
<li>Hukuki yükümlülüğün yerine getirilmesi</li>
<li>Veri sorumlusunun meşru menfaati</li>
<li>Bir hakkın tesisi, kullanılması veya korunması</li>
<li>Açık rızanızın bulunması</li>
</ul>

<h2>3. İşlenen Kişisel Veriler ve İşlenme Amaçları</h2>
<p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
<ul>
<li>Taleplerinizin değerlendirilmesi ve sonuçlandırılması</li>
<li>Ürün ve hizmetlerin en iyi koşullarda sağlanması</li>
<li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
<li>Müşteri memnuniyetinin sağlanması</li>
<li>Fatura ve muhasebe işlemlerinin yapılması</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
<li>İletişim faaliyetlerinin yürütülmesi</li>
</ul>

<h2>4. Kişisel Verilerin Aktarımı</h2>
<p>Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde ve yukarıda belirtilen amaçlarla sınırlı olmak kaydıyla aşağıdaki taraflara aktarılabilir:</p>
<ul>
<li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
<li>Sipariş teslimatı için iş birliği yaptığımız kargo firmalarına</li>
<li>Fatura kesimi için mali müşavir/muhasebe hizmeti sağlayıcılarına</li>
<li>Teknik altyapı hizmeti sağlayan iş ortaklarımıza</li>
<li>Hukuki zorunluluklar çerçevesinde avukat ve danışmanlara</li>
</ul>

<h2>5. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
<p>Kişisel Verilerin Korunması Kanunu'nun 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
<ul>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
<li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
<li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
<li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
<li>KVKK'nın 7. maddesindeki şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
<li>Düzeltme, silme veya yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
<li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
</ul>

<h2>6. Başvuru Yöntemi</h2>
<p>Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:</p>
<ul>
<li><strong>E-posta:</strong> {{email}} adresine "Kişisel Verilerin Korunması Kanunu Bilgi Talebi" konulu e-posta göndererek</li>
<li><strong>Posta:</strong> {{address}} adresine yazılı dilekçe ile</li>
<li><strong>Şahsen:</strong> Kimlik belgesi ile şirketimize bizzat başvurarak</li>
</ul>
<p>Başvurularınız, talebin niteliğine göre en kısa sürede sonuçlandırılacaktır.</p>

<div class="contact-box">
<p><strong>İletişim Bilgileri:</strong><br/>
{{companyName}}<br/>
Adres: {{address}}<br/>
E-posta: {{email}}<br/>
Telefon: {{phone}}</p>
</div>

<p class="disclaimer">Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.</p>`,
        contentEn: `<p>{{companyName}} processes your personal data in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK). This notice explains your rights and how your data is processed.</p>

<h2>Data Controller</h2>
<p><strong>{{companyName}}</strong><br/>
Address: {{address}}<br/>
Email: {{email}}<br/>
Phone: {{phone}}</p>

<h2>Your Rights Under KVKK (Article 11)</h2>
<p>You have the right to:</p>
<ul>
<li>Learn whether your data is processed</li>
<li>Request information about processing</li>
<li>Learn the purpose of processing</li>
<li>Know third parties to whom data is transferred</li>
<li>Request correction or deletion of data</li>
<li>Object to automated processing results</li>
</ul>

<h2>Contact</h2>
<p>For KVKK-related requests: {{email}}<br/>
Your requests will be processed within 30 days.</p>`,
    },

    'cerez-politikasi': {
        slug: 'cerez-politikasi',
        title: 'Çerez Politikası',
        titleEn: 'Cookie Policy',
        subtitle: 'Son Güncelleme: 15 Aralık 2025',
        subtitleEn: 'Last Updated: December 15, 2025',
        type: 'legal',
        editable: true,
        content: `<p>{{companyName}} olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek ve size daha iyi hizmet sunmak amacıyla çerezler kullanmaktayız. Bu politika, kullandığımız çerez türlerini ve bunları nasıl kontrol edebileceğinizi açıklamaktadır.</p>

<h2>Çerez Nedir?</h2>
<p>Çerezler, web sitelerinin tarayıcınıza gönderdiği ve cihazınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, siteye tekrar girdiğinizde sizi tanımamıza ve tercihlerinizi hatırlamamıza yardımcı olur.</p>

<h2>Kullandığımız Çerez Türleri</h2>

<h3>Zorunlu Çerezler</h3>
<p>Web sitesinin temel işlevlerini yerine getirmesi için gereklidir. Bu çerezler olmadan site düzgün çalışmaz. Oturum yönetimi, güvenlik ve temel site işlevleri için kullanılır.</p>

<h3>Analitik Çerezler</h3>
<p>Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Bu bilgiler, site performansını iyileştirmek için kullanılır. Google Analytics gibi araçlar bu kategoride yer alır.</p>

<h3>Fonksiyonel Çerezler</h3>
<p>Tercihlerinizi (dil, bölge vb.) hatırlamak için kullanılır. Bu çerezler sayesinde her ziyaretinizde ayarlarınızı yeniden yapmanız gerekmez.</p>

<h3>Pazarlama Çerezleri</h3>
<p>Size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır. Bu çerezler, reklamcılık ortaklarımız tarafından da kullanılabilir.</p>

<h2>Çerez Tercihlerinizi Yönetme</h2>
<p>Tarayıcı ayarlarınızdan çerezleri kabul etmeyebilir veya silebilirsiniz. Ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.</p>
<p>Çerez tercihlerinizi sitemizi ilk ziyaretinizde veya ayarlar bölümünden değiştirebilirsiniz.</p>

<h2>İletişim</h2>
<p>Çerez politikamız hakkında sorularınız için: {{email}}</p>`,
        contentEn: `<p>We use cookies to enhance your experience on our website. This policy explains the types of cookies we use and how you can control them.</p>

<h2>What are Cookies?</h2>
<p>Cookies are small text files stored on your device when you visit websites. They help us recognize you and remember your preferences.</p>

<h2>Types of Cookies We Use</h2>

<h3>Necessary Cookies</h3>
<p>Required for the website to function properly. Without these, the site won't work correctly.</p>

<h3>Analytics Cookies</h3>
<p>Help us understand how visitors use our site. We use tools like Google Analytics.</p>

<h3>Functional Cookies</h3>
<p>Remember your preferences (language, region, etc.).</p>

<h3>Marketing Cookies</h3>
<p>Used to show you relevant advertisements based on your interests.</p>

<h2>Managing Your Cookie Preferences</h2>
<p>You can manage cookies through your browser settings. Note that disabling some cookies may affect site functionality.</p>

<h2>Contact</h2>
<p>For questions about our cookie policy: {{email}}</p>`,
    },
};

// Helper function to get page content with placeholder replacement
export function getPageContent(slug: string, settings: {
    site_name?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
}): PageDefault | null {
    const page = pageDefaults[slug];
    if (!page) return null;

    const companyName = settings.site_name || 'Federal Gaz';
    const email = settings.contact_email || 'federal.gaz@hotmail.com';
    const phone = settings.contact_phone || '(0312) 395 35 95';
    const address = settings.contact_address || 'İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara';

    const replacePlaceholders = (text: string) => {
        return text
            .replace(/\{\{companyName\}\}/g, companyName)
            .replace(/\{\{email\}\}/g, email)
            .replace(/\{\{phone\}\}/g, phone)
            .replace(/\{\{address\}\}/g, address);
    };

    return {
        ...page,
        content: replacePlaceholders(page.content),
        contentEn: replacePlaceholders(page.contentEn),
    };
}

// Get list of all editable pages
export function getEditablePages(): PageDefault[] {
    return Object.values(pageDefaults).filter(p => p.editable);
}
