"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const translations = {
    TR: {
        home: "Ana Sayfa",
        about: "Hakkımızda",
        services: "Hizmetlerimiz",
        products: "Ürünler",
        contact: "İletişim",
        login: "Üye Girişi",
        heroTitle: "Güvenilir Enerji Çözümleri",
        heroDesc: "Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.",
        orderBtn: "Sipariş Ver",
        announcement: "Önemli duyuru: Yeni tesisimiz hizmete açılmıştır.",
        aboutTitle: "Federal Gaz Hakkında",
        aboutDesc: "Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamak, vizyonumuz ise sektörde lider bir marka olmaktır.",
        moreInfo: "Daha Fazla Bilgi →",
        bestSellers: "En Çok Satan Ürünler",
        featuredServices: "Öne Çıkan Hizmetlerimiz",
        servicesDesc: "Geniş hizmet yelpazemizle endüstrinizin tüm gaz ihtiyaçlarına profesyonel çözümler sunuyoruz.",
        service1: "Medikal Gazlar",
        service1Desc: "Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki ve sistemleri.",
        service2: "Endüstriyel Gaz Dolumu",
        service2Desc: "Oksijen, azot, argon ve diğer endüstriyel gazların güvenli ve hızlı dolum hizmetleri.",
        service3: "Kriyojenik Tank Hizmetleri",
        service3Desc: "Kriyojenik tankların kurulumu, bakımı ve periyodik kontrolleri için uzman teknik destek.",
        allServices: "Tüm Hizmetleri Gör",
        footerSlogan: "Endüstriyel gaz çözümlerinde güvenilir ortağınız.",
        footerContact: "İletişim",
        footerQuickLinks: "Hızlı Erişim",
        footerSocial: "Sosyal Medya",
        rights: "© 2024 Federal Gaz. Tüm hakları saklıdır."
    },
    EN: {
        home: "Home",
        about: "About Us",
        services: "Services",
        products: "Products",
        contact: "Contact",
        login: "Login",
        heroTitle: "Reliable Energy Solutions",
        heroDesc: "We provide innovative, sustainable, and high-quality services for your industrial gas needs.",
        orderBtn: "Order Now",
        announcement: "Important announcement: Our new facility is now open.",
        aboutTitle: "About Federal Gaz",
        aboutDesc: "With years of experience in the industrial gas sector, Federal Gaz provides reliable and high-quality solutions to its customers. Our mission is to provide sustainable and efficient energy sources using innovative technologies, and our vision is to be a leading brand in the sector.",
        moreInfo: "More Info →",
        bestSellers: "Best Selling Products",
        featuredServices: "Featured Services",
        servicesDesc: "We offer professional solutions for all your industrial gas needs with our wide range of services.",
        service1: "Medical Gases",
        service1Desc: "High-purity medical gas supply and systems for the sensitive needs of the healthcare sector.",
        service2: "Industrial Gas Filling",
        service2Desc: "Safe and fast filling services for oxygen, nitrogen, argon, and other industrial gases.",
        service3: "Cryogenic Tank Services",
        service3Desc: "Expert technical support for the installation, maintenance, and periodic control of cryogenic tanks.",
        allServices: "View All Services",
        footerSlogan: "Your reliable partner in industrial gas solutions.",
        footerContact: "Contact",
        footerQuickLinks: "Quick Links",
        footerSocial: "Social Media",
        rights: "© 2024 Federal Gaz. All rights reserved."
    }
};

