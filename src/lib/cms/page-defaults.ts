// Default page content structure for CMS
// Each page has sections with default content

export interface SectionContent {
    [key: string]: string | string[] | SectionContent[] | undefined;
}

export interface PageSection {
    key: string;
    title: string;          // Section display name in editor
    fields: FieldConfig[];  // Editable fields
    defaultContent: {
        TR: SectionContent;
        EN: SectionContent;
    };
}

export interface FieldConfig {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'images' | 'items' | 'icon' | 'button';
    itemFields?: FieldConfig[];  // For 'items' type
    placeholder?: string;        // Placeholder text for inputs
}

export interface PageConfig {
    slug: string;
    title: string;
    titleEN: string;
    sections: PageSection[];
}

// ===== ANA SAYFA =====
export const homePageConfig: PageConfig = {
    slug: '/',
    title: 'Ana Sayfa',
    titleEN: 'Home Page',
    sections: [
        {
            key: 'hero',
            title: 'Hero Bölümü',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
                { key: 'buttonText', label: 'Buton Metni', type: 'text' },
                { key: 'images', label: 'Slider Görselleri', type: 'images' },
            ],
            defaultContent: {
                TR: {
                    title: 'Üretiminize Güç Katan Endüstriyel Gaz Çözümleri',
                    description: 'Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.',
                    buttonText: 'Sipariş Ver',
                    images: [
                        '/hero/industrial-cylinders-1.png',
                        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&h=1080&fit=crop',
                        'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&h=1080&fit=crop',
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop',
                        '/hero/industrial-cylinders-2.png',
                    ],
                },
                EN: {
                    title: 'Industrial Gas Solutions Powering Your Production',
                    description: 'We provide innovative, sustainable, and high-quality services for your industrial gas needs.',
                    buttonText: 'Order Now',
                    images: [
                        '/hero/industrial-cylinders-1.png',
                        'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&h=1080&fit=crop',
                        'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&h=1080&fit=crop',
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop',
                        '/hero/industrial-cylinders-2.png',
                    ],
                },
            },
        },
        {
            key: 'marquee',
            title: 'Kayan Duyuru Yazısı',
            fields: [
                { key: 'text', label: 'Duyuru Metni', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    text: 'Önemli Duyuru: Federal Gaz sipariş ve destek talepleriniz için 7/24 iletişim e-posta adresimiz federal.gaz@hotmail.com',
                },
                EN: {
                    text: 'Important Announcement: Our 24/7 contact email for your order and support requests is federal.gaz@hotmail.com',
                },
            },
        },
        {
            key: 'about',
            title: 'Hakkımızda Bölümü',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
                { key: 'linkText', label: 'Link Metni', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    title: 'Federal Gaz Hakkında',
                    description: 'Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamak, vizyonumuz ise sektörde lider bir marka olmaktır.',
                    linkText: 'Daha Fazla Bilgi →',
                },
                EN: {
                    title: 'About Federal Gaz',
                    description: 'With years of experience in the industrial gas sector, Federal Gaz provides reliable and high-quality solutions to its customers. Our mission is to provide sustainable and efficient energy sources using innovative technologies, and our vision is to be a leading brand in the sector.',
                    linkText: 'More Info →',
                },
            },
        },
        {
            key: 'products',
            title: 'Ürünler Bölümü',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                {
                    key: 'items',
                    label: 'Ürünler',
                    type: 'items',
                    itemFields: [
                        { key: 'title', label: 'Ürün Adı', type: 'text' },
                        { key: 'image', label: 'Görsel', type: 'image' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    title: 'Ürün Yelpazemiz',
                    items: [
                        { title: 'Medikal Oksijen', image: '/gallery/medikal-oksijen.png' },
                        { title: 'Endüstriyel Oksijen', image: '/gallery/endustriyel-oksijen.png' },
                        { title: 'Azot (N₂)', image: '/gallery/azot.png' },
                        { title: 'Argon (Ar)', image: '/gallery/argon.png' },
                        { title: 'Karbondioksit (CO₂)', image: '/gallery/karbondioksit.png' },
                        { title: 'Asetilen', image: '/gallery/asetilen.png' },
                        { title: 'Propan', image: '/gallery/propan.png' },
                        { title: 'Helyum (He)', image: '/gallery/helyum.png' },
                    ],
                },
                EN: {
                    title: 'Our Products',
                    items: [
                        { title: 'Medical Oxygen', image: '/gallery/medikal-oksijen.png' },
                        { title: 'Industrial Oxygen', image: '/gallery/endustriyel-oksijen.png' },
                        { title: 'Nitrogen (N₂)', image: '/gallery/azot.png' },
                        { title: 'Argon (Ar)', image: '/gallery/argon.png' },
                        { title: 'Carbon Dioxide (CO₂)', image: '/gallery/karbondioksit.png' },
                        { title: 'Acetylene', image: '/gallery/asetilen.png' },
                        { title: 'Propane', image: '/gallery/propan.png' },
                        { title: 'Helium (He)', image: '/gallery/helyum.png' },
                    ],
                },
            },
        },
        {
            key: 'services',
            title: 'Hizmetler Bölümü',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
                { key: 'buttonText', label: 'Buton Metni', type: 'text' },
                {
                    key: 'items',
                    label: 'Hizmetler',
                    type: 'items',
                    itemFields: [
                        { key: 'title', label: 'Hizmet Adı', type: 'text' },
                        { key: 'description', label: 'Açıklama', type: 'textarea' },
                        { key: 'image', label: 'Görsel', type: 'image' },
                        { key: 'link', label: 'Link', type: 'text' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    title: 'Öne Çıkan Hizmetlerimiz',
                    description: 'Geniş hizmet yelpazemizle endüstrinizin tüm gaz ihtiyaçlarına profesyonel çözümler sunuyoruz.',
                    buttonText: 'Tüm Hizmetleri Gör',
                    items: [
                        {
                            title: 'Medikal Gazlar',
                            description: 'Hastaneler ve sağlık kuruluşları için yüksek saflıkta medikal oksijen, azot protoksit ve özel gaz karışımları.',
                            image: '/products/medikal-gazlar-custom.jpg',
                            link: '/hizmetler/medikal-gazlar',
                        },
                        {
                            title: 'Kaynak Gazları',
                            description: 'Metal işleme ve kaynak uygulamaları için asetilen, argon ve özel karışım gazlar.',
                            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop',
                            link: '/hizmetler/kaynak-gazlari',
                        },
                        {
                            title: 'Gıda Gazları',
                            description: 'Yiyecek ve içecek sektörü için CO₂, azot ve MAP gazları ile güvenli çözümler.',
                            image: '/products/gida-gazlari-custom.jpg',
                            link: '/hizmetler/gida-gazlari',
                        },
                    ],
                },
                EN: {
                    title: 'Featured Services',
                    description: 'We offer professional solutions for all your industrial gas needs with our wide range of services.',
                    buttonText: 'View All Services',
                    items: [
                        {
                            title: 'Medical Gases',
                            description: 'High-purity medical oxygen, nitrous oxide and special gas mixtures for hospitals and healthcare facilities.',
                            image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=300&fit=crop',
                            link: '/hizmetler/medikal-gazlar',
                        },
                        {
                            title: 'Welding Gases',
                            description: 'Acetylene, argon and special mixture gases for metal processing and welding applications.',
                            image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop',
                            link: '/hizmetler/kaynak-gazlari',
                        },
                        {
                            title: 'Food Gases',
                            description: 'Safe solutions with CO₂, nitrogen and MAP gases for the food and beverage sector.',
                            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop',
                            link: '/hizmetler/gida-gazlari',
                        },
                    ],
                },
            },
        },
    ],
};

// ===== HAKKIMIZDA SAYFASI =====
export const aboutPageConfig: PageConfig = {
    slug: '/hakkimizda',
    title: 'Hakkımızda',
    titleEN: 'About Us',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Hakkımızda',
                    subtitle: 'Federal Gaz olarak endüstriyel gaz sektöründe güvenilir çözümler sunuyoruz.',
                },
                EN: {
                    title: 'About Us',
                    subtitle: 'As Federal Gaz, we provide reliable solutions in the industrial gas sector.',
                },
            },
        },
        {
            key: 'mission',
            title: 'Misyon',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Misyonumuz',
                    description: 'Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamaktır.',
                },
                EN: {
                    title: 'Our Mission',
                    description: 'With years of experience in the industrial gas sector, Federal Gaz provides reliable and high-quality solutions to its customers. Our mission is to provide sustainable and efficient energy sources using innovative technologies.',
                },
            },
        },
        {
            key: 'vision',
            title: 'Vizyon',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Vizyonumuz',
                    description: 'Vizyonumuz, endüstriyel gaz sektöründe lider bir marka olmak ve müşterilerimize en iyi hizmeti sunarak sektörde fark yaratmaktır. Sürekli gelişim ve yenilikçilik ilkelerimizle hareket ediyoruz.',
                },
                EN: {
                    title: 'Our Vision',
                    description: 'Our vision is to be a leading brand in the industrial gas sector and make a difference by offering the best service to our customers. We act with principles of continuous improvement and innovation.',
                },
            },
        },
        {
            key: 'values',
            title: 'Değerlerimiz',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                {
                    key: 'items',
                    label: 'Değerler',
                    type: 'items',
                    itemFields: [
                        { key: 'title', label: 'Başlık', type: 'text' },
                        { key: 'description', label: 'Açıklama', type: 'textarea' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    title: 'Değerlerimiz',
                    items: [
                        { title: 'Kalite', description: 'En yüksek kalite standartlarında ürün ve hizmet sunuyoruz.' },
                        { title: 'Güvenilirlik', description: 'Müşterilerimizin güvenini kazanmak ve korumak önceliğimizdir.' },
                        { title: 'Yenilikçilik', description: 'Sürekli gelişim ve yenilikçi çözümlerle sektöre öncülük ediyoruz.' },
                    ],
                },
                EN: {
                    title: 'Our Values',
                    items: [
                        { title: 'Quality', description: 'We provide products and services at the highest quality standards.' },
                        { title: 'Reliability', description: "Winning and maintaining our customers' trust is our priority." },
                        { title: 'Innovation', description: 'We lead the sector with continuous improvement and innovative solutions.' },
                    ],
                },
            },
        },
    ],
};

