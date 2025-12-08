"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        heroTitle: "Üretiminize Güç Katan Endüstriyel Gaz Çözümleri",
        heroDesc: "Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.",
        orderBtn: "Sipariş Ver",
        announcement: "Önemli Duyuru: Federal Gaz sipariş ve destek talepleriniz için 7/24 iletişim e-posta adresimiz federal.gaz@hotmail.com",
        aboutTitle: "Federal Gaz Hakkında",
        aboutDesc: "Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamak, vizyonumuz ise sektörde lider bir marka olmaktır.",
        moreInfo: "Daha Fazla Bilgi →",
        bestSellers: "Ürün Yelpazemiz",
        featuredServices: "Öne Çıkan Hizmetlerimiz",
        servicesDesc: "Geniş hizmet yelpazemizle endüstrinizin tüm gaz ihtiyaçlarına profesyonel çözümler sunuyoruz.",
        allServices: "Tüm Hizmetleri Gör",
    },
    EN: {
        heroTitle: "Industrial Gas Solutions Powering Your Production",
        heroDesc: "We provide innovative, sustainable, and high-quality services for your industrial gas needs.",
        orderBtn: "Order Now",
        announcement: "Important Announcement: Our 24/7 contact email for your order and support requests is federal.gaz@hotmail.com",
        aboutTitle: "About Federal Gaz",
        aboutDesc: "With years of experience in the industrial gas sector, Federal Gaz provides reliable and high-quality solutions to its customers. Our mission is to provide sustainable and efficient energy sources using innovative technologies, and our vision is to be a leading brand in the sector.",
        moreInfo: "More Info →",
        bestSellers: "Our Products",
        featuredServices: "Featured Services",
        servicesDesc: "We offer professional solutions for all your industrial gas needs with our wide range of services.",
        allServices: "View All Services",
    }
};

// Ürün listesi - Profesyonel gaz tüpü görselleri
const products = [
    { title: "Medikal Oksijen", image: "/products/medikal-oksijen.png" },
    { title: "Endüstriyel Oksijen", image: "/products/endustriyel-oksijen.png" },
    { title: "Azot (N₂)", image: "/products/azot.png" },
    { title: "Argon (Ar)", image: "/products/argon.png" },
    { title: "Karbondioksit (CO₂)", image: "/products/karbondioksit.png" },
    { title: "Asetilen", image: "/products/asetilen.png" },
    { title: "Propan", image: "/products/propan.png" },
    { title: "Helyum (He)", image: "/products/helyum.png" },
];

// Hizmetler
const services = {
    TR: [
        {
            title: "Medikal Gazlar",
            desc: "Hastaneler ve sağlık kuruluşları için yüksek saflıkta medikal oksijen, azot protoksit ve özel gaz karışımları.",
            image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=300&fit=crop",
            link: "/hizmetler/medikal-gazlar"
        },
        {
            title: "Kaynak Gazları",
            desc: "Metal işleme ve kaynak uygulamaları için asetilen, argon ve özel karışım gazlar.",
            image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop",
            link: "/hizmetler/kaynak-gazlari"
        },
        {
            title: "Gıda Gazları",
            desc: "Yiyecek ve içecek sektörü için CO₂, azot ve MAP gazları ile güvenli çözümler.",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop",
            link: "/hizmetler/gida-gazlari"
        }
    ],
    EN: [
        {
            title: "Medical Gases",
            desc: "High-purity medical oxygen, nitrous oxide and special gas mixtures for hospitals and healthcare facilities.",
            image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=300&fit=crop",
            link: "/hizmetler/medikal-gazlar"
        },
        {
            title: "Welding Gases",
            desc: "Acetylene, argon and special mixture gases for metal processing and welding applications.",
            image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=300&fit=crop",
            link: "/hizmetler/kaynak-gazlari"
        },
        {
            title: "Food Gases",
            desc: "Safe solutions with CO₂, nitrogen and MAP gases for the food and beverage sector.",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop",
            link: "/hizmetler/gida-gazlari"
        }
    ]
};