export default function HomePage() {
    const [language, setLanguage] = useState<"TR" | "EN">("TR");
    const [currentSlide, setCurrentSlide] = useState(0);
    const t = translations[language];

    const heroImages = [
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=1080&fit=crop",
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1920&h=1080&fit=crop",
        "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1920&h=1080&fit=crop",
    ];

    const toggleLanguage = () => {
        setLanguage(language === "TR" ? "EN" : "TR");
    };

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
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="layout-container flex h-full grow flex-col">
                {/* TopNavBar */}
                <header className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-sm dark:bg-background-dark/80">
                    <div className="flex justify-center px-4 lg:px-10">
                        <div className="flex w-full max-w-7xl items-center justify-between whitespace-nowrap border-b border-solid border-secondary/10 py-3 dark:border-white/10">
                            <Link href="/" className="flex items-center gap-4 text-secondary dark:text-white">
                                <img src="/logo.jpg" alt="Federal Gaz Logo" className="h-24 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
                            </Link>
                            <nav className="hidden flex-1 items-center justify-center gap-4 lg:flex">
                                <Link href="/" className="rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md">{t.home}</Link>
                                <Link href="/hakkimizda" className="rounded-lg border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white dark:bg-background-dark dark:text-white">{t.about}</Link>
                                <Link href="/hizmetler" className="rounded-lg border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white dark:bg-background-dark dark:text-white">{t.services}</Link>
                                <Link href="/urunler" className="rounded-lg border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white dark:bg-background-dark dark:text-white">{t.products}</Link>
                                <Link href="/iletisim" className="rounded-lg border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-all hover:border-primary hover:bg-primary hover:text-white dark:bg-background-dark dark:text-white">{t.contact}</Link>
                            </nav>
                            <div className="flex items-center gap-3">
                                <Link href="/giris" className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 font-bold text-secondary transition-transform hover:scale-105">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{t.login}</span>
                                </Link>
                                <button onClick={toggleLanguage} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg px-4">
                                    <span className={`text-base font-bold transition-colors ${language === 'TR' ? 'text-primary' : 'text-secondary/50'}`}>TR</span>
                                    <span className="text-secondary">/</span>
                                    <span className={`text-base font-bold transition-colors ${language === 'EN' ? 'text-primary' : 'text-secondary/50'}`}>EN</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1">
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

                            {/* Slider Controls */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/50"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/30 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/50"
                            >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                    {/* En Çok Satan Ürünler Slider */}
                    <section className="py-16 dark:bg-background-dark" style={{ backgroundColor: '#ece6e4' }}>
                        <div className="mx-auto max-w-7xl px-4">
                            <h2 className="mb-8 text-center text-3xl font-bold text-secondary dark:text-white">{t.bestSellers}</h2>
                            <div className="relative overflow-hidden rounded-xl">
                                <div className="flex gap-4">
                                    <div className="flex min-w-full animate-slide-infinite gap-4">
                                        <img src="https://picsum.photos/seed/gas1/300/300" alt="Sanayi Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas2/300/300" alt="Oksijen Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas3/300/300" alt="Argon Gazı" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas4/300/300" alt="Azot Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas5/300/300" alt="Karbondioksit Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                    </div>
                                    <div className="flex min-w-full animate-slide-infinite gap-4" aria-hidden="true">
                                        <img src="https://picsum.photos/seed/gas1/300/300" alt="Sanayi Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas2/300/300" alt="Oksijen Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas3/300/300" alt="Argon Gazı" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas4/300/300" alt="Azot Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                        <img src="https://picsum.photos/seed/gas5/300/300" alt="Karbondioksit Tüpü" className="h-64 w-64 flex-shrink-0 rounded-xl object-cover" />
                                    </div>
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
                                <Link href="/hizmetler/medikal-gazlar" className="flex flex-col overflow-hidden rounded-xl bg-background-light shadow-md transition-transform hover:scale-105 dark:bg-background-dark">
                                    <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&h=300&fit=crop" alt="Medical gases" className="h-48 w-full object-cover" />
                                    <div className="p-6 text-center">
                                        <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">{t.service1}</h3>
                                        <p className="text-secondary/70 dark:text-white/60">{t.service1Desc}</p>
                                    </div>
                                </Link>
                                <Link href="/hizmetler/endustriyel-gaz-dolumu" className="flex flex-col overflow-hidden rounded-xl bg-background-light shadow-md transition-transform hover:scale-105 dark:bg-background-dark">
                                    <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=300&fit=crop" alt="Industrial gas cylinders" className="h-48 w-full object-cover" />
                                    <div className="p-6 text-center">
                                        <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">{t.service2}</h3>
                                        <p className="text-secondary/70 dark:text-white/60">{t.service2Desc}</p>
                                    </div>
                                </Link>
                                <Link href="/hizmetler/kriyojenik-tank-hizmetleri" className="flex flex-col overflow-hidden rounded-xl bg-background-light shadow-md transition-transform hover:scale-105 dark:bg-background-dark">
                                    <img src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&h=300&fit=crop" alt="Cryogenic tanks" className="h-48 w-full object-cover" />
                                    <div className="p-6 text-center">
                                        <h3 className="mb-2 text-xl font-bold text-secondary dark:text-white">{t.service3}</h3>
                                        <p className="text-secondary/70 dark:text-white/60">{t.service3Desc}</p>
                                    </div>
                                </Link>
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
                </main>

                {/* Footer */}
                <footer className="bg-secondary text-white/80 dark:bg-secondary">
                    <div className="mx-auto max-w-7xl px-4 py-12">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            <div className="md:col-span-1">
                                <h3 className="mb-4 text-lg font-bold text-white">Federal Gaz</h3>
                                <p className="text-sm">{t.footerSlogan}</p>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">{t.footerContact}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><p>Sanayi Mah. Teknoloji Cad. No:123, 34000, İstanbul, Türkiye</p></li>
                                    <li><a href="tel:+902120000000" className="transition-colors hover:text-primary">+90 (212) 000 00 00</a></li>
                                    <li><a href="mailto:info@federalgaz.com" className="transition-colors hover:text-primary">info@federalgaz.com</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">{t.footerQuickLinks}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li><Link href="/hakkimizda" className="transition-colors hover:text-primary">{t.about}</Link></li>
                                    <li><Link href="/hizmetler" className="transition-colors hover:text-primary">{t.services}</Link></li>
                                    <li><Link href="/urunler" className="transition-colors hover:text-primary">{t.products}</Link></li>
                                    <li><Link href="/iletisim" className="transition-colors hover:text-primary">{t.contact}</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-4 font-semibold text-white">{t.footerSocial}</h4>
                                <div className="flex space-x-4">
                                    <a href="https://www.instagram.com/federal_gaz/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                                        <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.791.218-2.427.465a4.901 4.901 0 00-1.772 1.153A4.902 4.902 0 002.525 5.45c-.247.636-.416 1.363-.465 2.427C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.427a4.902 4.902 0 001.153 1.772 4.901 4.901 0 001.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.427-.465a4.901 4.901 0 001.772-1.153 4.902 4.902 0 001.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.427a4.902 4.902 0 00-1.153-1.772 4.901 4.901 0 00-1.772-1.153c-.636-.247-1.363-.416-2.427-.465C15.056 2.012 14.716 2 12 2zm0 1.802c2.67 0 2.986.01 4.04.058.976.045 1.505.207 1.858.344.466.182.8.399 1.15.748.35.35.566.684.748 1.15.137.353.3.882.344 1.857.048 1.055.058 1.37.058 4.041 0 2.67-.01 2.986-.058 4.04-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 01-.748 1.15c-.35.35-.684.566-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-.976-.045-1.505-.207-1.858-.344a3.098 3.098 0 01-1.15-.748 3.098 3.098 0 01-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.045-.976.207-1.505.344-1.858.182-.466.399-.8.748-1.15.35-.35.684-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.37-.058 4.041-.058zm0 3.063a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm">
                            <p>{t.rights} <a href="https://www.federalgaz.com" className="font-semibold transition-colors hover:text-primary">www.federalgaz.com</a></p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