// ===== İLETİŞİM SAYFASI =====
export const contactPageConfig: PageConfig = {
    slug: '/iletisim',
    title: 'İletişim',
    titleEN: 'Contact',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'İletişim',
                    subtitle: 'Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.',
                },
                EN: {
                    title: 'Contact',
                    subtitle: 'Contact us, we will be happy to assist you.',
                },
            },
        },
    ],
};

// ===== HİZMETLER ANA SAYFA =====
export const servicesPageConfig: PageConfig = {
    slug: '/hizmetler',
    title: 'Hizmetler',
    titleEN: 'Services',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Hizmetlerimiz',
                    subtitle: 'Endüstriyel gaz ihtiyaçlarınız için kapsamlı çözümler sunuyoruz.',
                },
                EN: {
                    title: 'Our Services',
                    subtitle: 'We offer comprehensive solutions for your industrial gas needs.',
                },
            },
        },
    ],
};

// ===== MEDİKAL GAZLAR =====
export const medicalGasesPageConfig: PageConfig = {
    slug: '/hizmetler/medikal-gazlar',
    title: 'Medikal Gazlar',
    titleEN: 'Medical Gases',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Medikal Gazlar',
                    subtitle: 'Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki',
                },
                EN: {
                    title: 'Medical Gases',
                    subtitle: 'High purity medical gas supply for the sensitive needs of the healthcare sector',
                },
            },
        },
        {
            key: 'content',
            title: 'İçerik Bölümü',
            fields: [
                { key: 'image', label: 'Görsel URL', type: 'image' },
                { key: 'detailsTitle', label: 'Detaylar Başlığı', type: 'text' },
                { key: 'details', label: 'Detay Metni', type: 'textarea' },
                { key: 'listTitle', label: 'Liste Başlığı', type: 'text' },
                { key: 'listItems', label: 'Liste Öğeleri (her satır bir öğe)', type: 'textarea' },
                { key: 'featuresTitle', label: 'Özellikler Başlığı', type: 'text' },
                { key: 'featureItems', label: 'Özellik Öğeleri (her satır bir öğe)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
                    detailsTitle: 'Hizmet Detayları',
                    details: 'Federal Gaz olarak, sağlık sektörünün en hassas ihtiyaçlarını karşılamak için yüksek saflıkta medikal gaz tedariki ve sistemleri sunuyoruz.',
                    listTitle: 'Sunduğumuz Medikal Gazlar:',
                    listItems: 'Medikal Oksijen (O₂)\nMedikal Azot (N₂)\nMedikal Hava\nKarbondioksit (CO₂)\nAzot Protoksit (N₂O)\nÖzel Gaz Karışımları',
                    featuresTitle: 'Özellikler:',
                    featureItems: 'Uluslararası standartlara uygun üretim\nSürekli kalite kontrol\nHızlı ve güvenli teslimat\n7/24 teknik destek\nTüp ve tank kiralama seçenekleri',
                },
                EN: {
                    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop',
                    detailsTitle: 'Service Details',
                    details: 'As Federal Gaz, we provide high purity medical gas supply and systems to meet the most sensitive needs of the healthcare sector.',
                    listTitle: 'Medical Gases We Offer:',
                    listItems: 'Medical Oxygen (O₂)\nMedical Nitrogen (N₂)\nMedical Air\nCarbon Dioxide (CO₂)\nNitrous Oxide (N₂O)\nSpecial Gas Mixtures',
                    featuresTitle: 'Features:',
                    featureItems: 'Production in accordance with international standards\nContinuous quality control\nFast and safe delivery\n24/7 technical support\nCylinder and tank rental options',
                },
            },
        },
        {
            key: 'cta',
            title: 'Buton Ayarları',
            fields: [
                { key: 'buttonText', label: 'Buton Metni', type: 'text' },
                { key: 'buttonLink', label: 'Buton Linki', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    buttonText: 'Sipariş Ver',
                    buttonLink: '/siparis',
                },
                EN: {
                    buttonText: 'Order Now',
                    buttonLink: '/siparis',
                },
            },
        },
    ],
};

// ===== KAYNAK GAZLARI =====
export const weldingGasesPageConfig: PageConfig = {
    slug: '/hizmetler/kaynak-gazlari',
    title: 'Kaynak Gazları',
    titleEN: 'Welding Gases',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Kaynak Gazları',
                    subtitle: 'Metal işleme ve kaynak uygulamaları için yüksek performanslı gaz çözümleri',
                },
                EN: {
                    title: 'Welding Gases',
                    subtitle: 'High-performance gas solutions for metal processing and welding applications',
                },
            },
        },
        {
            key: 'content',
            title: 'İçerik Bölümü',
            fields: [
                { key: 'image', label: 'Görsel URL', type: 'image' },
                { key: 'detailsTitle', label: 'Detaylar Başlığı', type: 'text' },
                { key: 'details', label: 'Detay Metni', type: 'textarea' },
                { key: 'listTitle', label: 'Liste Başlığı', type: 'text' },
                { key: 'listItems', label: 'Liste Öğeleri (her satır bir öğe)', type: 'textarea' },
                { key: 'featuresTitle', label: 'Özellikler Başlığı', type: 'text' },
                { key: 'featureItems', label: 'Özellik Öğeleri (her satır bir öğe)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
                    detailsTitle: 'Hizmet Detayları',
                    details: 'Federal Gaz olarak, kaynak kalite ve verimliliğinizi artırmak için özel olarak hazırlanmış koruyucu kaynak gazları ve karışımları sunuyoruz.',
                    listTitle: 'Sunduğumuz Kaynak Gazları:',
                    listItems: 'Asetilen (C₂H₂)\nArgon (Ar)\nKarbondioksit (CO₂)\nArgon-Karbondioksit Karışımları\nOksijen (O₂)\nÖzel Kaynak Karışımları',
                    featuresTitle: 'Özellikler:',
                    featureItems: 'Yüksek saflıkta gazlar\nStabil ark oluşumu sağlayan karışımlar\nSıçramayı azaltan formüller\nFarklı ambalaj seçenekleri\nTeknik danışmanlık hizmeti',
                },
                EN: {
                    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
                    detailsTitle: 'Service Details',
                    details: 'As Federal Gaz, we offer specially prepared shielding welding gases and mixtures to increase your welding quality and efficiency.',
                    listTitle: 'Welding Gases We Offer:',
                    listItems: 'Acetylene (C₂H₂)\nArgon (Ar)\nCarbon Dioxide (CO₂)\nArgon-Carbon Dioxide Mixtures\nOxygen (O₂)\nSpecial Welding Mixtures',
                    featuresTitle: 'Features:',
                    featureItems: 'High purity gases\nMixtures ensuring stable arc formation\nSpatter-reducing formulas\nVarious packaging options\nTechnical consultancy service',
                },
            },
        },
        {
            key: 'cta',
            title: 'Buton Ayarları',
            fields: [
                { key: 'buttonText', label: 'Buton Metni', type: 'text' },
                { key: 'buttonLink', label: 'Buton Linki', type: 'text' },
            ],
            defaultContent: {
                TR: { buttonText: 'Sipariş Ver', buttonLink: '/siparis' },
                EN: { buttonText: 'Order Now', buttonLink: '/siparis' },
            },
        },
    ],
};

