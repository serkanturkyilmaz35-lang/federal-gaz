import { NextResponse } from 'next/server';
import { EmailTemplate, connectToDatabase } from '@/lib/models';

// Default professional content for each template type
// This is exported for use in the mailing page
const defaultTemplateContent: { [key: string]: string } = {
    'modern': `Federal Gaz olarak 30 yılı aşkın tecrübemizle Ankara'nın en güvenilir endüstriyel gaz tedarikçisiyiz.

🔹 Oksijen, Argon, Azot, Asetilen, CO2
🔹 Kaynak gazları ve gaz karışımları
🔹 Medikal ve gıda sınıfı gazlar
🔹 Aynı gün teslimat imkanı

Tüm gaz ihtiyaçlarınız için bizi tercih ettiğiniz için teşekkür ederiz.`,

    'black-friday': `🔥 EFSANE CUMA BAŞLADI!

Yılın en büyük indirim kampanyası Federal Gaz'da!

✅ Tüm kaynak gazlarında %50'ye varan indirim
✅ Argon, Asetilen, CO2 karışımlarında özel fiyatlar
✅ Toplu alımlarda ekstra avantajlar
✅ Ücretsiz teslimat fırsatı

Stoklarla sınırlı bu fırsatı kaçırmayın!`,

    'new-year': `Yeni yılda işinizi Federal Gaz kalitesiyle büyütün!

2025 yılında sizlere daha iyi hizmet vermek için hazırız. Yeni yıl fiyat listemiz ve kampanyalarımız için bizimle iletişime geçin.

✨ Yeni yıl özel fiyatları
✨ Yıllık sözleşme avantajları
✨ Öncelikli teslimat imkanı

Mutlu, sağlıklı ve başarılı bir yıl diliyoruz!`,

    'ramazan-bayrami': `Ramazan Bayramınızı en içten dileklerimizle kutlarız.

Bu mübarek bayramda sevdiklerinizle huzurlu vakitler geçirmenizi dileriz.

Federal Gaz olarak bayram süresince de işletmenizin gaz ihtiyaçlarını karşılamaya devam ediyoruz. Acil talepleriniz için 7/24 hizmetinizdeyiz.`,

    'kurban-bayrami': `Kurban Bayramınız mübarek olsun!

Paylaşmanın ve birlik olmanın sembolü olan bu bayramda tüm müşterilerimize sağlık ve mutluluk diliyoruz.

Bayram boyunca LPG ve tüp siparişleriniz için nöbet hizmetimiz devam etmektedir.`,

    'winter-campaign': `❄️ KIŞ KAMPANYASI BAŞLADI!

Soğuk kış aylarına hazır mısınız?

🔥 LPG ve Propan tüplerinde kış indirimi
🏠 Isınma gazlarında toptan fiyat avantajı
🚚 Ankara geneli aynı gün teslimat
⚡ Acil siparişlerde öncelikli hizmet

Kışa hazırlıklı girin, Federal Gaz yanınızda!`,

    'weekend-sale': `🎉 HAFTA SONU ÖZEL FİYATLARI!

Sadece bu hafta sonu geçerli:

✅ Tüm endüstriyel gazlarda %30 indirim
✅ Argon ve CO2'de özel fiyatlar
✅ Minimum sipariş limiti yok
✅ Ücretsiz teslimat

Pazartesi'den önce siparişinizi verin!`,

    'welcome': `Federal Gaz ailesine hoş geldiniz! 🎉

Bizi tercih ettiğiniz için teşekkür ederiz. Üyeliğinizle birlikte şu avantajlardan yararlanabilirsiniz:

🚚 Hızlı Teslimat - Siparişleriniz aynı gün kapınızda
💰 Özel Fiyatlar - Üyelere özel indirimli fiyatlar
🎁 Kampanyalar - İlk siparişte %10 indirim kodu: HOSGELDIN
📞 7/24 Destek - Her an yanınızdayız

İlk siparişinizi vermek için hemen sitemizi ziyaret edin!`,

    'classic': `Sayın Müşterimiz,

Federal Gaz olarak endüstriyel gaz sektöründe Ankara'nın lider tedarikçisi olarak hizmet vermekteyiz.

Geniş ürün yelpazemiz:
• Medikal Gazlar (Oksijen, Azot)
• Kaynak Gazları (Argon, Asetilen, CO2 karışımları)
• Endüstriyel Gazlar (Hidrojen, Helyum, Propan)
• Özel Gaz Karışımları

Kalite ve güvenilirlik için Federal Gaz'ı tercih edin.

Saygılarımızla,
Federal Gaz Ekibi`,

    '23-nisan': `🇹🇷 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı Kutlu Olsun!

Ulu Önder Mustafa Kemal Atatürk'ün çocuklara armağan ettiği bu özel günde, geleceğimizin teminatı olan çocuklarımızın bayramını en içten dileklerimizle kutlarız.

Federal Gaz olarak, ülkemizin sanayisine hizmet etmekten gurur duyuyoruz.

Bayramınız kutlu olsun! 🎈`,

    '29-ekim': `🇹🇷 29 Ekim Cumhuriyet Bayramı Kutlu Olsun!

Cumhuriyetimizin ${new Date().getFullYear() - 1923}. yılını gururla kutluyoruz!

Ulu Önder Mustafa Kemal Atatürk ve silah arkadaşlarını saygı ve minnetle anıyoruz.

Federal Gaz olarak, Cumhuriyetimizin değerlerine sahip çıkarak Türk sanayisine hizmet etmeye devam ediyoruz.

Yaşasın Cumhuriyet! 🇹🇷`,

    '19-mayis': `🇹🇷 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı Kutlu Olsun!

Ulu Önder Mustafa Kemal Atatürk'ün Samsun'a çıkarak başlattığı Kurtuluş Savaşı'nın yıl dönümünde, gençlerimizin bayramını kutlarız.

"Gençler, Cumhuriyeti biz kurduk, onu yükseltecek ve sürdürecek olan sizlersiniz." - M. Kemal Atatürk

Federal Gaz olarak gençlerimize güveniyoruz! ⚽🏆`,

    '30-agustos': `🇹🇷 30 Ağustos Zafer Bayramı Kutlu Olsun!

Büyük Taarruz'un ${new Date().getFullYear() - 1922}. yıl dönümünde, bu zaferi bize armağan eden başta Gazi Mustafa Kemal Atatürk olmak üzere tüm şehitlerimizi saygı ve minnetle anıyoruz.

Bu zafer, milletimizin bağımsızlık aşkının en büyük kanıtıdır.

Zafer Bayramınız kutlu olsun! 🎖️`,

    'stock-reminder': `📦 STOK HATIRLATMASI

Sayın Müşterimiz,

Kayıtlarımıza göre düzenli olarak kullandığınız gazların stok tazeleme zamanı gelmiş olabilir.

Mevcut stoklarınız:
• Argon • Oksijen • Asetilen • CO2

Kesintisiz üretim için siparişinizi şimdiden verin!

📞 Hemen Sipariş: (0312) 395 35 95
🚚 Aynı gün teslimat garantisi`,

    'promotion': `🎁 ÖZEL KAMPANYA!

Federal Gaz'dan size özel fırsat!

Bu ay boyunca geçerli avantajlar:
✅ Toplu alımlarda %20 indirim
✅ Yeni müşterilere özel fiyatlar
✅ Ücretsiz tüp teslim/teslimat
✅ Esnek ödeme seçenekleri

Kampanya stoklarla sınırlıdır.
Fırsatı kaçırmayın!`,

    'vip-customer': `⭐ VIP MÜŞTERİMİZ

Değerli İş Ortağımız,

Federal Gaz VIP müşterisi olarak size özel ayrıcalıklarınız:

👑 Öncelikli Teslimat - Siparişleriniz en önce
💎 Özel Fiyatlandırma - Size özel indirimli fiyatlar  
📞 Dedicated Destek - Özel müşteri temsilcisi
🎁 Sürpriz Hediyeler - Dönemsel özel hediyeler

VIP müşterimiz olduğunuz için teşekkür ederiz.`
};

