"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

// Product Data Schema
interface ProductContent {
    title: string;
    description: string;
    longDescription: string;
    image: string;
    features: string[];
    specs: { label: string; value: string }[];
    listIcon?: string;
    ctaIcon?: string;
}

// Default Data (Matches Live Site EXACTLY)
// Used as fallback if DB is empty or fails
const defaultProductData: Record<string, { TR: ProductContent; EN: ProductContent }> = {
    "medikal-gazlar": {
        TR: {
            title: "Medikal Gazlar",
            description: "Hastaneler ve evde bakım için hayati öneme sahip yüksek saflıkta medikal gazlar.",
            longDescription: "Federal Gaz olarak, insan sağlığının önemini biliyor ve medikal gaz üretiminde en yüksek kalite standartlarını (Avrupa Farmakopesi) titizlikle uyguluyoruz. Hastaneler, klinikler ve evde bakım hastaları için kesintisiz ve güvenilir medikal oksijen, azot protoksit ve medikal hava tedariği sağlıyoruz. Üretimden doluma ve dağıtıma kadar tüm süreçlerimiz Sağlık Bakanlığı mevzuatlarına tam uyumludur.",
            image: "/products/medikal-gazlar-custom.jpg",
            features: [
                "%99.5+ Saflıkta Medikal Oksijen",
                "7/24 Acil Durum Tedariği",
                "Evde Bakım Oksijen Tüpleri",
                "Alüminyum ve Çelik Tüp Seçenekleri"
            ],
            specs: [
                { label: "Saflık", value: "≥ %99.5" },
                { label: "Standartlar", value: "TS EN ISO 13485" },
                { label: "Ambalaj", value: "2L, 5L, 10L, 40L Tüpler" }
            ]
        },
        EN: {
            title: "Medical Gases",
            description: "Vital high-purity medical gases for hospitals and home care.",
            longDescription: "At Federal Gaz, we understand the critical importance of human health and strictly adhere to the highest quality standards (European Pharmacopoeia) in medical gas production. We provide uninterrupted and reliable supply of medical oxygen, nitrous oxide, and medical air for hospitals, clinics, and home care patients. All our processes from production to filling and distribution are fully compliant with Health Ministry regulations.",
            image: "/products/medikal-gazlar-custom.jpg",
            features: [
                "99.5%+ Purity Medical Oxygen",
                "24/7 Emergency Supply",
                "Home Care Oxygen Cylinders",
                "Aluminum and Steel Cylinder Options"
            ],
            specs: [
                { label: "Purity", value: "≥ 99.5%" },
                { label: "Standards", value: "TS EN ISO 13485" },
                { label: "Packaging", value: "2L, 5L, 10L, 40L Cylinders" }
            ]
        }
    },
    "endustriyel-gazlar": {
        TR: {
            title: "Endüstriyel Gazlar",
            description: "Endüstriyel üretimlerin temel taşı olan yüksek kaliteli sanayi gazları.",
            longDescription: "Metalürjiden kimyaya, otomotivden inşaata kadar pek çok sektörün ihtiyaç duyduğu Oksijen, Azot, Argon ve Karbondioksit gazlarını sağlıyoruz. Üretim süreçlerinizde verimliliği artırmak ve maliyetleri düşürmek için özel gaz tedarik çözümleri (tüp, manifold, dökme sıvı) geliştiriyoruz.",
            image: "/products/endustriyel-gazlar-custom.jpg",
            features: [
                "Yüksek Saflıkta Sanayi Gazları",
                "Argon, Azot, Oksijen, CO2",
                "Kesintisiz ve Güvenilir Tedarik",
                "Çeşitli Tüp Boyutları (10L, 50L)"
            ],
            specs: [
                { label: "Uygulama Alanları", value: "Kesim, Yakma, İnerte Etme" },
                { label: "Tedarik Şekli", value: "Tüp & Sıvı" },
                { label: "Basınç", value: "150 - 230 Bar" }
            ]
        },
        EN: {
            title: "Industrial Gases",
            description: "High quality industrial gases - the cornerstone of industrial production.",
            longDescription: "We provide Oxygen, Nitrogen, Argon, and Carbon Dioxide gases needed by many sectors from metallurgy to chemistry, automotive to construction. We develop custom gas supply solutions to increase efficiency and reduce costs in your production processes.",
            image: "/products/endustriyel-gazlar-custom.jpg",
            features: [
                "High Purity Industrial Gases",
                "Argon, Nitrogen, Oxygen, CO2",
                "Continuous and Reliable Supply",
                "Various Cylinder Sizes (10L, 50L)"
            ],
            specs: [
                { label: "Applications", value: "Cutting, Combustion, Inerting" },
                { label: "Supply", value: "Cylinder & Liquid" },
                { label: "Pressure", value: "150 - 230 Bar" }
            ]
        }
    },
    "kaynak-gazlari": {
        TR: {
            title: "Kaynak Gazları",
            description: "Mükemmel kaynak kalitesi için formüle edilmiş özel karışım gazları.",
            longDescription: "MIG/MAG ve TIG kaynağı uygulamalarında sıçrantıyı azaltan, nüfuziyeti artıran ve mükemmel dikiş profili sağlayan koruyucu gaz karışımlarımız ile üretim kalitenizi yükseltiyoruz. Asetilen ve Argon karışımlarımız, en zorlu metal birleştirme işlemlerinde bile üstün performans sağlar.",
            image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80",
            features: ["Düşük Sıçrantı", "Yüksek Hız", "Derin Nüfuziyet", "Geniş Ürün Yelpazesi"],
            specs: [{ label: "Gazlar", value: "Argon/CO2, Argon/O2" }, { label: "Tür", value: "Koruyucu Gazlar" }]
        },
        EN: {
            title: "Welding Gases",
            description: "Special mixture gases formulated for perfect welding quality.",
            longDescription: "We elevate your production quality with our shielding gas mixtures that reduce spatter, increase penetration, and ensure perfect bead profile in MIG/MAG and TIG welding applications.",
            image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80",
            features: ["Low Spatter", "High Speed", "Deep Penetration", "Wide Range"],
            specs: [{ label: "Gases", value: "Argon/CO2, Argon/O2" }, { label: "Type", value: "Shielding Gases" }]
        }
    },
    "gida-gazlari": {
        TR: { title: "Gıda Gazları", description: "Tazeliği koruyan MAP ve dondurma gazları.", longDescription: "Gıda sınıfı CO2, Azot ve özel karışım gazlarımız ile gıdaların raf ömrünü uzatıyor (MAP), tazeliklerini koruyor ve güvenli bir şekilde dondurulmasını sağlıyoruz.", image: "/products/gida-gazlari-custom.jpg", features: ["Gıda Güvenliği Sertifikalı", "Raf Ömrü Uzatma (MAP)", "Hızlı Dondurma"], specs: [{ label: "Standart", value: "ISO 22000" }, { label: "Gazlar", value: "CO2, N2, O2" }] },
        EN: { title: "Food Gases", description: "MAP and freezing gases preserving freshness.", longDescription: "We extend shelf life (MAP), preserve freshness, and ensure safe freezing of foods with our food-grade CO2, Nitrogen, and special mixture gases.", image: "/products/gida-gazlari-custom.jpg", features: ["Food Safety Certified", "Shelf Life Extension (MAP)", "Quick Freezing"], specs: [{ label: "Standard", value: "ISO 22000" }, { label: "Gases", value: "CO2, N2, O2" }] }
    },
    "ozel-gazlar": {
        TR: { title: "Özel Gazlar", description: "Laboratuvar ve analiz cihazları için ultra yüksek saflıkta gazlar.", longDescription: "Hassas analiz cihazları, kalibrasyon işlemleri ve araştırma laboratuvarları için ppm ve ppb seviyesinde hassasiyetle üretilen özel gaz karışımları ve ultra yüksek saflıkta (5.0, 6.0) gazlar.", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80", features: ["Sertifikalı Karışımlar", "Yüksek Saflık (6.0'a kadar)", "Özel Regülatörler"], specs: [{ label: "Saflık", value: "99.999%+" }, { label: "Kullanım", value: "Kalibrasyon, Analiz" }] },
        EN: { title: "Special Gases", description: "Ultra-high purity gases for laboratories and analyzers.", longDescription: "Special gas mixtures and ultra-high purity (5.0, 6.0) gases produced with ppm and ppb level precision for sensitive analysis devices, calibration processes, and research laboratories.", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80", features: ["Certified Mixtures", "High Purity (up to 6.0)", "Special Regulators"], specs: [{ label: "Purity", value: "99.999%+" }, { label: "Use", value: "Calibration, Analysis" }] }
    },
    "kriyojenik-sivilar": {
        TR: { title: "Kriyojenik Sıvılar", description: "Endüstriyel soğutma ve dondurma için sıvı fazda gazlar.", longDescription: "-196°C'ye varan soğuklukta Sıvı Azot, Sıvı Oksijen ve Sıvı Argon tedariğimiz ile biyolojik örnek saklama, metal büzdürme, gıda dondurma gibi kriyojenik uygulamalarınız için çözüm ortağınızız.", image: "/products/kriyojenik-sivilar-custom.jpg", features: ["-196°C Sıvı Azot", "Dewar ve Tank Dolumu", "Yüksek Soğutma Kapasitesi"], specs: [{ label: "Form", value: "Sıvı Faz" }, { label: "Sıcaklık", value: "-196°C (LN2)" }] },
        EN: { title: "Cryogenic Liquids", description: "Liquid phase gases for industrial cooling and freezing.", longDescription: "We are your solution partner for cryogenic applications such as biological sample storage, metal shrinking, and food freezing with our commercial Liquid Nitrogen, Liquid Oxygen, and Liquid Argon supply down to -196°C.", image: "/products/kriyojenik-sivilar-custom.jpg", features: ["-196°C Liquid Nitrogen", "Dewar and Tank Filling", "High Cooling Capacity"], specs: [{ label: "Form", value: "Liquid Phase" }, { label: "Temperature", value: "-196°C (LN2)" }] }
    }
};

// Slug mapping
const slugMapping: Record<string, string> = {
    'medical-gases': 'medikal-gazlar',
    'industrial-gases': 'endustriyel-gazlar',
    'welding-gases': 'kaynak-gazlari',
    'food-gases': 'gida-gazlari',
    'special-gases': 'ozel-gazlar',
    'cryogenic-liquids': 'kriyojenik-sivilar',
    'medikal-gazlar': 'medikal-gazlar',
    'endustriyel-gazlar': 'endustriyel-gazlar',
    'kaynak-gazlari': 'kaynak-gazlari',
    'gida-gazlari': 'gida-gazlari',
    'ozel-gazlar': 'ozel-gazlar',
    'kriyojenik-sivilar': 'kriyojenik-sivilar',
};

export default function ProductDetailPage() {
    const { language } = useLanguage();
    const params = useParams();
    const slug = params.slug as string;
    const searchSlug = slugMapping[slug] || slug;

    // Use default data initially (server-like rendering)
    const [content, setContent] = useState<ProductContent | null>(() => {
        const defaultData = defaultProductData[searchSlug];
        return defaultData ? defaultData[language] : null;
    });

    // Try to fetch updated data from DB
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${searchSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.product && data.product.isActive) {
                        const p = data.product;
                        setContent({
                            title: language === 'TR' ? p.titleTR : p.titleEN,
                            description: language === 'TR' ? p.descTR : p.descEN,
                            longDescription: language === 'TR' ? p.contentTR : p.contentEN,
                            image: p.heroImage || p.image, // Prefer hero image if available
                            features: (language === 'TR' ? p.featuresTR : p.featuresEN)?.split('\n').filter((f: string) => f.trim()) || [],
                            listIcon: p.listIcon || 'check',
                            ctaIcon: p.ctaIcon || 'contact_support',
                            specs: (() => {
                                try {
                                    const specsStr = language === 'TR' ? p.specsTR : p.specsEN;
                                    return specsStr ? JSON.parse(specsStr) : [];
                                } catch {
                                    return [];
                                }
                            })()
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product, using static fallback", error);
            }
        };
        fetchProduct();
    }, [searchSlug, language]);

    if (!content) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-secondary">404</h1>
                    <p className="mt-2 text-lg text-secondary">Ürün bulunamadı / Product not found</p>
                    <Link href="/urunler" className="mt-4 inline-block text-primary hover:underline">
                        ← {language === 'TR' ? 'Ürünlere Dön' : 'Back to Products'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Hero Section - Matching Live Site Structure Exactly */}
            <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-secondary/50" /> {/* Dark overlay */}
                <img
                    src={content.image}
                    alt={content.title}
                    className="absolute inset-0 -z-10 h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl font-black text-white md:text-6xl drop-shadow-lg">{content.title}</h1>
                        <p className="mt-4 text-xl font-medium text-white/90 drop-shadow-md md:text-2xl">{content.description}</p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid gap-12 lg:grid-cols-3">
                        {/* Left Column: Description & Features */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-[#1a1a1a]">
                                <h2 className="mb-6 text-2xl font-bold text-secondary dark:text-white">
                                    {language === 'TR' ? 'Ürün Detayları' : 'Product Details'}
                                </h2>
                                <p className="text-lg leading-relaxed text-secondary/80 dark:text-white/80">
                                    {content.longDescription}
                                </p>

                                {content.features.length > 0 && (
                                    <>
                                        <h3 className="mt-8 mb-4 text-xl font-bold text-secondary dark:text-white">
                                            {language === 'TR' ? 'Öne Çıkan Özellikler' : 'Key Features'}
                                        </h3>
                                        <ul className="grid gap-4 sm:grid-cols-2">
                                            {content.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-3">
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                        <span className="material-symbols-outlined text-sm">{content.listIcon || 'check'}</span>
                                                    </span>
                                                    <span className="text-secondary/80 dark:text-white/80">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Specs Card & CTA */}
                        <div className="space-y-8">
                            {/* Specs Box - Dark Background (matches live) */}
                            {content.specs && content.specs.length > 0 && (
                                <div className="rounded-2xl bg-secondary p-8 text-white shadow-lg">
                                    <h3 className="mb-6 text-xl font-bold">
                                        {language === 'TR' ? 'Teknik Özellikler' : 'Technical Specifications'}
                                    </h3>
                                    <div className="space-y-4">
                                        {content.specs.map((spec, idx) => (
                                            <div key={idx} className="flex justify-between border-b border-white/20 pb-3 last:border-0 last:pb-0">
                                                <span className="text-white/70">{spec.label}</span>
                                                <span className="font-semibold">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Offer Box - White Background */}
                            <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-secondary/10 dark:bg-[#1a1a1a] dark:border-white/10">
                                <span className="material-symbols-outlined mb-4 text-4xl text-primary">{content.ctaIcon || 'contact_support'}</span>
                                <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">
                                    {language === 'TR' ? 'Teklif Alın' : 'Get a Quote'}
                                </h3>
                                <p className="mb-6 text-sm text-secondary/70 dark:text-white/60">
                                    {language === 'TR'
                                        ? 'Projeniz için özel fiyat teklifi almak ister misiniz?'
                                        : 'Would you like to get a custom quote for your project?'}
                                </p>
                                <Link
                                    href="/iletisim"
                                    className="inline-block w-full rounded-lg bg-primary py-3 font-bold text-white transition-transform hover:scale-105"
                                >
                                    {language === 'TR' ? 'Bize Ulaşın' : 'Contact Us'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