// ===== ÖZEL GAZ KARIŞIMLARI =====
export const specialMixturesPageConfig: PageConfig = {
    slug: '/hizmetler/ozel-gaz-karisimlari',
    title: 'Özel Gaz Karışımları',
    titleEN: 'Special Gas Mixtures',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Özel Gaz Karışımları',
                    subtitle: 'İhtiyaçlarınıza özel hazırlanan gaz karışımları ve danışmanlık hizmetleri',
                },
                EN: {
                    title: 'Special Gas Mixtures',
                    subtitle: 'Custom prepared gas mixtures and consultancy services for your needs',
                },
            },
        },
        {
            key: 'content',
            title: 'İçerik Bölümü',
            fields: [
                { key: 'image', label: 'Görsel URL', type: 'image' },
                { key: 'detailsTitle', label: 'Detaylar Başlığı', type: 'text' },
                { key: 'details', label: 'Detay Metni', type: 'textarea' },
                { key: 'listTitle', label: 'Liste Başlığı', type: 'text' },
                { key: 'listItems', label: 'Liste Öğeleri (her satır bir öğe)', type: 'textarea' },
                { key: 'featuresTitle', label: 'Özellikler Başlığı', type: 'text' },
                { key: 'featureItems', label: 'Özellik Öğeleri (her satır bir öğe)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop',
                    detailsTitle: 'Hizmet Detayları',
                    details: 'Federal Gaz olarak, endüstriyel ve laboratuvar uygulamalarınız için özel formülasyonlu gaz karışımları hazırlıyoruz.',
                    listTitle: 'Özel Karışım Alanlarımız:',
                    listItems: 'Kalibrasyon Gazları\nLaboratuvar Karışımları\nLazer Kesim Gazları\nÖzel Endüstriyel Karışımlar\nAraştırma Gazları\nÇevre Ölçüm Gazları',
                    featuresTitle: 'Özellikler:',
                    featureItems: 'İstenilen oranlarda hassas karışım\nSertifikalı analiz raporu\nÖzel ambalajlama seçenekleri\nTeknik destek ve danışmanlık\nHızlı üretim ve teslimat',
                },
                EN: {
                    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&h=600&fit=crop',
                    detailsTitle: 'Service Details',
                    details: 'As Federal Gaz, we prepare specially formulated gas mixtures for your industrial and laboratory applications.',
                    listTitle: 'Our Special Mixture Areas:',
                    listItems: 'Calibration Gases\nLaboratory Mixtures\nLaser Cutting Gases\nSpecial Industrial Mixtures\nResearch Gases\nEnvironmental Measurement Gases',
                    featuresTitle: 'Features:',
                    featureItems: 'Precise mixing at desired ratios\nCertified analysis report\nSpecial packaging options\nTechnical support and consultancy\nFast production and delivery',
                },
            },
        },
        {
            key: 'cta',
            title: 'Buton Ayarları',
            fields: [
                { key: 'buttonText', label: 'Buton Metni', type: 'text' },
                { key: 'buttonLink', label: 'Buton Linki', type: 'text' },
            ],
            defaultContent: {
                TR: { buttonText: 'Sipariş Ver', buttonLink: '/siparis' },
                EN: { buttonText: 'Order Now', buttonLink: '/siparis' },
            },
        },
    ],
};

// ===== GIDA GAZLARI =====
export const foodGasesPageConfig: PageConfig = {
    slug: '/hizmetler/gida-gazlari',
    title: 'Gıda Gazları',
    titleEN: 'Food Gases',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Gıda Gazları',
                    subtitle: 'Gıda güvenliği ve raf ömrü uzatma için sertifikalı gaz çözümleri',
                },
                EN: {
                    title: 'Food Gases',
                    subtitle: 'Certified gas solutions for food safety and shelf life extension',
                },
            },
        },
        {
            key: 'content',
            title: 'İçerik Bölümü',
            fields: [
                { key: 'image', label: 'Görsel URL', type: 'image' },
                { key: 'detailsTitle', label: 'Detaylar Başlığı', type: 'text' },
                { key: 'details', label: 'Detay Metni', type: 'textarea' },
                { key: 'listTitle', label: 'Liste Başlığı', type: 'text' },
                { key: 'listItems', label: 'Liste Öğeleri (her satır bir öğe)', type: 'textarea' },
                { key: 'featuresTitle', label: 'Özellikler Başlığı', type: 'text' },
                { key: 'featureItems', label: 'Özellik Öğeleri (her satır bir öğe)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
                    detailsTitle: 'Hizmet Detayları',
                    details: 'Federal Gaz olarak, gıda ve içecek sektöründe tazeliği korumak ve kaliteyi artırmak için gıda sınıfı gazlar sunuyoruz.',
                    listTitle: 'Sunduğumuz Gıda Gazları:',
                    listItems: 'Gıda Sınıfı Karbondioksit (CO₂)\nGıda Sınıfı Azot (N₂)\nMAP (Modifiye Atmosfer Paketleme) Gazları\nKuru Buz\nOksijen (O₂)\nİçecek Gazlama Çözümleri',
                    featuresTitle: 'Özellikler:',
                    featureItems: 'Gıda güvenliği sertifikalı üretim\nRaf ömrünü uzatan özel karışımlar\nBakteri oluşumunu engelleyen çözümler\nTazelik ve lezzet koruma\nDüzenli tedarik ve stok takibi',
                },
                EN: {
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
                    detailsTitle: 'Service Details',
                    details: 'As Federal Gaz, we offer food grade gases to preserve freshness and enhance quality in the food and beverage industry.',
                    listTitle: 'Food Gases We Offer:',
                    listItems: 'Food Grade Carbon Dioxide (CO₂)\nFood Grade Nitrogen (N₂)\nMAP (Modified Atmosphere Packaging) Gases\nDry Ice\nOxygen (O₂)\nBeverage Carbonation Solutions',
                    featuresTitle: 'Features:',
                    featureItems: 'Food safety certified production\nSpecial mixtures extending shelf life\nSolutions preventing bacterial growth\nPreserving freshness and taste\nRegular supply and stock tracking',
                },
            },
        },
        {
            key: 'cta',
            title: 'Buton Ayarları',
            fields: [
                { key: 'buttonText', label: 'Buton Metni', type: 'text' },
                { key: 'buttonLink', label: 'Buton Linki', type: 'text' },
            ],
            defaultContent: {
                TR: { buttonText: 'Sipariş Ver', buttonLink: '/siparis' },
                EN: { buttonText: 'Order Now', buttonLink: '/siparis' },
            },
        },
    ],
};

