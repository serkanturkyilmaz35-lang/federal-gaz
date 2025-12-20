"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface GalleryImage {
    src: string;
    alt: string;
    category: string;
}

interface CategoryItem {
    key: string;
    name: string;
}

interface PageContent {
    header: {
        title: string;
        subtitle: string;
    };
    categories: {
        categoryItems: CategoryItem[];
    };
    images: {
        galleryItems: GalleryImage[];
    };
}

const defaultContent: Record<string, PageContent> = {
    TR: {
        header: {
            title: "Galeri",
            subtitle: "Ürünlerimiz ve hizmetlerimizden kareler.",
        },
        categories: {
            categoryItems: [
                { key: 'medical', name: 'Medikal Gazlar' },
                { key: 'industrial', name: 'Endüstriyel Gazlar' },
                { key: 'food', name: 'Gıda Gazları' },
                { key: 'cryogenic', name: 'Kriyojenik Sıvılar' },
                { key: 'special', name: 'Özel Gazlar' },
                { key: 'welding', name: 'Kaynak Gazları' },
            ],
        },
        images: {
            galleryItems: [
                { src: "/gallery/medikal-oksijen.png", alt: "Medikal Oksijen Tüpü", category: "medical" },
                { src: "/gallery/endustriyel-oksijen.png", alt: "Endüstriyel Oksijen Tüpü", category: "industrial" },
                { src: "/gallery/azot.png", alt: "Azot Gazı Tüpü", category: "industrial" },
                { src: "/gallery/argon.png", alt: "Argon Gazı Tüpü", category: "industrial" },
                { src: "/gallery/karbondioksit.png", alt: "Karbondioksit Tüpü", category: "food" },
                { src: "/gallery/asetilen.png", alt: "Asetilen Tüpü", category: "industrial" },
                { src: "/gallery/helyum.png", alt: "Helyum Gazı Tüpü", category: "industrial" },
                { src: "/gallery/propan.png", alt: "Propan Tüpü", category: "industrial" },
                { src: "/gallery/hidrojen.png", alt: "Hidrojen Gazı Tüpü", category: "industrial" },
                { src: "/gallery/amonyak.png", alt: "Amonyak Gazı Tüpü", category: "industrial" },
                { src: "/gallery/kuru-hava.png", alt: "Kuru Hava Tüpü", category: "medical" },
                { src: "/gallery/protoksit.png", alt: "Azot Protoksit Tüpü", category: "medical" },
                { src: "/gallery/balon-gazi.png", alt: "Balon Gazı Tüpü", category: "industrial" },
                { src: "/gallery/kaynak-gazi.png", alt: "Kaynak Gazı Karışım Tüpü", category: "welding" },
                { src: "/gallery/kaynak-mix-1.png", alt: "Argon/CO2 Karışım Tüpü", category: "welding" },
                { src: "/gallery/kaynak-mix-2.png", alt: "Üçlü Karışım Kaynak Gazı", category: "welding" },
                { src: "/gallery/kaynak-mix-3.png", alt: "Lazer Kaynak Gazı Tüpü", category: "welding" },
                { src: "/gallery/ozel-gaz.png", alt: "Özel Gaz Karışım Tüpü", category: "special" },
                { src: "/gallery/gida-gazi-mix.png", alt: "Gıda Gazı Karışım Tüpü", category: "food" },
                { src: "/gallery/kriyojenik-tup.png", alt: "Kriyojenik Sıvı Silindiri", category: "cryogenic" },
            ],
        },
    },
    EN: {
        header: {
            title: "Gallery",
            subtitle: "Snapshots from our products and services.",
        },
        categories: {
            categoryItems: [
                { key: 'medical', name: 'Medical Gases' },
                { key: 'industrial', name: 'Industrial Gases' },
                { key: 'food', name: 'Food Gases' },
                { key: 'cryogenic', name: 'Cryogenic Liquids' },
                { key: 'special', name: 'Special Gases' },
                { key: 'welding', name: 'Welding Gases' },
            ],
        },
        images: {
            galleryItems: [
                { src: "/gallery/medikal-oksijen.png", alt: "Medical Oxygen Cylinder", category: "medical" },
                { src: "/gallery/endustriyel-oksijen.png", alt: "Industrial Oxygen Cylinder", category: "industrial" },
                { src: "/gallery/azot.png", alt: "Nitrogen Gas Cylinder", category: "industrial" },
                { src: "/gallery/argon.png", alt: "Argon Gas Cylinder", category: "industrial" },
                { src: "/gallery/karbondioksit.png", alt: "Carbon Dioxide Cylinder", category: "food" },
                { src: "/gallery/asetilen.png", alt: "Acetylene Cylinder", category: "industrial" },
                { src: "/gallery/helyum.png", alt: "Helium Gas Cylinder", category: "industrial" },
                { src: "/gallery/propan.png", alt: "Propane Cylinder", category: "industrial" },
                { src: "/gallery/hidrojen.png", alt: "Hydrogen Gas Cylinder", category: "industrial" },
                { src: "/gallery/amonyak.png", alt: "Ammonia Gas Cylinder", category: "industrial" },
                { src: "/gallery/kuru-hava.png", alt: "Dry Air Cylinder", category: "medical" },
                { src: "/gallery/protoksit.png", alt: "Nitrous Oxide Cylinder", category: "medical" },
                { src: "/gallery/balon-gazi.png", alt: "Balloon Gas Cylinder", category: "industrial" },
                { src: "/gallery/kaynak-gazi.png", alt: "Welding Gas Mixture Cylinder", category: "welding" },
                { src: "/gallery/kaynak-mix-1.png", alt: "Argon/CO2 Mix Cylinder", category: "welding" },
                { src: "/gallery/kaynak-mix-2.png", alt: "Triple Mix Welding Gas", category: "welding" },
                { src: "/gallery/kaynak-mix-3.png", alt: "Laser Welding Gas Cylinder", category: "welding" },
                { src: "/gallery/ozel-gaz.png", alt: "Special Gas Mixture Cylinder", category: "special" },
                { src: "/gallery/gida-gazi-mix.png", alt: "Food Gas Mixture Cylinder", category: "food" },
                { src: "/gallery/kriyojenik-tup.png", alt: "Cryogenic Liquid Cylinder", category: "cryogenic" },
            ],
        },
    },
};

