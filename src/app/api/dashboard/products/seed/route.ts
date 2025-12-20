import { NextResponse } from 'next/server';
import { Product, connectToDatabase } from '@/lib/models';

// Default products matching EXACTLY the live site at federalgaz.com/urunler
// AND matching the static fallback data in page.tsx
const defaultProducts = [
    {
        slug: 'medikal-gazlar',
        slugEN: 'medical-gases',
        titleTR: 'Medikal Gazlar',
        titleEN: 'Medical Gases',
        // desc = Hero Subtitle / Short Description
        descTR: 'Hastaneler ve evde bakım için hayati öneme sahip yüksek saflıkta medikal gazlar.',
        descEN: 'Vital high-purity medical gases for hospitals and home care.',
        // content = Long Description (Detail Page)
        contentTR: 'Federal Gaz olarak, insan sağlığının önemini biliyor ve medikal gaz üretiminde en yüksek kalite standartlarını (Avrupa Farmakopesi) titizlikle uyguluyoruz. Hastaneler, klinikler ve evde bakım hastaları için kesintisiz ve güvenilir medikal oksijen, azot protoksit ve medikal hava tedariği sağlıyoruz. Üretimden doluma ve dağıtıma kadar tüm süreçlerimiz Sağlık Bakanlığı mevzuatlarına tam uyumludur.',
        contentEN: 'At Federal Gaz, we understand the critical importance of human health and strictly adhere to the highest quality standards (European Pharmacopoeia) in medical gas production. We provide uninterrupted and reliable supply of medical oxygen, nitrous oxide, and medical air for hospitals, clinics, and home care patients. All our processes from production to filling and distribution are fully compliant with Health Ministry regulations.',
        // Image matching live site (Unsplash)
        image: '/products/medikal-gazlar-custom.jpg',
        heroImage: '/products/medikal-gazlar-custom.jpg',
        featuresTR: '%99.5+ Saflıkta Medikal Oksijen\n7/24 Acil Durum Tedariği\nEvde Bakım Oksijen Tüpleri\nAlüminyum ve Çelik Tüp Seçenekleri',
        featuresEN: '99.5%+ Purity Medical Oxygen\n24/7 Emergency Supply\nHome Care Oxygen Cylinders\nAluminum and Steel Cylinder Options',
        specsTR: JSON.stringify([
            { label: 'Saflık', value: '≥ %99.5' },
            { label: 'Standartlar', value: 'TS EN ISO 13485' },
            { label: 'Ambalaj', value: '2L, 5L, 10L, 40L Tüpler' }
        ]),
        specsEN: JSON.stringify([
            { label: 'Purity', value: '≥ 99.5%' },
            { label: 'Standards', value: 'TS EN ISO 13485' },
            { label: 'Packaging', value: '2L, 5L, 10L, 40L Cylinders' }
        ]),
        sortOrder: 1,
        listIcon: 'check',
        ctaIcon: 'contact_support',
    },
    {
        slug: 'endustriyel-gazlar',
        slugEN: 'industrial-gases',
        titleTR: 'Endüstriyel Gazlar',
        titleEN: 'Industrial Gases',
        descTR: 'Endüstriyel üretimlerin temel taşı olan yüksek kaliteli sanayi gazları.',
        descEN: 'Industrial production cornerstone high quality industrial gases.',
        contentTR: 'Metalürjiden kimyaya, otomotivden inşaata kadar pek çok sektörün ihtiyaç duyduğu Oksijen, Azot, Argon ve Karbondioksit gazlarını sağlıyoruz. Üretim süreçlerinizde verimliliği artırmak ve maliyetleri düşürmek için özel gaz tedarik çözümleri (tüp, manifold, dökme sıvı) geliştiriyoruz.',
        contentEN: 'We provide Oxygen, Nitrogen, Argon, and Carbon Dioxide gases needed by many sectors from metallurgy to chemistry, automotive to construction. We develop custom gas supply solutions to increase efficiency and reduce costs in your production processes.',
        image: '/products/endustriyel-gazlar-custom.jpg',
        heroImage: '/products/endustriyel-gazlar-custom.jpg',
        featuresTR: 'Yüksek Saflıkta Sanayi Gazları\nArgon, Azot, Oksijen, CO2\nKesintisiz ve Güvenilir Tedarik\nÇeşitli Tüp Boyutları (10L, 50L)',
        featuresEN: 'High Purity Industrial Gases\nArgon, Nitrogen, Oxygen, CO2\nContinuous and Reliable Supply\nVarious Cylinder Sizes (10L, 50L)',
        specsTR: JSON.stringify([
            { label: 'Uygulama Alanları', value: 'Kesim, Yakma, İnerte Etme' },
            { label: 'Tedarik Şekli', value: 'Tüp & Sıvı' },
            { label: 'Basınç', value: '150 - 230 Bar' }
        ]),
        specsEN: JSON.stringify([
            { label: 'Applications', value: 'Cutting, Combustion, Inerting' },
            { label: 'Supply', value: 'Cylinder & Liquid' },
            { label: 'Pressure', value: '150 - 230 Bar' }
        ]),
        sortOrder: 2,
        listIcon: 'check',
        ctaIcon: 'contact_support',
    },
    {
        slug: 'kaynak-gazlari',
        slugEN: 'welding-gases',
        titleTR: 'Kaynak Gazları',
        titleEN: 'Welding Gases',
        descTR: 'Mükemmel kaynak kalitesi için formüle edilmiş özel karışım gazları.',
        descEN: 'Special mixture gases formulated for perfect welding quality.',
        contentTR: 'MIG/MAG ve TIG kaynağı uygulamalarında sıçrantıyı azaltan, nüfuziyeti artıran ve mükemmel dikiş profili sağlayan koruyucu gaz karışımlarımız ile üretim kalitenizi yükseltiyoruz. Asetilen ve Argon karışımlarımız, en zorlu metal birleştirme işlemlerinde bile üstün performans sağlar.',
        contentEN: 'We elevate your production quality with our shielding gas mixtures that reduce spatter, increase penetration, and ensure perfect bead profile in MIG/MAG and TIG welding applications.',
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
        heroImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
        featuresTR: 'Düşük Sıçrantı\nYüksek Hız\nDerin Nüfuziyet\nGeniş Ürün Yelpazesi',
        featuresEN: 'Low Spatter\nHigh Speed\nDeep Penetration\nWide Range',
        specsTR: JSON.stringify([
            { label: 'Gazlar', value: 'Argon/CO2, Argon/O2' },
            { label: 'Tür', value: 'Koruyucu Gazlar' }
        ]),
        specsEN: JSON.stringify([
            { label: 'Gases', value: 'Argon/CO2, Argon/O2' },
            { label: 'Type', value: 'Shielding Gases' }
        ]),
        sortOrder: 3,
        listIcon: 'check',
        ctaIcon: 'contact_support',
    },
    {
        slug: 'gida-gazlari',
        slugEN: 'food-gases',
        titleTR: 'Gıda Gazları',
        titleEN: 'Food Gases',
        descTR: 'Tazeliği koruyan MAP ve dondurma gazları.',
        descEN: 'MAP and freezing gases preserving freshness.',
        contentTR: 'Gıda sınıfı CO2, Azot ve özel karışım gazlarımız ile gıdaların raf ömrünü uzatıyor (MAP), tazeliklerini koruyor ve güvenli bir şekilde dondurulmasını sağlıyoruz.',
        contentEN: 'We extend shelf life (MAP), preserve freshness, and ensure safe freezing of foods with our food-grade CO2, Nitrogen, and special mixture gases.',
        image: '/products/gida-gazlari-custom.jpg',
        heroImage: '/products/gida-gazlari-custom.jpg',
        featuresTR: 'Gıda Güvenliği Sertifikalı\nRaf Ömrü Uzatma (MAP)\nHızlı Dondurma',
        featuresEN: 'Food Safety Certified\nShelf Life Extension (MAP)\nQuick Freezing',
        specsTR: JSON.stringify([
            { label: 'Standart', value: 'ISO 22000' },
            { label: 'Gazlar', value: 'CO2, N2, O2' }
        ]),
        specsEN: JSON.stringify([
            { label: 'Standard', value: 'ISO 22000' },
            { label: 'Gases', value: 'CO2, N2, O2' }
        ]),
        sortOrder: 4,
        listIcon: 'check',
        ctaIcon: 'contact_support',
    },
    {
        slug: 'ozel-gazlar',
        slugEN: 'special-gases',
        titleTR: 'Özel Gazlar',
        titleEN: 'Special Gases',
        descTR: 'Laboratuvar ve analiz cihazları için ultra yüksek saflıkta gazlar.',
        descEN: 'Ultra-high purity gases for laboratories and analyzers.',
        contentTR: 'Hassas analiz cihazları, kalibrasyon işlemleri ve araştırma laboratuvarları için ppm ve ppb seviyesinde hassasiyetle üretilen özel gaz karışımları ve ultra yüksek saflıkta (5.0, 6.0) gazlar.',
        contentEN: 'Special gas mixtures and ultra-high purity (5.0, 6.0) gases produced with ppm and ppb level precision for sensitive analysis devices, calibration processes, and research laboratories.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
        heroImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
        featuresTR: 'Sertifikalı Karışımlar\nYüksek Saflık (6.0\'a kadar)\nÖzel Regülatörler',
        featuresEN: 'Certified Mixtures\nHigh Purity (up to 6.0)\nSpecial Regulators',
        specsTR: JSON.stringify([
            { label: 'Saflık', value: '99.999%+' },
            { label: 'Kullanım', value: 'Kalibrasyon, Analiz' }
        ]),
        specsEN: JSON.stringify([
            { label: 'Purity', value: '99.999%+' },
            { label: 'Use', value: 'Calibration, Analysis' }
        ]),
        sortOrder: 5,
        listIcon: 'check',
        ctaIcon: 'contact_support',
    },
    {
        slug: 'kriyojenik-sivilar',
        slugEN: 'cryogenic-liquids',
        titleTR: 'Kriyojenik Sıvılar',
        titleEN: 'Cryogenic Liquids',
        descTR: 'Endüstriyel soğutma ve dondurma için sıvı fazda gazlar.',
        descEN: 'Liquid phase gases for industrial cooling and freezing.',
        contentTR: '-196°C\'ye varan soğuklukta Sıvı Azot, Sıvı Oksijen ve Sıvı Argon tedariğimiz ile biyolojik örnek saklama, metal büzdürme, gıda dondurma gibi kriyojenik uygulamalarınız için çözüm ortağınızız.',
        contentEN: 'We are your solution partner for cryogenic applications such as biological sample storage, metal shrinking, and food freezing with our commercial Liquid Nitrogen, Liquid Oxygen, and Liquid Argon supply down to -196°C.',
        image: '/products/kriyojenik-sivilar-custom.jpg',
        heroImage: '/products/kriyojenik-sivilar-custom.jpg',
        featuresTR: '-196°C Sıvı Azot\nDewar ve Tank Dolumu\nYüksek Soğutma Kapasitesi',
        featuresEN: '-196°C Liquid Nitrogen\nDewar and Tank Filling\nHigh Cooling Capacity',
        specsTR: JSON.stringify([
            { label: 'Form', value: 'Sıvı Faz' },
            { label: 'Sıcaklık', value: "-196°C (LN2)" }
        ]),
        specsEN: JSON.stringify([
            { label: 'Form', value: 'Liquid Phase' },
            { label: 'Temperature', value: "-196°C (LN2)" }
        ]),
        sortOrder: 6,
        listIcon: 'check',
        ctaIcon: 'contact_support',
    },
];

// POST - Seed default products
export async function POST() {
    try {
        await connectToDatabase();

        // Sync table with new columns
        await Product.sync({ alter: true });

        // Delete existing products and reseed with live site data
        await Product.destroy({ where: {} });

        // Create products with exact live site content
        let created = 0;
        for (const product of defaultProducts) {
            try {
                // Ensure text fields are not null
                const p = {
                    ...product,
                    descTR: product.descTR || '',
                    descEN: product.descEN || '',
                    contentTR: product.contentTR || '',
                    contentEN: product.contentEN || '',
                    featuresTR: product.featuresTR || '',
                    featuresEN: product.featuresEN || '',
                    listIcon: product.listIcon || 'check',
                    ctaIcon: product.ctaIcon || 'contact_support',
                };
                await Product.create(p);
                created++;
            } catch (createError) {
                console.error(`Failed to create product ${product.slug}:`, createError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${created} ürün canlı site içeriğiyle yüklendi`
        });
    } catch (error) {
        console.error('Seed Products Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Failed to seed products',
            details: errorMessage
        }, { status: 500 });
    }
}
