"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Ürünlerimiz",
        subtitle: "Endüstriyel gaz ürün yelpazemizi keşfedin.",
        moreInfo: "Detaylı Bilgi →",
        products: [
            {
                title: "Medikal Gazlar",
                desc: "Oksijen, Azot Protoksit, Medikal Hava",
                slug: "medikal-gazlar",
                image: "/products/medikal-gazlar-custom.jpg" // Custom user image
            },
            {
                title: "Endüstriyel Gazlar",
                desc: "Oksijen, Azot, Argon, Karbondioksit",
                slug: "endustriyel-gazlar",
                image: "/products/endustriyel-gazlar-custom.jpg" // Custom user image
            },
            {
                title: "Kaynak Gazları",
                desc: "Asetilen, Propan, Karışım Gazlar",
                slug: "kaynak-gazlari",
                image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=60" // Welding Torch (Working)
            },
            {
                title: "Gıda Gazları",
                desc: "CO2, N2, Karışım Gazlar",
                slug: "gida-gazlari",
                image: "/products/gida-gazlari-custom.jpg" // Custom user image
            },
            {
                title: "Özel Gazlar",
                desc: "Kalibrasyon, Analitik Gazlar",
                slug: "ozel-gazlar",
                image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60" // Lab Glassware/Chemicals (Popular/Safe)
            },
            {
                title: "Kriyojenik Sıvılar",
                desc: "Sıvı Azot, Sıvı Oksijen, Sıvı Argon",
                slug: "kriyojenik-sivilar",
                image: "/products/kriyojenik-sivilar-custom.jpg" // Custom user image
            }
        ]
    },
    EN: {
        title: "Our Products",
        subtitle: "Explore our range of industrial gas products.",
        moreInfo: "Detailed Info →",
        products: [
            {
                title: "Medical Gases",
                desc: "Oxygen, Nitrous Oxide, Medical Air",
                slug: "medical-gases",
                image: "/products/medikal-gazlar-custom.jpg"
            },
            {
                title: "Industrial Gases",
                desc: "Oxygen, Nitrogen, Argon, Carbon Dioxide",
                slug: "industrial-gases",
                image: "/products/endustriyel-gazlar-custom.jpg"
            },
            {
                title: "Welding Gases",
                desc: "Acetylene, Propane, Mixture Gases",
                slug: "welding-gases",
                image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Food Gases",
                desc: "CO2, N2, Mixture Gases",
                slug: "food-gases",
                image: "/products/gida-gazlari-custom.jpg"
            },
            {
                title: "Special Gases",
                desc: "Calibration, Analytical Gases",
                slug: "special-gases",
                image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60"
            },
            {
                title: "Cryogenic Liquids",
                desc: "Liquid Nitrogen, Liquid Oxygen, Liquid Argon",
                slug: "cryogenic-liquids",
                image: "/products/kriyojenik-sivilar-custom.jpg"
            }
        ]
    }
};

export default function UrunlerPage() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">{t.title}</h1>
                    <p className="mt-4 text-lg text-white/80">{t.subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {t.products.map((product, i) => (
                            <div key={i} className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl dark:bg-background-dark">
                                <div className="p-6 pb-2">
                                    <h3 className="text-xl font-bold text-secondary dark:text-white">{product.title}</h3>
                                </div>
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-6 pt-4">
                                    <p className="text-secondary/70 dark:text-white/60">{product.desc}</p>
                                    <Link
                                        href={`/urunler/${product.slug}`}
                                        className="mt-4 inline-block text-sm font-bold text-primary hover:underline"
                                    >
                                        {t.moreInfo}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
