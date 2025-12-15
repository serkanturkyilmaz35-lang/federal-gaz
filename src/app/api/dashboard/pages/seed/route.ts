import { NextRequest, NextResponse } from 'next/server';
import { Page, connectToDatabase } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

// POST /api/dashboard/pages/seed - Seed initial legal pages
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Legal pages to seed
        const legalPages = [
            {
                slug: 'gizlilik-politikasi',
                title: 'Gizlilik Politikası',
                titleEn: 'Privacy Policy',
                content: `<p>Federal Gaz olarak müşterilerimizin bilgilerinin gizliliğini korumak amacıyla aşağıda belirtilen temel kuralları benimsemiştir. Kişisel verilerinizin güvenliği ve gizliliği bizim için son derece önemlidir.</p>

<h2>1. Veri Sorumlusu</h2>
<p><strong>Federal Gaz</strong><br/>
Adres: İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara<br/>
E-posta: federal.gaz@hotmail.com<br/>
Telefon: (0312) 395 35 95</p>

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
<p>Federal Gaz, müşterinin izni haricinde veya yasal bir zorunluluk olmadığı sürece müşterilerine ait bilgiyi herhangi bir üçüncü şahıs, kurum ve kuruluş ile paylaşmayacağını, bu bilgileri en yüksek güvenlik ve gizlilik standartlarında koruyacağını taahhüt eder.</p>

<h2>5. Veri Güvenliği</h2>
<p>Kişisel verilerinizin güvenliği için SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolü gibi teknik ve idari tedbirler uygulanmaktadır.</p>

<h2>6. Sorumluluk Reddi</h2>
<p>Federal Gaz web sitesinde bulunan tüm bilgi, içerik ve görüşler sadece bilgi vermek amaçlı olup hiçbir şekilde alış veya satış teklifi olarak değerlendirilemez.</p>

<h2>7. Dış Bağlantılar</h2>
<p>Gizlilik politikalarımızda yer alan taahhütlerimiz sadece web sitemiz için geçerlidir.</p>

<h2>8. Değişiklik Hakkı</h2>
<p>Federal Gaz, web sitesinde yer alan tüm bilgileri önceden bildirimde bulunmadan değiştirme hakkına sahiptir.</p>

<h2>9. İletişim</h2>
<p>Gizlilik politikamız hakkında sorularınız için: federal.gaz@hotmail.com</p>`,
                contentEn: 'Privacy Policy content in English...',
                status: 'published',
                type: 'legal',
                isSystemPage: true,
                metaTitle: 'Gizlilik Politikası | Federal Gaz',
                metaDescription: 'Federal Gaz gizlilik politikası ve kişisel verilerin korunması hakkında bilgi.',
            },
            {
                slug: 'kvkk',
                title: '6698 Sayılı KVKK Aydınlatma Metni',
                titleEn: 'KVKK Disclosure Notice',
                content: `<p>Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere, kişilerin temel hak ve özgürlüklerini korumak amacıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") yürürlüğe girmiştir.</p>

<h2>1. Veri Sorumlusu</h2>
<p>6698 Sayılı Kanun'da tanımlandığı şekli ile "Veri Sorumlusu" sıfatına sahip olan:</p>
<p><strong>Federal Gaz</strong><br/>
Adres: İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara<br/>
E-posta: federal.gaz@hotmail.com<br/>
Telefon: (0312) 395 35 95</p>

<h2>2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
<p>Kişisel verileriniz, KVKK'da belirtilen esaslar dahilinde, otomatik ya da otomatik olmayan yöntemlerle; web sitemiz, iletişim formları, sipariş formları, üyelik kayıt formu, telefon ve e-posta aracılığıyla sözlü, yazılı ya da elektronik olarak toplanmaktadır.</p>

<h2>3. İşlenen Kişisel Veriler ve İşlenme Amaçları</h2>
<ul>
<li>Taleplerinizin değerlendirilmesi ve sonuçlandırılması</li>
<li>Ürün ve hizmetlerin en iyi koşullarda sağlanması</li>
<li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
<li>Müşteri memnuniyetinin sağlanması</li>
<li>Fatura ve muhasebe işlemlerinin yapılması</li>
<li>Yasal yükümlülüklerin yerine getirilmesi</li>
</ul>

<h2>4. Kişisel Verilerin Aktarımı</h2>
<p>Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde yetkili kurumlara, kargo firmalarına ve teknik hizmet sağlayıcılarına aktarılabilir.</p>

<h2>5. KVKK Madde 11 Kapsamındaki Haklarınız</h2>
<ul>
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
<li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
<li>Kişisel verilerin işlenme amacını öğrenme</li>
<li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme</li>
<li>Kişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme</li>
<li>KVKK'nın 7. maddesindeki şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme</li>
<li>Düzeltme, silme veya yok edilme işlemlerinin üçüncü kişilere bildirilmesini isteme</li>
<li>İşlenen verilerin otomatik analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme</li>
</ul>

<h2>6. Başvuru Yöntemi</h2>
<p><strong>E-posta:</strong> federal.gaz@hotmail.com adresine "Kişisel Verilerin Korunması Kanunu Bilgi Talebi" konulu e-posta göndererek</p>
<p>Başvurularınız, talebin niteliğine göre en kısa sürede sonuçlandırılacaktır.</p>`,
                contentEn: 'KVKK Disclosure Notice content in English...',
                status: 'published',
                type: 'legal',
                isSystemPage: true,
                metaTitle: 'KVKK Aydınlatma Metni | Federal Gaz',
                metaDescription: 'Federal Gaz KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.',
            },
            {
                slug: 'cerez-politikasi',
                title: 'Çerez Politikası',
                titleEn: 'Cookie Policy',
                content: `<p>Federal Gaz olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek ve size daha iyi hizmet sunmak amacıyla çerezler kullanmaktayız.</p>

<h2>Çerez Nedir?</h2>
<p>Çerezler, web sitelerinin tarayıcınıza gönderdiği ve cihazınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, siteye tekrar girdiğinizde sizi tanımamıza ve tercihlerinizi hatırlamamıza yardımcı olur.</p>

<h2>Kullandığımız Çerez Türleri</h2>
<h3>Zorunlu Çerezler</h3>
<p>Web sitesinin temel işlevlerini yerine getirmesi için gereklidir. Bu çerezler olmadan site düzgün çalışmaz.</p>

<h3>Analitik Çerezler</h3>
<p>Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Google Analytics gibi araçlar kullanılır.</p>

<h3>Fonksiyonel Çerezler</h3>
<p>Tercihlerinizi (dil, bölge vb.) hatırlamak için kullanılır.</p>

<h3>Pazarlama Çerezleri</h3>
<p>Size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır.</p>

<h2>Çerez Tercihlerinizi Yönetme</h2>
<p>Tarayıcı ayarlarınızdan çerezleri kabul etmeyebilir veya silebilirsiniz. Ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.</p>

<h2>İletişim</h2>
<p>Çerez politikamız hakkında sorularınız için: federal.gaz@hotmail.com</p>`,
                contentEn: 'Cookie Policy content in English...',
                status: 'published',
                type: 'legal',
                isSystemPage: true,
                metaTitle: 'Çerez Politikası | Federal Gaz',
                metaDescription: 'Federal Gaz çerez kullanımı ve çerez politikası hakkında bilgi.',
            },
        ];

        const results = [];

        for (const pageData of legalPages) {
            // Check if page already exists
            const existing = await Page.findOne({ where: { slug: pageData.slug } });
            if (existing) {
                results.push({ slug: pageData.slug, status: 'already exists' });
                continue;
            }

            // Create new page
            const page = await Page.create(pageData as any);
            results.push({ slug: pageData.slug, status: 'created', id: page.id });
        }

        return NextResponse.json({ message: 'Legal pages seeded', results });
    } catch (error) {
        console.error('Error seeding pages:', error);
        return NextResponse.json({ error: 'Failed to seed pages' }, { status: 500 });
    }
}