// ===== GALERİ =====
export const galleryPageConfig: PageConfig = {
    slug: '/galeri',
    title: 'Galeri',
    titleEN: 'Gallery',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: 'Galeri',
                    subtitle: 'Ürünlerimiz ve hizmetlerimizden kareler.',
                },
                EN: {
                    title: 'Gallery',
                    subtitle: 'Snapshots from our products and services.',
                },
            },
        },
        {
            key: 'categories',
            title: 'Kategori İsimleri',
            fields: [
                {
                    key: 'categoryItems',
                    label: 'Kategoriler',
                    type: 'items',
                    itemFields: [
                        { key: 'key', label: 'Kategori Anahtarı (örn: medical, industrial)', type: 'text' },
                        { key: 'name', label: 'Kategori Adı', type: 'text' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    categoryItems: [
                        { key: 'medical', name: 'Medikal Gazlar' },
                        { key: 'industrial', name: 'Endüstriyel Gazlar' },
                        { key: 'food', name: 'Gıda Gazları' },
                        { key: 'cryogenic', name: 'Kriyojenik Sıvılar' },
                        { key: 'special', name: 'Özel Gazlar' },
                        { key: 'welding', name: 'Kaynak Gazları' },
                    ],
                },
                EN: {
                    categoryItems: [
                        { key: 'medical', name: 'Medical Gases' },
                        { key: 'industrial', name: 'Industrial Gases' },
                        { key: 'food', name: 'Food Gases' },
                        { key: 'cryogenic', name: 'Cryogenic Liquids' },
                        { key: 'special', name: 'Special Gases' },
                        { key: 'welding', name: 'Welding Gases' },
                    ],
                },
            },
        },
        {
            key: 'images',
            title: 'Galeri Görselleri',
            fields: [
                {
                    key: 'galleryItems',
                    label: 'Görseller',
                    type: 'items',
                    itemFields: [
                        { key: 'src', label: 'Görsel URL (Medya Galeriden)', type: 'image' },
                        { key: 'alt', label: 'Görsel Açıklaması', type: 'text' },
                        { key: 'category', label: 'Kategori (medical, industrial, food, cryogenic, special, welding)', type: 'text' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    galleryItems: [
                        { src: '/gallery/medikal-oksijen.png', alt: 'Medikal Oksijen Tüpü', category: 'medical' },
                        { src: '/gallery/endustriyel-oksijen.png', alt: 'Endüstriyel Oksijen Tüpü', category: 'industrial' },
                        { src: '/gallery/azot.png', alt: 'Azot Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/argon.png', alt: 'Argon Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/karbondioksit.png', alt: 'Karbondioksit Tüpü', category: 'food' },
                        { src: '/gallery/asetilen.png', alt: 'Asetilen Tüpü', category: 'industrial' },
                        { src: '/gallery/helyum.png', alt: 'Helyum Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/propan.png', alt: 'Propan Tüpü', category: 'industrial' },
                        { src: '/gallery/hidrojen.png', alt: 'Hidrojen Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/amonyak.png', alt: 'Amonyak Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/kuru-hava.png', alt: 'Kuru Hava Tüpü', category: 'medical' },
                        { src: '/gallery/protoksit.png', alt: 'Azot Protoksit Tüpü', category: 'medical' },
                        { src: '/gallery/balon-gazi.png', alt: 'Balon Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/kaynak-gazi.png', alt: 'Kaynak Gazı Karışım Tüpü', category: 'welding' },
                        { src: '/gallery/kaynak-mix-1.png', alt: 'Argon/CO2 Karışım Tüpü', category: 'welding' },
                        { src: '/gallery/kaynak-mix-2.png', alt: 'Üçlü Karışım Kaynak Gazı', category: 'welding' },
                        { src: '/gallery/kaynak-mix-3.png', alt: 'Lazer Kaynak Gazı Tüpü', category: 'welding' },
                        { src: '/gallery/ozel-gaz.png', alt: 'Özel Gaz Karışım Tüpü', category: 'special' },
                        { src: '/gallery/gida-gazi-mix.png', alt: 'Gıda Gazı Karışım Tüpü', category: 'food' },
                        { src: '/gallery/kriyojenik-tup.png', alt: 'Kriyojenik Sıvı Silindiri', category: 'cryogenic' },
                    ],
                },
                EN: {
                    galleryItems: [
                        { src: '/gallery/medikal-oksijen.png', alt: 'Medical Oxygen Cylinder', category: 'medical' },
                        { src: '/gallery/endustriyel-oksijen.png', alt: 'Industrial Oxygen Cylinder', category: 'industrial' },
                        { src: '/gallery/azot.png', alt: 'Nitrogen Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/argon.png', alt: 'Argon Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/karbondioksit.png', alt: 'Carbon Dioxide Cylinder', category: 'food' },
                        { src: '/gallery/asetilen.png', alt: 'Acetylene Cylinder', category: 'industrial' },
                        { src: '/gallery/helyum.png', alt: 'Helium Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/propan.png', alt: 'Propane Cylinder', category: 'industrial' },
                        { src: '/gallery/hidrojen.png', alt: 'Hydrogen Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/amonyak.png', alt: 'Ammonia Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/medikal-oksijen.png', alt: 'Medikal Oksijen Tüpü', category: 'medical' },
                        { src: '/gallery/endustriyel-oksijen.png', alt: 'Endüstriyel Oksijen Tüpü', category: 'industrial' },
                        { src: '/gallery/azot.png', alt: 'Azot Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/argon.png', alt: 'Argon Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/karbondioksit.png', alt: 'Karbondioksit Tüpü', category: 'food' },
                        { src: '/gallery/asetilen.png', alt: 'Asetilen Tüpü', category: 'industrial' },
                        { src: '/gallery/helyum.png', alt: 'Helyum Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/propan.png', alt: 'Propan Tüpü', category: 'industrial' },
                        { src: '/gallery/hidrojen.png', alt: 'Hidrojen Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/amonyak.png', alt: 'Amonyak Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/kuru-hava.png', alt: 'Kuru Hava Tüpü', category: 'medical' },
                        { src: '/gallery/protoksit.png', alt: 'Azot Protoksit Tüpü', category: 'medical' },
                        { src: '/gallery/balon-gazi.png', alt: 'Balon Gazı Tüpü', category: 'industrial' },
                        { src: '/gallery/kaynak-gazi.png', alt: 'Kaynak Gazı Karışım Tüpü', category: 'welding' },
                        { src: '/gallery/kaynak-mix-1.png', alt: 'Argon/CO2 Karışım Tüpü', category: 'welding' },
                        { src: '/gallery/kaynak-mix-2.png', alt: 'Üçlü Karışım Kaynak Gazı', category: 'welding' },
                        { src: '/gallery/kaynak-mix-3.png', alt: 'Lazer Kaynak Gazı Tüpü', category: 'welding' },
                        { src: '/gallery/ozel-gaz.png', alt: 'Özel Gaz Karışım Tüpü', category: 'special' },
                        { src: '/gallery/gida-gazi-mix.png', alt: 'Gıda Gazı Karışım Tüpü', category: 'food' },
                        { src: '/gallery/kriyojenik-tup.png', alt: 'Kriyojenik Sıvı Silindiri', category: 'cryogenic' },
                    ],
                },
                EN: {
                    galleryItems: [
                        { src: '/gallery/medikal-oksijen.png', alt: 'Medical Oxygen Cylinder', category: 'medical' },
                        { src: '/gallery/endustriyel-oksijen.png', alt: 'Industrial Oxygen Cylinder', category: 'industrial' },
                        { src: '/gallery/azot.png', alt: 'Nitrogen Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/argon.png', alt: 'Argon Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/karbondioksit.png', alt: 'Carbon Dioxide Cylinder', category: 'food' },
                        { src: '/gallery/asetilen.png', alt: 'Acetylene Cylinder', category: 'industrial' },
                        { src: '/gallery/helyum.png', alt: 'Helium Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/propan.png', alt: 'Propane Cylinder', category: 'industrial' },
                        { src: '/gallery/hidrojen.png', alt: 'Hydrogen Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/amonyak.png', alt: 'Ammonia Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/kuru-hava.png', alt: 'Dry Air Cylinder', category: 'medical' },
                        { src: '/gallery/protoksit.png', alt: 'Nitrous Oxide Cylinder', category: 'medical' },
                        { src: '/gallery/balon-gazi.png', alt: 'Balloon Gas Cylinder', category: 'industrial' },
                        { src: '/gallery/kaynak-gazi.png', alt: 'Welding Gas Mix Cylinder', category: 'welding' },
                        { src: '/gallery/kaynak-mix-1.png', alt: 'Argon/CO2 Mix Cylinder', category: 'welding' },
                        { src: '/gallery/kaynak-mix-2.png', alt: 'Triple Mix Welding Gas', category: 'welding' },
                        { src: '/gallery/kaynak-mix-3.png', alt: 'Laser Welding Gas Cylinder', category: 'welding' },
                        { src: '/gallery/ozel-gaz.png', alt: 'Special Gas Mix Cylinder', category: 'special' },
                        { src: '/gallery/gida-gazi-mix.png', alt: 'Food Gas Mix Cylinder', category: 'food' },
                        { src: '/gallery/kriyojenik-tup.png', alt: 'Cryogenic Liquid Cylinder', category: 'cryogenic' },
                    ],
                },
            },
        },
    ],
};

// ===== KVKK =====
export const kvkkPageConfig: PageConfig = {
    slug: '/kvkk',
    title: 'KVKK Aydınlatma Metni',
    titleEN: 'GDPR Information',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    title: '6698 Sayılı Kişisel Verilerin Korunması Kanunu Aydınlatma Metni',
                    subtitle: 'KVKK Uyarınca Kişisel Verilerin İşlenmesine İlişkin Bilgilendirme'
                },
                EN: {
                    title: 'KVKK Disclosure Notice',
                    subtitle: 'Personal Data Protection Law No. 6698'
                },
            },
        },
        {
            key: 'infoBox',
            title: 'Bilgi Kutusu',
            fields: [
                { key: 'text', label: 'Ön Bilgilendirme Metni', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    text: 'Kişisel verilerin işlenmesinde başta özel hayatın gizliliği olmak üzere, kişilerin temel hak ve özgürlüklerini korumak amacıyla 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") yürürlüğe girmiştir. Bu aydınlatma metni ile sizleri; kişisel verilerinizin işlenmesi, aktarılması, toplanma yöntemleri ve KVKK kapsamındaki haklarınız konusunda bilgilendiriyoruz.',
                },
                EN: {
                    text: 'Federal Gaz processes your personal data in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK). This notice explains your rights and how your data is processed.',
                },
            },
        },
        {
            key: 'section1',
            title: '1. Veri Sorumlusu',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'intro', label: 'Giriş Metni', type: 'text' },
            ],
            defaultContent: {
                TR: { title: '1. Veri Sorumlusu', intro: '6698 Sayılı Kanun\'da tanımlandığı şekli ile "Veri Sorumlusu" sıfatına sahip olan:' },
                EN: { title: 'Data Controller', intro: 'As defined by Law No. 6698, the Data Controller is:' },
            },
        },
        {
            key: 'section2',
            title: '2. Veri Toplama',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
                { key: 'legalTitle', label: 'Hukuki Sebepler Başlığı', type: 'text' },
                { key: 'legalReasons', label: 'Hukuki Sebepler (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '2. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi',
                    description: 'Kişisel verileriniz, KVKK\'da belirtilen esaslar dahilinde, otomatik ya da otomatik olmayan yöntemlerle; web sitemiz, iletişim formları, sipariş formları, üyelik kayıt formu, telefon ve e-posta aracılığıyla sözlü, yazılı ya da elektronik olarak toplanmaktadır.',
                    legalTitle: 'Hukuki Sebepler (KVKK Madde 5 ve 6):',
                    legalReasons: 'Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması\nKanunlarda açıkça öngörülmesi\nHukuki yükümlülüğün yerine getirilmesi\nVeri sorumlusunun meşru menfaati\nBir hakkın tesisi, kullanılması veya korunması\nAçık rızanızın bulunması',
                },
                EN: {
                    title: '2. Data Collection Methods and Legal Basis',
                    description: 'Your personal data is collected through automatic or non-automatic methods via our website, contact forms, order forms, membership registration, phone and email.',
                    legalTitle: 'Legal Bases (KVKK Article 5 and 6):',
                    legalReasons: 'Direct relation to establishing or performing a contract\nExplicit provision in laws\nFulfillment of legal obligations\nLegitimate interests of the data controller\nEstablishment, exercise or protection of a right\nExistence of your explicit consent',
                },
            },
        },
        {
            key: 'section3',
            title: '3. İşlenme Amaçları',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'text' },
                { key: 'purposes', label: 'Amaçlar (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '3. İşlenen Kişisel Veriler ve İşlenme Amaçları',
                    description: 'Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:',
                    purposes: 'Taleplerinizin değerlendirilmesi ve sonuçlandırılması\nÜrün ve hizmetlerin en iyi koşullarda sağlanması\nSipariş ve teslimat süreçlerinin yürütülmesi\nMüşteri memnuniyetinin sağlanması\nFatura ve muhasebe işlemlerinin yapılması\nYasal yükümlülüklerin yerine getirilmesi\nİletişim faaliyetlerinin yürütülmesi',
                },
                EN: {
                    title: '3. Processed Data and Processing Purposes',
                    description: 'Your personal data is processed for the following purposes:',
                    purposes: 'Evaluation and conclusion of your requests\nProviding products and services under best conditions\nOrder and delivery processes\nEnsuring customer satisfaction\nInvoicing and accounting operations\nFulfilling legal obligations\nConducting communication activities',
                },
            },
        },
        {
            key: 'section4',
            title: '4. Veri Aktarımı',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
                { key: 'recipients', label: 'Aktarım Yapılan Taraflar (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '4. Kişisel Verilerin Aktarımı',
                    description: 'Kişisel verileriniz, KVKK\'nın 8. ve 9. maddelerinde belirtilen şartlar çerçevesinde ve yukarıda belirtilen amaçlarla sınırlı olmak kaydıyla aşağıdaki taraflara aktarılabilir:',
                    recipients: 'Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına\nSipariş teslimatı için iş birliği yaptığımız kargo firmalarına\nFatura kesimi için mali müşavir/muhasebe hizmeti sağlayıcılarına\nTeknik altyapı hizmeti sağlayan iş ortaklarımıza\nHukuki zorunluluklar çerçevesinde avukat ve danışmanlara',
                },
                EN: {
                    title: '4. Data Transfer',
                    description: 'Your personal data may be transferred to the following parties within the scope of KVKK Articles 8 and 9:',
                    recipients: 'Authorized public institutions when legally required\nCargo companies for order delivery\nAccounting service providers for invoicing\nTechnical infrastructure partners\nLawyers and consultants for legal requirements',
                },
            },
        },
        {
            key: 'section5',
            title: '5. Haklarınız',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'text' },
                { key: 'rights', label: 'Haklar (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '5. KVKK Madde 11 Kapsamındaki Haklarınız',
                    description: 'Kişisel Verilerin Korunması Kanunu\'nun 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:',
                    rights: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme\nKişisel verileriniz işlenmişse buna ilişkin bilgi talep etme\nKişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme\nYurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme\nKişisel verilerin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme\nKVKK\'nın 7. maddesindeki şartlar çerçevesinde kişisel verilerin silinmesini veya yok edilmesini isteme\nDüzeltme, silme veya yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme\nİşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
                },
                EN: {
                    title: '5. Your Rights Under KVKK (Article 11)',
                    description: 'Under Article 11 of the Personal Data Protection Law, you have the following rights:',
                    rights: 'Learn whether your personal data is processed\nRequest information about processing if your data has been processed\nLearn the purpose of processing and whether it is used accordingly\nKnow third parties to whom your data is transferred domestically or abroad\nRequest correction if your data is incomplete or incorrect\nRequest deletion or destruction of data under KVKK Article 7 conditions\nRequest notification of corrections, deletions or destruction to third parties\nObject to results arising from automated analysis of processed data',
                },
            },
        },
        {
            key: 'section6',
            title: '6. Başvuru',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'text' },
                { key: 'methods', label: 'Başvuru Yöntemleri (her satır bir yöntem)', type: 'textarea' },
                { key: 'closing', label: 'Kapanış Metni', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    title: '6. Başvuru Yöntemi',
                    description: 'Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:',
                    methods: 'E-posta: federal.gaz@hotmail.com adresine "Kişisel Verilerin Korunması Kanunu Bilgi Talebi" konulu e-posta göndererek\nPosta: İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara adresine yazılı dilekçe ile\nŞahsen: Kimlik belgesi ile şirketimize bizzat başvurarak',
                    closing: 'Başvurularınız, talebin niteliğine göre en kısa sürede sonuçlandırılacaktır.',
                },
                EN: {
                    title: '6. Application Method',
                    description: 'You can apply using the following methods to exercise your rights:',
                    methods: 'Email: Send an email to federal.gaz@hotmail.com with subject "KVKK Information Request"\nMail: Written petition to İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara\nIn Person: Apply in person with identification document',
                    closing: 'Your applications will be processed as soon as possible depending on the nature of the request.',
                },
            },
        },
        {
            key: 'disclaimer',
            title: 'Uyarı Metni',
            fields: [
                { key: 'text', label: 'Yasal Uyarı', type: 'textarea' },
            ],
            defaultContent: {
                TR: { text: 'Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu\'nun 10. maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ uyarınca hazırlanmıştır.' },
                EN: { text: 'This disclosure notice has been prepared in accordance with Article 10 of the Personal Data Protection Law No. 6698 and the Communiqué on Procedures and Principles to be Followed in Fulfilling the Obligation to Inform.' },
            },
        },
    ],
};