const staticLabels = {
    TR: { home: "Ana Sayfa" },
    EN: { home: "Home" },
};

export default function GalleryPage() {
    const { language } = useLanguage();
    const [content, setContent] = useState<PageContent>(defaultContent[language]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/dashboard/page-content?slug=/galeri&language=${language}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const sections = data.sections || [];

                    const headerSection = sections.find((s: { key: string }) => s.key === 'header');
                    const categoriesSection = sections.find((s: { key: string }) => s.key === 'categories');
                    const imagesSection = sections.find((s: { key: string }) => s.key === 'images');

                    setContent({
                        header: headerSection?.content || defaultContent[language].header,
                        categories: categoriesSection?.content || defaultContent[language].categories,
                        images: imagesSection?.content || defaultContent[language].images,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch CMS content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [language]);

    const labels = staticLabels[language];
    const galleryImages = content.images?.galleryItems || [];
    const categoryItems = content.categories?.categoryItems || [];

    // Helper function to get category name by key
    const getCategoryName = (categoryKey: string) => {
        const category = categoryItems.find(c => c.key === categoryKey);
        return category?.name || categoryKey;
    };

    if (loading) {
        return (
            <main className="min-h-screen">
                <section className="bg-secondary py-16 text-white text-center">
                    <div className="container mx-auto px-4">
                        <div className="h-12 w-1/2 mx-auto animate-pulse rounded bg-white/20"></div>
                        <div className="mt-4 h-6 w-1/3 mx-auto animate-pulse rounded bg-white/10"></div>
                    </div>
                </section>
                <section className="py-16 bg-background-light dark:bg-background-dark">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-secondary py-16 text-white text-center">
                <div className="container mx-auto px-4">
                    <nav className="mb-4 flex items-center justify-center gap-2 text-sm text-white/80">
                        <Link href="/" className="hover:text-primary transition-colors">{labels.home}</Link>
                        <span>/</span>
                        <span>{content.header.title}</span>
                    </nav>
                    <h1 className="text-4xl font-black md:text-5xl">{content.header.title}</h1>
                    <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{content.header.subtitle}</p>
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
                                        alt={image.alt}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                                {/* Content Overlay */}
                                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 transition-all duration-300">
                                    <div className="transform translate-y-0 sm:translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                                        <span className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 mb-1 sm:mb-2 text-[10px] sm:text-xs font-semibold text-white bg-primary rounded-md shadow-sm">
                                            {getCategoryName(image.category)}
                                        </span>
                                        <h3 className="text-sm sm:text-xl font-bold text-white leading-tight line-clamp-2 shadow-black/50 drop-shadow-md">
                                            {image.alt}
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
