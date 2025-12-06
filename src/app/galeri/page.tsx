"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Galeri",
        subtitle: "Ürünlerimiz ve hizmetlerimizden kareler.",
        home: "Ana Sayfa",
        viewDetail: "Detayı İncele",
        categories: {
            medical: "Medikal Gazlar",
            industrial: "Endüstriyel Gazlar",
            food: "Gıda Gazları",
            cryogenic: "Kriyojenik Sıvılar",
            special: "Özel Gazlar",
            welding: "Kaynak Gazları"
        }
    },
    EN: {
        title: "Gallery",
        subtitle: "Snapshots from our products and services.",
        home: "Home",
        viewDetail: "View Detail",
        categories: {
            medical: "Medical Gases",
            industrial: "Industrial Gases",
            food: "Food Gases",
            cryogenic: "Cryogenic Liquids",
            special: "Special Gases",
            welding: "Welding Gases"
        }
    }
};

const galleryImages = [
    {
        src: "/products/medikal-oksijen.png",
        categoryKey: "medical",
        alt: { TR: "Medikal Oksijen Tüpü", EN: "Medical Oxygen Cylinder" }
    },
    {
        src: "/products/endustriyel-oksijen.png",
        categoryKey: "industrial",
        alt: { TR: "Endüstriyel Oksijen Tüpü", EN: "Industrial Oxygen Cylinder" }
    },
    {
        src: "/products/azot.png",
        categoryKey: "industrial",
        alt: { TR: "Azot Gazı Tüpü", EN: "Nitrogen Gas Cylinder" }
    },
    {
        src: "/products/argon.png",
        categoryKey: "industrial",
        alt: { TR: "Argon Gazı Tüpü", EN: "Argon Gas Cylinder" }
    },
    {
        src: "/products/karbondioksit.png",
        categoryKey: "food",
        alt: { TR: "Karbondioksit Tüpü", EN: "Carbon Dioxide Cylinder" }
    },
    {
        src: "/products/asetilen.png",
        categoryKey: "industrial",
        alt: { TR: "Asetilen Tüpü", EN: "Acetylene Cylinder" }
    },
    {
        src: "/products/helyum.png",
        categoryKey: "industrial",
        alt: { TR: "Helyum Gazı Tüpü", EN: "Helium Gas Cylinder" }
    },
    {
        src: "/products/propan.png",
        categoryKey: "industrial",
        alt: { TR: "Propan Tüpü", EN: "Propane Cylinder" }
    },
    {
        src: "/products/hidrojen.png",
        categoryKey: "industrial",
        alt: { TR: "Hidrojen Gazı Tüpü", EN: "Hydrogen Gas Cylinder" }
    },
    {
        src: "/products/amonyak.png",
        categoryKey: "industrial",
        alt: { TR: "Amonyak Gazı Tüpü", EN: "Ammonia Gas Cylinder" }
    },
    {
        src: "/products/kuru-hava.png",
        categoryKey: "medical",
        alt: { TR: "Kuru Hava Tüpü", EN: "Dry Air Cylinder" }
    },
    {
        src: "/products/protoksit.png",
        categoryKey: "medical",
        alt: { TR: "Azot Protoksit Tüpü", EN: "Nitrous Oxide Cylinder" }
    },
    {
        src: "/products/balon-gazi.png",
        categoryKey: "industrial",
        alt: { TR: "Balon Gazı Tüpü", EN: "Balloon Gas Cylinder" }
    },
    {
        src: "/products/kaynak-gazi.png",
        categoryKey: "welding",
        alt: { TR: "Kaynak Gazı Karışım Tüpü", EN: "Welding Gas Mix Cylinder" }
    },
    {
        src: "/products/kaynak-mix-1.png",
        categoryKey: "welding",
        alt: { TR: "Argon/CO2 Karışım Tüpü", EN: "Argon/CO2 Mix Cylinder" }
    },
    {
        src: "/products/kaynak-mix-2.png",
        categoryKey: "welding",
        alt: { TR: "Üçlü Karışım Kaynak Gazı", EN: "Triple Mix Welding Gas" }
    },
    {
        src: "/products/kaynak-mix-3.png",
        categoryKey: "welding",
        alt: { TR: "Lazer Kaynak Gazı Tüpü", EN: "Laser Welding Gas Cylinder" }
    },
    {
        src: "/products/ozel-gaz.png",
        categoryKey: "special",
        alt: { TR: "Özel Gaz Karışım Tüpü", EN: "Special Gas Mix Cylinder" }
    },
    {
        src: "/products/gida-gazi-mix.png",
        categoryKey: "food",
        alt: { TR: "Gıda Gazı Karışım Tüpü", EN: "Food Gas Mix Cylinder" }
    },
    {
        src: "/products/kriyojenik-tup.png",
        categoryKey: "cryogenic",
        alt: { TR: "Kriyojenik Sıvı Silindiri", EN: "Cryogenic Liquid Cylinder" }
    }
];

export default function GalleryPage() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-secondary py-16 text-white text-center">
                <div className="container mx-auto px-4">
                    <nav className="mb-4 flex items-center justify-center gap-2 text-sm text-white/80">
                        <Link href="/" className="hover:text-primary transition-colors">{t.home}</Link>
                        <span>/</span>
                        <span>{t.title}</span>
                    </nav>
                    <h1 className="text-4xl font-black md:text-5xl">{t.title}</h1>
                    <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{t.subtitle}</p>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-16 bg-background-light dark:bg-background-dark">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {galleryImages.map((image, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800 aspect-[4/5] cursor-pointer"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={image.src}
                                        alt={image.alt[language]}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>

                                {/* Overlay Gradient - Always visible at bottom, expands on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 transition-all duration-300">
                                    <div className="transform translate-y-0 sm:translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                        <span className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 mb-1 sm:mb-2 text-[10px] sm:text-xs font-semibold text-white bg-primary rounded-md shadow-sm">
                                            {/* @ts-expect-error: Category keys are dynamic */}
                                            {t.categories[image.categoryKey]}
                                        </span>
                                        <h3 className="text-sm sm:text-xl font-bold text-white leading-tight line-clamp-2 shadow-black/50 drop-shadow-md">
                                            {image.alt[language]}
                                        </h3>
                                        <div className="mt-4 h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:h-auto group-hover:opacity-100 hidden sm:block">
                                            <p className="text-sm text-white/90">
                                                Federal Gaz
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Border Effect */}
                                <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300 group-hover:border-primary/50 rounded-xl pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