// ===== GİZLİLİK POLİTİKASI =====
export const privacyPageConfig: PageConfig = {
    slug: '/gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    titleEN: 'Privacy Policy',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'text' },
            ],
            defaultContent: {
                TR: { title: 'Gizlilik Politikası', subtitle: 'Son Güncelleme: 15 Aralık 2025' },
                EN: { title: 'Privacy Policy', subtitle: 'Last Updated: December 15, 2025' },
            },
        },
        {
            key: 'intro',
            title: 'Giriş',
            fields: [
                { key: 'text', label: 'Giriş Metni', type: 'textarea' },
            ],
            defaultContent: {
                TR: { text: 'Federal Gaz olarak müşterilerimizin bilgilerinin gizliliğini korumak amacıyla aşağıda belirtilen temel kuralları benimsemiştir. Kişisel verilerinizin güvenliği ve gizliliği bizim için son derece önemlidir.' },
                EN: { text: 'Federal Gaz ("Company") is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information.' },
            },
        },
        {
            key: 'section1',
            title: '1. Veri Sorumlusu',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
            ],
            defaultContent: {
                TR: { title: '1. Veri Sorumlusu' },
                EN: { title: '1. Data Controller' },
            },
        },
        {
            key: 'section2',
            title: '2. Toplanan Veriler',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'text' },
                { key: 'dataTypes', label: 'Veri Türleri (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '2. Toplanan Veriler',
                    description: 'Web sitemiz ve hizmetlerimiz aracılığıyla aşağıdaki kişisel veriler toplanabilir:',
                    dataTypes: 'Kimlik Bilgileri: Ad, soyad\nİletişim Bilgileri: E-posta adresi, telefon numarası, adres\nSipariş Bilgileri: Ürün tercihleri, sipariş geçmişi, teslimat adresi\nÜyelik Bilgileri: Kullanıcı adı, şifre (şifrelenmiş olarak)',
                },
                EN: {
                    title: '2. Data We Collect',
                    description: 'The following personal data may be collected through our website and services:',
                    dataTypes: 'Identity Information: Name, surname\nContact Information: Email address, phone number, address\nOrder Information: Product preferences, order history, delivery address\nMembership Information: Username, password (encrypted)',
                },
            },
        },
        {
            key: 'section3',
            title: '3. İşlenme Amaçları',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'text' },
                { key: 'purposes', label: 'Amaçlar (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '3. Verilerin İşlenme Amaçları',
                    description: 'Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:',
                    purposes: 'Sipariş ve talep süreçlerinin yürütülmesi\nÜrün ve hizmet tesliminin sağlanması\nİletişim taleplerinizin cevaplanması\nMüşteri hizmetleri desteği sağlanması\nHizmet kalitesinin iyileştirilmesi\nYasal yükümlülüklerin yerine getirilmesi\nFatura ve muhasebe işlemlerinin yapılması',
                },
                EN: {
                    title: '3. Purpose of Processing',
                    description: 'Your personal data is processed for the following purposes:',
                    purposes: 'Processing order and request procedures\nProviding product and service delivery\nResponding to your communication requests\nProviding customer service support\nImproving service quality\nFulfilling legal obligations\nInvoicing and accounting operations',
                },
            },
        },
        {
            key: 'section4',
            title: '4. Verilerin Paylaşımı',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
                { key: 'recipients', label: 'Paylaşım Yapılan Taraflar (her satır bir madde)', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    title: '4. Verilerin Paylaşımı',
                    description: 'Federal Gaz, müşterinin izni haricinde veya yasal bir zorunluluk olmadığı sürece müşterilerine ait bilgiyi herhangi bir üçüncü şahıs, kurum ve kuruluş ile paylaşmayacağını, bu bilgileri en yüksek güvenlik ve gizlilik standartlarında koruyacağını taahhüt eder. Veriler yalnızca aşağıdaki durumlarda paylaşılabilir:',
                    recipients: 'Yasal zorunluluk halinde yetkili kamu kurumlarıyla\nSipariş teslimatı için kargo/lojistik firmalarıyla\nTeknik altyapı hizmeti sağlayıcılarıyla (hosting, e-posta vb.)',
                },
                EN: {
                    title: '4. Data Sharing',
                    description: 'Federal Gaz commits not to share customer information with any third party without consent or legal requirement. Data may only be shared in the following cases:',
                    recipients: 'With authorized public institutions when legally required\nWith cargo/logistics companies for order delivery\nWith technical infrastructure providers (hosting, email, etc.)',
                },
            },
        },
        {
            key: 'section5',
            title: '5. Veri Güvenliği',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: { title: '5. Veri Güvenliği', description: 'Kişisel verilerinizin güvenliği için SSL şifreleme, güvenli sunucu altyapısı ve erişim kontrolü gibi teknik ve idari tedbirler uygulanmaktadır.' },
                EN: { title: '5. Data Security', description: 'Technical and administrative measures such as SSL encryption, secure server infrastructure and access control are applied for the security of your personal data.' },
            },
        },
        {
            key: 'section6',
            title: '6. Sorumluluk Reddi',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: { title: '6. Sorumluluk Reddi', description: 'Federal Gaz web sitesinde bulunan tüm bilgi, içerik ve görüşler sadece bilgi vermek amaçlı olup hiçbir şekilde alış veya satış teklifi olarak değerlendirilemez. Federal Gaz, web sitesinde bulunan bilgi, içerik ve görüşlerin doğruluğu, tamlığı ve eksiksizliğini garanti etmemekle birlikte bu bilgilerdeki eksiklikler ve yanlışlıklardan dolayı hiçbir şekilde sorumlu bulunmamaktadır.' },
                EN: { title: '6. Disclaimer', description: 'All information, content and opinions on the Federal Gaz website are for informational purposes only and cannot be considered as an offer to buy or sell. Federal Gaz does not guarantee the accuracy, completeness and correctness of the information on the website and is not responsible for any deficiencies and errors in this information.' },
            },
        },
        {
            key: 'section7',
            title: '7. Dış Bağlantılar',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: { title: '7. Dış Bağlantılar', description: 'Gizlilik politikalarımızda yer alan taahhütlerimiz sadece web sitemiz için geçerlidir. Federal Gaz web sitesinden link verilen web sitelerini veya ziyaret edilen diğer web sitelerini kapsamamakta olup bu sitelerden uğranabilecek maddi/manevi zarar ve kayıplardan firmamız sorumlu tutulamaz.' },
                EN: { title: '7. External Links', description: 'Our commitments in our privacy policies apply only to our website. It does not cover websites linked from Federal Gaz website or other websites visited, and our company cannot be held responsible for any material/moral damages and losses from these sites.' },
            },
        },
        {
            key: 'section8',
            title: '8. Değişiklik Hakkı',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: { title: '8. Değişiklik Hakkı', description: 'Federal Gaz, web sitesinde yer alan tüm bilgileri, ürün ve hizmetleri ile işbu gizlilik politikasını önceden bildirimde bulunmadan değiştirme hakkına sahiptir.' },
                EN: { title: '8. Right to Change', description: 'Federal Gaz reserves the right to change all information, products and services on the website and this privacy policy without prior notice.' },
            },
        },
        {
            key: 'section9',
            title: '9. Haklarınız',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: { title: '9. Haklarınız', description: '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki haklarınız için KVKK Aydınlatma Metnimizi inceleyebilirsiniz.' },
                EN: { title: '9. Your Rights', description: 'For your rights under the Personal Data Protection Law No. 6698 (KVKK), you can review our KVKK Disclosure Notice.' },
            },
        },
        {
            key: 'section10',
            title: '10. İletişim',
            fields: [
                { key: 'title', label: 'Bölüm Başlığı', type: 'text' },
                { key: 'description', label: 'Açıklama', type: 'text' },
            ],
            defaultContent: {
                TR: { title: '10. İletişim', description: 'Gizlilik politikamız hakkında sorularınız için:' },
                EN: { title: '10. Contact', description: 'For questions about our privacy policy:' },
            },
        },
        {
            key: 'acceptance',
            title: 'Kabul Metni',
            fields: [
                { key: 'text', label: 'Kabul Beyanı', type: 'textarea' },
            ],
            defaultContent: {
                TR: { text: 'Müşterilerimiz, Federal Gaz web sitesine girerek ve web sitesinde yer alan bilgileri kullanarak, yukarıda belirtilen koşulları kabul ettiğini taahhüt etmiş olur.' },
                EN: { text: 'By accessing and using this website, you agree to the terms of this Privacy Policy.' },
            },
        },
    ],
};