export default function HomePage() {
    const { language } = useLanguage();
    const [currentSlide, setCurrentSlide] = useState(0);
    const t = translations[language];
    const currentServices = services[language];

    // Hero görselleri - Endüstriyel gaz ve tüp görselleri (5 adet)
    const heroImages = [
        "/hero/industrial-cylinders-1.png", // Çoklu tüp depolama (YENİ)
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&h=1080&fit=crop", // Sanayi Kaynak İşçisi (Worker Welding)
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=1920&h=1080&fit=crop", // Gaz tüpleri
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop", // Gaz tüpleri
        "/hero/industrial-cylinders-2.png", // Çoklu tüp depolama (YENİ)
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    };

    return (
        <>
            {/* Announcement Ticker */}
            <div className="overflow-hidden bg-accent py-2">
                <div className="animate-marquee whitespace-nowrap">
                    <span className="mx-4 text-sm font-bold text-secondary">{t.announcement}</span>
                    <span className="mx-4 text-sm font-bold text-secondary">{t.announcement}</span>
                    <span className="mx-4 text-sm font-bold text-secondary">{t.announcement}</span>
                    <span className="mx-4 text-sm font-bold text-secondary">{t.announcement}</span>
                </div>
            </div>

            {/* Hero Section with Slider */}
            <section className="relative">
                <div className="relative min-h-[560px] overflow-hidden">
                    {heroImages.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                backgroundImage: `linear-gradient(rgba(41, 40, 40, 0.4) 0%, rgba(41, 40, 40, 0.6) 100%), url("${image}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    ))}

                    <div className="relative z-10 flex min-h-[560px] flex-col items-center justify-center gap-6 p-4 text-center">
                        <div className="flex max-w-3xl flex-col gap-4">
                            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-white md:text-6xl">{t.heroTitle}</h1>
                            <h2 className="text-base font-normal leading-normal text-white md:text-lg">{t.heroDesc}</h2>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-4">
                            <Link href="/siparis" className="flex h-12 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base font-bold leading-normal tracking-[0.015em] text-white transition-transform hover:scale-105 hover:bg-primary/90">
                                <span className="truncate">{t.orderBtn}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Slider Controls - Mobile: Bottom aligned, Desktop: Center aligned */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 bottom-20 md:top-1/2 md:bottom-auto z-20 -translate-y-1/2 rounded-full bg-white/30 p-2 md:p-3 text-white backdrop-blur-sm transition-all hover:bg-white/50"
                    >
                        <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 bottom-20 md:top-1/2 md:bottom-auto z-20 -translate-y-1/2 rounded-full bg-white/30 p-2 md:p-3 text-white backdrop-blur-sm transition-all hover:bg-white/50"
                    >
                        <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Slider Indicators */}
                    <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-2 w-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-secondary dark:text-white sm:text-4xl">{t.aboutTitle}</h2>
                        <p className="mt-6 text-lg font-normal leading-relaxed text-secondary/80 dark:text-white/70">{t.aboutDesc}</p>
                        <div className="mt-8">
                            <Link href="/hakkimizda" className="font-bold text-primary hover:underline">{t.moreInfo}</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ürün Yelpazemiz - Slider */}
            <section className="py-16 dark:bg-background-dark" style={{ backgroundColor: '#ece6e4' }}>
                <div className="mx-auto max-w-7xl px-4">
                    <h2 className="mb-8 text-center text-3xl font-bold text-secondary dark:text-white">{t.bestSellers}</h2>
                    <div className="relative overflow-hidden">
                        <div className="flex animate-slide-infinite gap-8">
                            {[...products, ...products].map((product, index) => (
                                <div key={index} className="w-64 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                                    <div className="h-64 w-full bg-white flex items-center justify-center">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div className="py-1 text-center bg-[#b13329]">
                                        <span className="text-sm font-bold text-white">{product.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="bg-secondary/5 py-16 dark:bg-white/5 sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <h2 className="text-3xl font-bold leading-tight tracking-[-0.015em] text-secondary dark:text-white sm:text-4xl">{t.featuredServices}</h2>
                        <p className="mt-4 text-lg font-normal leading-relaxed text-secondary/80 dark:text-white/70">{t.servicesDesc}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {currentServices.map((service, index) => (
                            <Link key={index} href={service.link} className="flex flex-col overflow-hidden rounded-xl bg-background-light shadow-md transition-transform hover:scale-105 dark:bg-background-dark">
                                <img src={service.image} alt={service.title} className="h-48 w-full object-cover" />
                                <div className="p-6 text-center">
                                    <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">{service.title}</h3>
                                    <p className="text-secondary/70 dark:text-white/60">{service.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-8 text-center">
                        <Link href="/hizmetler" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90">
                            <span>{t.allServices}</span>
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
