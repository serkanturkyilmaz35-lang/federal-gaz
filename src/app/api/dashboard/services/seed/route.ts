'use server';

import { NextResponse } from 'next/server';
import { Service, connectToDatabase } from '@/lib/models';

// Authentic service data extracted from static pages
const defaultServices = [
    {
        slug: 'medikal-gazlar',
        icon: 'medical_services',
        titleTR: 'Medikal Gazlar',
        titleEN: 'Medical Gases',
        descTR: 'Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki ve sistemleri.',
        descEN: 'High-purity medical gas supply for the sensitive needs of the healthcare sector.',
        subtitleTR: 'Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki ve sistemleri.',
        subtitleEN: 'High purity medical gas supply for the sensitive needs of the healthcare sector',
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
        detailsTitleTR: 'Hizmet Detayları',
        detailsTitleEN: 'Service Details',
        detailsTR: 'Federal Gaz olarak, sağlık sektörünün en hassas ihtiyaçlarını karşılamak için yüksek saflıkta medikal gaz tedariki ve sistemleri sunuyoruz.',
        detailsEN: 'As Federal Gaz, we provide high purity medical gas supply and systems to meet the most sensitive needs of the healthcare sector.',
        listTitleTR: 'Sunduğumuz Medikal Gazlar:',
        listTitleEN: 'Medical Gases We Offer:',
        listItemsTR: 'Medikal Oksijen (O₂)\nMedikal Azot (N₂)\nMedikal Hava\nKarbondioksit (CO₂)\nAzot Protoksit (N₂O)',
        listItemsEN: 'Medical Oxygen (O₂)\nMedical Nitrogen (N₂)\nMedical Air\nCarbon Dioxide (CO₂)\nNitrous Oxide (N₂O)',
        featuresTitleTR: 'Özellikler:',
        featuresTitleEN: 'Features:',
        featureItemsTR: 'Uluslararası standartlara uygun üretim\nSürekli kalite kontrol\nHızlı ve güvenli teslimat\n7/24 teknik destek\nTüp ve tank kiralama seçenekleri',
        featureItemsEN: 'Production in accordance with international standards\nContinuous quality control\nFast and safe delivery\n24/7 technical support\nCylinder and tank rental options',
        ctaButtonTextTR: 'Sipariş Ver',
        ctaButtonTextEN: 'Order Now',
        ctaButtonLink: '/siparis',
        sortOrder: 1,
        isActive: true
    },
    {
        slug: 'endustriyel-gaz-dolumu',
        icon: 'propane_tank',
        titleTR: 'Endüstriyel Gaz Dolumu',
        titleEN: 'Industrial Gas Filling',
        descTR: 'Oksijen, azot, argon ve diğer endüstriyel gazların güvenli ve hızlı dolum hizmetleri.',
        descEN: 'Safe and fast filling services for oxygen, nitrogen, argon, and other industrial gases.',
        subtitleTR: 'Hızlı, güvenli ve standartlara uygun endüstriyel tüp dolum hizmetleri',
        subtitleEN: 'Fast, safe and standard-compliant industrial cylinder filling services',
        image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop',
        detailsTitleTR: 'Hizmet Detayları',
        detailsTitleEN: 'Service Details',
        detailsTR: 'Federal Gaz tesislerinde, her türlü endüstriyel gaz tüpünün dolumu, bakımı ve test işlemleri uzman ekibimiz tarafından titizlikle yapılmaktadır.',
        detailsEN: 'At Federal Gaz facilities, filling, maintenance, and testing operations for all types of industrial gas cylinders are meticulously carried out by our expert team.',
        listTitleTR: 'Dolum Yaptığımız Gazlar:',
        listTitleEN: 'Gases We Fill:',
        listItemsTR: 'Oksijen (O₂)\nAzot (N₂)\nArgon (Ar)\nKarbondioksit (CO₂)\nHelyum (He)\nHidrojen (H₂)',
        listItemsEN: 'Oxygen (O₂)\nNitrogen (N₂)\nArgon (Ar)\nCarbon Dioxide (CO₂)\nHelium (He)\nHydrogen (H₂)',
        featuresTitleTR: 'Özellikler:',
        featuresTitleEN: 'Features:',
        featureItemsTR: 'Otomatik dolum sistemleri\nDolum öncesi ve sonrası sızdırmazlık testleri\nTüp bakım ve boyama hizmeti\nHidrostatik test sertifikasyonu\nHızlı dolum ve teslimat',
        featureItemsEN: 'Automatic filling systems\nPre- and post-filling leak tests\nCylinder maintenance and painting service\nHydrostatic test certification\nFast filling and delivery',
        ctaButtonTextTR: 'Sipariş Ver',
        ctaButtonTextEN: 'Order Now',
        ctaButtonLink: '/siparis',
        sortOrder: 2,
        isActive: true
    },
    {
        slug: 'kaynak-gazlari',
        icon: 'construction',
        titleTR: 'Kaynak Gazları',
        titleEN: 'Welding Gases',
        descTR: 'Kaynak işlemleriniz için özel karışım gazlar ve ekipman tedariki.',
        descEN: 'Special mixture gases and equipment supply for your welding operations.',
        subtitleTR: 'Metal işleme ve kaynak uygulamaları için yüksek performanslı gaz çözümleri',
        subtitleEN: 'High-performance gas solutions for metal processing and welding applications',
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
        detailsTitleTR: 'Hizmet Detayları',
        detailsTitleEN: 'Service Details',
        detailsTR: 'Federal Gaz olarak, kaynak kalite ve verimliliğinizi artırmak için özel olarak hazırlanmış koruyucu kaynak gazları ve karışımları sunuyoruz.',
        detailsEN: 'As Federal Gaz, we offer specially prepared shielding welding gases and mixtures to increase your welding quality and efficiency.',
        listTitleTR: 'Sunduğumuz Kaynak Gazları:',
        listTitleEN: 'Welding Gases We Offer:',
        listItemsTR: 'Asetilen (C₂H₂)\nArgon (Ar)\nKarbondioksit (CO₂)\nArgon-Karbondioksit Karışımları\nOksijen (O₂)',
        listItemsEN: 'Acetylene (C₂H₂)\nArgon (Ar)\nCarbon Dioxide (CO₂)\nArgon-Carbon Dioxide Mixtures\nOxygen (O₂)',
        featuresTitleTR: 'Özellikler:',
        featuresTitleEN: 'Features:',
        featureItemsTR: 'Yüksek saflıkta gazlar\nStabil ark oluşumu sağlayan karışımlar\nSıçramayı azaltan formüller\nFarklı ambalaj seçenekleri\nTeknik danışmanlık hizmeti',
        featureItemsEN: 'High purity gases\nMixtures ensuring stable arc formation\nSpatter-reducing formulas\nVarious packaging options\nTechnical consultancy service',
        ctaButtonTextTR: 'Sipariş Ver',
        ctaButtonTextEN: 'Order Now',
        ctaButtonLink: '/siparis',
        sortOrder: 3,
        isActive: true
    },
    {
        slug: 'gida-gazlari',
        icon: 'restaurant',
        titleTR: 'Gıda Gazları',
        titleEN: 'Food Gases',
        descTR: 'Gıda endüstrisi için güvenli ve onaylı gaz çözümleri.',
        descEN: 'Safe and approved gas solutions for the food industry.',
        subtitleTR: 'Gıda güvenliği ve raf ömrü uzatma için sertifikalı gaz çözümleri',
        subtitleEN: 'Certified gas solutions for food safety and shelf life extension',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
        detailsTitleTR: 'Hizmet Detayları',
        detailsTitleEN: 'Service Details',
        detailsTR: 'Federal Gaz olarak, gıda ve içecek sektöründe tazeliği korumak ve kaliteyi artırmak için gıda sınıfı gazlar sunuyoruz.',
        detailsEN: 'As Federal Gaz, we offer food grade gases to preserve freshness and enhance quality in the food and beverage industry.',
        listTitleTR: 'Sunduğumuz Gıda Gazları:',
        listTitleEN: 'Food Gases We Offer:',
        listItemsTR: 'Gıda Sınıfı Karbondioksit (CO₂)\nGıda Sınıfı Azot (N₂)\nMAP (Modifiye Atmosfer Paketleme) Gazları\nKuru Buz\nOksijen (O₂)',
        listItemsEN: 'Food Grade Carbon Dioxide (CO₂)\nFood Grade Nitrogen (N₂)\nMAP (Modified Atmosphere Packaging) Gases\nDry Ice\nOxygen (O₂)',
        featuresTitleTR: 'Özellikler:',
        featuresTitleEN: 'Features:',
        featureItemsTR: 'Gıda güvenliği sertifikalı üretim\nRaf ömrünü uzatan özel karışımlar\nBakteri oluşumunu engelleyen çözümler\nTazelik ve lezzet koruma\nDüzenli tedarik ve stok takibi',
        featureItemsEN: 'Food safety certified production\nSpecial mixtures extending shelf life\nSolutions preventing bacterial growth\nPreserving freshness and taste\nRegular supply and stock tracking',
        ctaButtonTextTR: 'Sipariş Ver',
        ctaButtonTextEN: 'Order Now',
        ctaButtonLink: '/siparis',
        sortOrder: 4,
        isActive: true
    },
    {
        slug: 'ozel-gaz-karisimlari',
        icon: 'science',
        titleTR: 'Özel Gaz Karışımları',
        titleEN: 'Special Gas Mixtures',
        descTR: 'İhtiyaçlarınıza özel hazırlanan gaz karışımları ve danışmanlık hizmetleri.',
        descEN: 'Custom prepared gas mixtures and consultancy services for your needs.',
        subtitleTR: 'İhtiyaçlarınıza özel hazırlanan gaz karışımları ve danışmanlık hizmetleri',
        subtitleEN: 'Custom prepared gas mixtures and consultancy services for your needs',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop',
        detailsTitleTR: 'Hizmet Detayları',
        detailsTitleEN: 'Service Details',
        detailsTR: 'Federal Gaz olarak, endüstriyel ve laboratuvar uygulamalarınız için özel formülasyonlu gaz karışımları hazırlıyoruz.',
        detailsEN: 'As Federal Gaz, we prepare specially formulated gas mixtures for your industrial and laboratory applications.',
        listTitleTR: 'Özel Karışım Alanlarımız:',
        listTitleEN: 'Our Special Mixture Areas:',
        listItemsTR: 'Kalibrasyon Gazları\nLaboratuvar Karışımları\nLazer Kesim Gazları\nÖzel Endüstriyel Karışımlar\nAraştırma Gazları',
        listItemsEN: 'Calibration Gases\nLaboratory Mixtures\nLaser Cutting Gases\nSpecial Industrial Mixtures\nResearch Gases',
        featuresTitleTR: 'Özellikler:',
        featuresTitleEN: 'Features:',
        featureItemsTR: 'İstenilen oranlarda hassas karışım\nSertifikalı analiz raporu\nÖzel ambalajlama seçenekleri\nTeknik destek ve danışmanlık\nHızlı üretim ve teslimat',
        featureItemsEN: 'Precise mixing at desired ratios\nCertified analysis report\nSpecial packaging options\nTechnical support and consultancy\nFast production and delivery',
        ctaButtonTextTR: 'Sipariş Ver',
        ctaButtonTextEN: 'Order Now',
        ctaButtonLink: '/siparis',
        sortOrder: 5,
        isActive: true
    },
];

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        // Sync table to ensure columns exist (Runtime safety) - MUST be before any operations
        await Service.sync({ alter: true });

        // Check if we need to force reset (optional query param or just simple logic)
        // For now, simpler logic: if any services exist, delete them first to ensure clean state with new schema
        const existingCount = await Service.count();
        if (existingCount > 0) {
            console.log('Clearing existing services to re-seed with new schema structure...');
            await Service.destroy({ where: {}, truncate: true }); // Careful with truncate in prod, but ok for this CMS transition
        }

        // Bulk create all default services
        await Service.bulkCreate(defaultServices);

        return NextResponse.json({
            success: true,
            message: `${defaultServices.length} varsayılan hizmet başarıyla yüklendi!`
        }, { status: 201 });
    } catch (error) {
        console.error('Services Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed services' }, { status: 500 });
    }
}