// ===== ÇEREZ POLİTİKASI =====
export const cookiePageConfig: PageConfig = {
    slug: '/cerez-politikasi',
    title: 'Çerez Politikası',
    titleEN: 'Cookie Policy',
    sections: [
        {
            key: 'header',
            title: 'Sayfa Başlığı',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'lastUpdate', label: 'Son Güncelleme Tarihi', type: 'text' },
            ],
            defaultContent: {
                TR: { title: 'Çerez Politikası', lastUpdate: 'Son Güncelleme: 15 Aralık 2024' },
                EN: { title: 'Cookie Policy', lastUpdate: 'Last Updated: December 15, 2024' },
            },
        },
        {
            key: 'intro',
            title: 'Giriş Bölümü',
            fields: [
                { key: 'text', label: 'Giriş Metni', type: 'textarea' },
                { key: 'whatAreCookies', label: 'Çerez Nedir? Başlık', type: 'text' },
                { key: 'whatAreCookiesDesc', label: 'Çerez Nedir? Açıklama', type: 'textarea' },
                { key: 'cookieTypes', label: 'Çerez Türleri Başlık', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    text: 'Federal Gaz olarak, web sitemizi ziyaret ettiğinizde deneyiminizi geliştirmek ve size daha iyi hizmet sunmak amacıyla çerezler kullanmaktayız. Bu politika, kullandığımız çerez türlerini ve bunları nasıl kontrol edebileceğinizi açıklamaktadır.',
                    whatAreCookies: 'Çerez Nedir?',
                    whatAreCookiesDesc: 'Çerezler, web sitelerinin tarayıcınıza gönderdiği ve cihazınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, siteye tekrar girdiğinizde sizi tanımamıza ve tercihlerinizi hatırlamamıza yardımcı olur.',
                    cookieTypes: 'Kullandığımız Çerez Türleri',
                },
                EN: {
                    text: 'At Federal Gaz, we use cookies when you visit our website to enhance your experience and provide better service. This policy explains the types of cookies we use and how you can control them.',
                    whatAreCookies: 'What Are Cookies?',
                    whatAreCookiesDesc: 'Cookies are small text files that websites send to your browser and store on your device. These files help us recognize you and remember your preferences when you return to the site.',
                    cookieTypes: 'Types of Cookies We Use',
                },
            },
        },
        {
            key: 'cookieTypes',
            title: 'Çerez Türleri (Kartlar)',
            fields: [
                { key: 'necessaryIcon', label: 'Zorunlu - İkon', type: 'text', placeholder: 'Material icon adı (ör: lock)' },
                { key: 'necessary', label: 'Zorunlu Çerezler - Başlık', type: 'text' },
                { key: 'necessaryDesc', label: 'Zorunlu Çerezler - Açıklama', type: 'textarea' },
                { key: 'analyticsIcon', label: 'Analitik - İkon', type: 'text', placeholder: 'Material icon adı (ör: analytics)' },
                { key: 'analytics', label: 'Analitik Çerezler - Başlık', type: 'text' },
                { key: 'analyticsDesc', label: 'Analitik Çerezler - Açıklama', type: 'textarea' },
                { key: 'marketingIcon', label: 'Pazarlama - İkon', type: 'text', placeholder: 'Material icon adı (ör: campaign)' },
                { key: 'marketing', label: 'Pazarlama Çerezleri - Başlık', type: 'text' },
                { key: 'marketingDesc', label: 'Pazarlama Çerezleri - Açıklama', type: 'textarea' },
                { key: 'functionalIcon', label: 'Fonksiyonel - İkon', type: 'text', placeholder: 'Material icon adı (ör: settings)' },
                { key: 'functional', label: 'Fonksiyonel Çerezler - Başlık', type: 'text' },
                { key: 'functionalDesc', label: 'Fonksiyonel Çerezler - Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    necessaryIcon: 'lock',
                    necessary: 'Zorunlu Çerezler',
                    necessaryDesc: 'Bu çerezler, web sitemizin temel işlevlerinin çalışması için gereklidir. Güvenlik, oturum yönetimi ve temel site işlevselliği için kullanılırlar. Bu çerezler kapatılamaz.',
                    analyticsIcon: 'analytics',
                    analytics: 'Analitik Çerezler',
                    analyticsDesc: 'Bu çerezler, ziyaretçilerin sitemizi nasıl kullandığını anlamamıza yardımcı olur. Google Analytics gibi hizmetler aracılığıyla sayfa görüntülemeleri, trafik kaynakları ve kullanıcı davranışları hakkında anonim veriler toplarlar.',
                    marketingIcon: 'campaign',
                    marketing: 'Pazarlama Çerezleri',
                    marketingDesc: 'Bu çerezler, size ilgi alanlarınıza uygun reklamlar göstermek için kullanılır. Üçüncü taraf reklam ağları tarafından ayarlanabilirler.',
                    functionalIcon: 'settings',
                    functional: 'Fonksiyonel Çerezler',
                    functionalDesc: 'Bu çerezler, dil tercihi, tema seçimi gibi gelişmiş özelliklerin ve kişiselleştirmelerin çalışmasını sağlar.',
                },
                EN: {
                    necessaryIcon: 'lock',
                    necessary: 'Necessary Cookies',
                    necessaryDesc: 'These cookies are essential for the basic functions of our website to work. They are used for security, session management, and basic site functionality. These cookies cannot be disabled.',
                    analyticsIcon: 'analytics',
                    analytics: 'Analytics Cookies',
                    analyticsDesc: 'These cookies help us understand how visitors use our site. Through services like Google Analytics, they collect anonymous data about page views, traffic sources, and user behavior.',
                    marketingIcon: 'campaign',
                    marketing: 'Marketing Cookies',
                    marketingDesc: 'These cookies are used to show you ads relevant to your interests. They may be set by third-party advertising networks.',
                    functionalIcon: 'settings',
                    functional: 'Functional Cookies',
                    functionalDesc: 'These cookies enable advanced features and personalization such as language preference and theme selection.',
                },
            },
        },
        {
            key: 'additional',
            title: 'Ek Bölümler',
            fields: [
                { key: 'yourRights', label: 'Haklarınız - Başlık', type: 'text' },
                { key: 'yourRightsDesc', label: 'Haklarınız - Açıklama', type: 'textarea' },
                { key: 'howToManage', label: 'Yönetim - Başlık', type: 'text' },
                { key: 'howToManageDesc', label: 'Yönetim - Açıklama', type: 'textarea' },
                { key: 'contact', label: 'İletişim - Başlık', type: 'text' },
                { key: 'contactDesc', label: 'İletişim - Açıklama', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    yourRights: 'Haklarınız',
                    yourRightsDesc: 'KVKK ve ilgili mevzuat kapsamında, çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Sitemizi ilk ziyaretinizde çıkan çerez banner\'ı üzerinden veya tarayıcı ayarlarınızdan çerezleri kontrol edebilirsiniz.',
                    howToManage: 'Çerezleri Nasıl Yönetebilirsiniz?',
                    howToManageDesc: 'Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda sitemizin bazı özellikleri düzgün çalışmayabilir.',
                    contact: 'İletişim',
                    contactDesc: 'Çerez politikamız hakkında sorularınız için federal.gaz@hotmail.com adresinden bize ulaşabilirsiniz.',
                },
                EN: {
                    yourRights: 'Your Rights',
                    yourRightsDesc: 'Under KVKK and related regulations, you can change your cookie preferences at any time. You can control cookies through the cookie banner that appears on your first visit or through your browser settings.',
                    howToManage: 'How to Manage Cookies?',
                    howToManageDesc: 'You can delete or block cookies from your browser settings. However, some features of our site may not work properly in this case.',
                    contact: 'Contact',
                    contactDesc: 'For questions about our cookie policy, you can reach us at federal.gaz@hotmail.com',
                },
            },
        },
    ],
};