// Default subject and name for each template
const defaultTemplateSubjects: { [key: string]: { subject: string; name: string } } = {
    'modern': { subject: 'Federal Gaz - Endüstriyel Gaz Çözümleri', name: 'Genel Bilgilendirme' },
    'black-friday': { subject: '🔥 Efsane Cuma İndirimlerini Kaçırmayın!', name: 'Black Friday Kampanyası' },
    'new-year': { subject: '✨ Yeni Yılınız Kutlu Olsun!', name: 'Yeni Yıl Kutlaması' },
    'ramazan-bayrami': { subject: '🌙 Ramazan Bayramınız Mübarek Olsun', name: 'Ramazan Bayramı Kutlaması' },
    'kurban-bayrami': { subject: '🕌 Kurban Bayramınız Kutlu Olsun', name: 'Kurban Bayramı Kutlaması' },
    'winter-campaign': { subject: '❄️ Kış Kampanyası Başladı!', name: 'Kış Kampanyası' },
    'weekend-sale': { subject: '🎉 Hafta Sonu Özel İndirimleri', name: 'Hafta Sonu Kampanyası' },
    'welcome': { subject: '🎉 Federal Gaz Ailesine Hoş Geldiniz!', name: 'Hoş Geldiniz E-postası' },
    'classic': { subject: 'Federal Gaz - Bilgilendirme', name: 'Klasik Bilgilendirme' },
    '23-nisan': { subject: '🇹🇷 23 Nisan Kutlu Olsun!', name: '23 Nisan Kutlaması' },
    '29-ekim': { subject: '🇹🇷 Cumhuriyet Bayramı Kutlu Olsun!', name: '29 Ekim Kutlaması' },
    '19-mayis': { subject: '🇹🇷 19 Mayıs Kutlu Olsun!', name: '19 Mayıs Kutlaması' },
    '30-agustos': { subject: '🇹🇷 Zafer Bayramı Kutlu Olsun!', name: '30 Ağustos Kutlaması' },
    'stock-reminder': { subject: '📦 Stok Hatırlatması - Siparişinizi Verin', name: 'Stok Hatırlatma' },
    'promotion': { subject: '🎁 Size Özel Kampanya Fırsatı!', name: 'Kampanya Duyurusu' },
    'vip-customer': { subject: '⭐ VIP Müşterimize Özel', name: 'VIP Müşteri E-postası' },
};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const templateSlug = searchParams.get('slug');

    if (templateSlug) {
        // Get default content
        const content = defaultTemplateContent[templateSlug] || defaultTemplateContent['modern'];
        const subjectData = defaultTemplateSubjects[templateSlug] || defaultTemplateSubjects['modern'];

        // Try to get template from DB for logo and banner
        let logoUrl = '';
        let bannerImage = '';

        try {
            await connectToDatabase();
            const template = await EmailTemplate.findOne({ where: { slug: templateSlug } });
            if (template) {
                logoUrl = template.logoUrl || '';
                bannerImage = template.bannerImage || '';
            }
        } catch (e) {
            console.error('Failed to fetch template from DB:', e);
        }

        return NextResponse.json({
            content,
            subject: subjectData.subject,
            name: subjectData.name,
            logoUrl,
            bannerImage
        });
    }

    // Return all template contents
    return NextResponse.json({ contents: defaultTemplateContent });
}