// ===== GİRİŞ SAYFASI =====
export const loginPageConfig: PageConfig = {
    slug: '/giris',
    title: 'Üye Girişi',
    titleEN: 'Member Login',
    sections: [
        {
            key: 'header',
            title: 'Başlık',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'text' },
            ],
            defaultContent: {
                TR: { title: 'Üye Girişi', subtitle: 'Hesabınıza giriş yapın' },
                EN: { title: 'Member Login', subtitle: 'Login to your account' },
            },
        },
        {
            key: 'formFields',
            title: 'Form Alanları',
            fields: [
                {
                    key: 'fields',
                    label: 'Alanlar',
                    type: 'items',
                    itemFields: [
                        { key: 'key', label: 'Alan Anahtarı', type: 'text' },
                        { key: 'label', label: 'Etiket', type: 'text' },
                        { key: 'placeholder', label: 'Placeholder', type: 'text' },
                        { key: 'required', label: 'Zorunlu (true/false)', type: 'text' },
                        { key: 'visible', label: 'Görünür (true/false)', type: 'text' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    fields: [
                        { key: 'email', label: 'E-posta Adresi', placeholder: 'ornek@sirket.com', required: 'true', visible: 'true' },
                        { key: 'password', label: 'Şifre', placeholder: '••••••••', required: 'true', visible: 'true' },
                    ],
                },
                EN: {
                    fields: [
                        { key: 'email', label: 'Email Address', placeholder: 'example@company.com', required: 'true', visible: 'true' },
                        { key: 'password', label: 'Password', placeholder: '••••••••', required: 'true', visible: 'true' },
                    ],
                },
            },
        },
        {
            key: 'labels',
            title: 'Diğer Metinler',
            fields: [
                { key: 'rememberMe', label: 'Beni Hatırla', type: 'text' },
                { key: 'forgotPassword', label: 'Şifremi Unuttum Link', type: 'text' },
                { key: 'loginButton', label: 'Giriş Butonu', type: 'text' },
                { key: 'loggingIn', label: 'Giriş Yapılıyor...', type: 'text' },
                { key: 'noAccount', label: 'Hesabınız yok mu?', type: 'text' },
                { key: 'registerLink', label: 'Kayıt Ol Link', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    rememberMe: 'Beni Hatırla',
                    forgotPassword: 'Şifremi Unuttum',
                    loginButton: 'Giriş Yap',
                    loggingIn: 'Giriş yapılıyor...',
                    noAccount: 'Hesabınız yok mu?',
                    registerLink: 'Kayıt Ol',
                },
                EN: {
                    rememberMe: 'Remember Me',
                    forgotPassword: 'Forgot Password',
                    loginButton: 'Login',
                    loggingIn: 'Logging in...',
                    noAccount: "Don't have an account?",
                    registerLink: 'Register',
                },
            },
        },
    ],
};

// ===== KAYIT OL SAYFASI =====
export const registerPageConfig: PageConfig = {
    slug: '/kayit-ol',
    title: 'Kayıt Ol',
    titleEN: 'Register',
    sections: [
        {
            key: 'header',
            title: 'Başlık',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'text' },
            ],
            defaultContent: {
                TR: { title: 'Kayıt Ol', subtitle: 'Federal Gaz dünyasına katılın' },
                EN: { title: 'Register', subtitle: 'Join the Federal Gaz world' },
            },
        },
        {
            key: 'formFields',
            title: 'Form Alanları',
            fields: [
                {
                    key: 'fields',
                    label: 'Alanlar',
                    type: 'items',
                    itemFields: [
                        { key: 'key', label: 'Alan Anahtarı', type: 'text' },
                        { key: 'label', label: 'Etiket', type: 'text' },
                        { key: 'placeholder', label: 'Placeholder', type: 'text' },
                        { key: 'required', label: 'Zorunlu (true/false)', type: 'text' },
                        { key: 'visible', label: 'Görünür (true/false)', type: 'text' },
                        { key: 'type', label: 'Tip (text/email/tel/password)', type: 'text' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    fields: [
                        { key: 'name', label: 'Ad Soyad', placeholder: 'John Doe', required: 'true', visible: 'true', type: 'text' },
                        { key: 'email', label: 'E-posta Adresi', placeholder: 'ornek@sirket.com', required: 'true', visible: 'true', type: 'email' },
                        { key: 'phone', label: 'Telefon Numarası', placeholder: '+90 555 123 45 67', required: 'false', visible: 'true', type: 'tel' },
                        { key: 'password', label: 'Şifre', placeholder: '••••••••', required: 'true', visible: 'true', type: 'password' },
                        { key: 'confirmPassword', label: 'Şifre Tekrar', placeholder: '••••••••', required: 'true', visible: 'true', type: 'password' },
                    ],
                },
                EN: {
                    fields: [
                        { key: 'name', label: 'Full Name', placeholder: 'John Doe', required: 'true', visible: 'true', type: 'text' },
                        { key: 'email', label: 'Email Address', placeholder: 'example@company.com', required: 'true', visible: 'true', type: 'email' },
                        { key: 'phone', label: 'Phone Number', placeholder: '+90 555 123 45 67', required: 'false', visible: 'true', type: 'tel' },
                        { key: 'password', label: 'Password', placeholder: '••••••••', required: 'true', visible: 'true', type: 'password' },
                        { key: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', required: 'true', visible: 'true', type: 'password' },
                    ],
                },
            },
        },
        {
            key: 'labels',
            title: 'Diğer Metinler',
            fields: [
                { key: 'registerButton', label: 'Kayıt Ol Butonu', type: 'text' },
                { key: 'registering', label: 'Kaydediliyor...', type: 'text' },
                { key: 'passwordHint', label: 'Şifre İpucu', type: 'text' },
                { key: 'hasAccount', label: 'Zaten hesabınız var mı?', type: 'text' },
                { key: 'loginLink', label: 'Giriş Yap Link', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    registerButton: 'Kayıt Ol',
                    registering: 'Kaydediliyor...',
                    passwordHint: 'Şifre: En az 6 karakter, 1 büyük harf, 1 özel karakter',
                    hasAccount: 'Zaten hesabınız var mı?',
                    loginLink: 'Giriş Yap',
                },
                EN: {
                    registerButton: 'Register',
                    registering: 'Registering...',
                    passwordHint: 'Password: Min 6 chars, 1 uppercase, 1 special char',
                    hasAccount: 'Already have an account?',
                    loginLink: 'Login',
                },
            },
        },
    ],
};

// ===== PROFİL SAYFASI =====
export const profilePageConfig: PageConfig = {
    slug: '/profil',
    title: 'Profil',
    titleEN: 'Profile',
    sections: [
        {
            key: 'tabs',
            title: 'Tab İsimleri',
            fields: [
                { key: 'info', label: 'Kişisel Bilgiler Tab', type: 'text' },
                { key: 'addresses', label: 'Adresler Tab', type: 'text' },
                { key: 'orders', label: 'Siparişler Tab', type: 'text' },
            ],
            defaultContent: {
                TR: { info: 'Kişisel Bilgilerim', addresses: 'Adreslerim', orders: 'Siparişlerim' },
                EN: { info: 'My Personal Info', addresses: 'My Addresses', orders: 'My Orders' },
            },
        },
        {
            key: 'infoLabels',
            title: 'Kişisel Bilgi Etiketleri',
            fields: [
                { key: 'name', label: 'Ad Soyad Etiketi', type: 'text' },
                { key: 'email', label: 'E-posta Etiketi', type: 'text' },
                { key: 'phone', label: 'Telefon Etiketi', type: 'text' },
                { key: 'changeInfo', label: 'Bilgi Değiştirme Metni', type: 'textarea' },
            ],
            defaultContent: {
                TR: {
                    name: 'Ad Soyad',
                    email: 'E-posta',
                    phone: 'Telefon',
                    changeInfo: 'Bilgilerinizi değiştirmek için lütfen bizimle iletişime geçin.',
                },
                EN: {
                    name: 'Name',
                    email: 'Email',
                    phone: 'Phone',
                    changeInfo: 'Please contact us to change your information.',
                },
            },
        },
        {
            key: 'addressLabels',
            title: 'Adres Etiketleri',
            fields: [
                { key: 'addButton', label: 'Adres Ekle Butonu', type: 'text' },
                { key: 'titlePlaceholder', label: 'Adres Başlığı Placeholder', type: 'text' },
                { key: 'addressPlaceholder', label: 'Açık Adres Placeholder', type: 'text' },
                { key: 'deleteButton', label: 'Sil Butonu', type: 'text' },
                { key: 'defaultLabel', label: 'Varsayılan Etiketi', type: 'text' },
                { key: 'setDefault', label: 'Varsayılan Yap', type: 'text' },
                { key: 'editButton', label: 'Düzenle Butonu', type: 'text' },
                { key: 'saveButton', label: 'Kaydet Butonu', type: 'text' },
                { key: 'cancelButton', label: 'İptal Butonu', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    addButton: 'Adres Ekle',
                    titlePlaceholder: 'Adres Başlığı (Ev, İş vb.)',
                    addressPlaceholder: 'Açık Adres',
                    deleteButton: 'Sil',
                    defaultLabel: 'Varsayılan',
                    setDefault: '✓ Varsayılan Yap',
                    editButton: 'Düzenle',
                    saveButton: 'Kaydet',
                    cancelButton: 'İptal',
                },
                EN: {
                    addButton: 'Add Address',
                    titlePlaceholder: 'Address Title',
                    addressPlaceholder: 'Full Address',
                    deleteButton: 'Delete',
                    defaultLabel: 'Default',
                    setDefault: '✓ Set as Default',
                    editButton: 'Edit',
                    saveButton: 'Save',
                    cancelButton: 'Cancel',
                },
            },
        },
        {
            key: 'buttons',
            title: 'Butonlar',
            fields: [
                { key: 'logout', label: 'Çıkış Yap Butonu', type: 'text' },
            ],
            defaultContent: {
                TR: { logout: 'Çıkış Yap' },
                EN: { logout: 'Logout' },
            },
        },
    ],
};

// ===== ŞİFRE SIFIRLAMA SAYFASI =====
export const passwordResetPageConfig: PageConfig = {
    slug: '/sifremi-unuttum',
    title: 'Şifremi Unuttum',
    titleEN: 'Forgot Password',
    sections: [
        {
            key: 'header',
            title: 'Başlık',
            fields: [
                { key: 'title', label: 'Başlık', type: 'text' },
                { key: 'subtitle', label: 'Alt Başlık', type: 'textarea' },
            ],
            defaultContent: {
                TR: { title: 'Şifremi Unuttum', subtitle: 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.' },
                EN: { title: 'Forgot Password', subtitle: "Enter your email address and we'll send you a password reset link." },
            },
        },
        {
            key: 'formFields',
            title: 'Form Alanları',
            fields: [
                {
                    key: 'fields',
                    label: 'Alanlar',
                    type: 'items',
                    itemFields: [
                        { key: 'key', label: 'Alan Anahtarı', type: 'text' },
                        { key: 'label', label: 'Etiket', type: 'text' },
                        { key: 'placeholder', label: 'Placeholder', type: 'text' },
                    ],
                },
            ],
            defaultContent: {
                TR: {
                    fields: [
                        { key: 'email', label: 'E-posta Adresi', placeholder: 'ornek@sirket.com' },
                    ],
                },
                EN: {
                    fields: [
                        { key: 'email', label: 'Email Address', placeholder: 'example@company.com' },
                    ],
                },
            },
        },
        {
            key: 'labels',
            title: 'Diğer Metinler',
            fields: [
                { key: 'submitButton', label: 'Gönder Butonu', type: 'text' },
                { key: 'sending', label: 'Gönderiliyor...', type: 'text' },
                { key: 'successMessage', label: 'Başarı Mesajı', type: 'textarea' },
                { key: 'backToLogin', label: 'Giriş Sayfasına Dön', type: 'text' },
                { key: 'rememberPassword', label: 'Şifrenizi hatırladınız mı?', type: 'text' },
            ],
            defaultContent: {
                TR: {
                    submitButton: 'Şifre Sıfırlama Bağlantısı Gönder',
                    sending: 'Gönderiliyor...',
                    successMessage: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.',
                    backToLogin: 'Giriş Sayfasına Dön',
                    rememberPassword: 'Şifrenizi hatırladınız mı?',
                },
                EN: {
                    submitButton: 'Send Password Reset Link',
                    sending: 'Sending...',
                    successMessage: 'Password reset link has been sent to your email address. Please check your inbox.',
                    backToLogin: 'Back to Login',
                    rememberPassword: 'Remember your password?',
                },
            },
        },
    ],
};

// All page configs
export const allPageConfigs: PageConfig[] = [
    homePageConfig,
    aboutPageConfig,
    contactPageConfig,
    servicesPageConfig,
    medicalGasesPageConfig,
    weldingGasesPageConfig,
    specialMixturesPageConfig,
    foodGasesPageConfig,
    galleryPageConfig,
    kvkkPageConfig,
    privacyPageConfig,
    cookiePageConfig,
    loginPageConfig,
    registerPageConfig,
    profilePageConfig,
    passwordResetPageConfig,
];

// Helper to get page config by slug
export function getPageConfig(slug: string): PageConfig | undefined {
    return allPageConfigs.find(p => p.slug === slug);
}

// Helper to get section default content
export function getSectionDefault(pageSlug: string, sectionKey: string, language: 'TR' | 'EN'): SectionContent | undefined {
    const page = getPageConfig(pageSlug);
    if (!page) return undefined;

    const section = page.sections.find(s => s.key === sectionKey);
    if (!section) return undefined;

    return section.defaultContent[language];
}

