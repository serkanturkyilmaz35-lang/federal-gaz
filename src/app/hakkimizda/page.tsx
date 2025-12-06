"use client";

import { useLanguage } from "@/context/LanguageContext";

const translations = {
    TR: {
        title: "Hakkımızda",
        subtitle: "Federal Gaz olarak endüstriyel gaz sektöründe güvenilir çözümler sunuyoruz.",
        missionTitle: "Misyonumuz",
        missionDesc: "Federal Gaz, endüstriyel gaz sektöründe uzun yıllara dayanan tecrübesiyle, müşterilerine güvenilir ve yüksek kaliteli çözümler sunmaktadır. Misyonumuz, yenilikçi teknolojileri kullanarak sürdürülebilir ve verimli enerji kaynakları sağlamaktır.",
        visionTitle: "Vizyonumuz",
        visionDesc: "Vizyonumuz, endüstriyel gaz sektöründe lider bir marka olmak ve müşterilerimize en iyi hizmeti sunarak sektörde fark yaratmaktır. Sürekli gelişim ve yenilikçilik ilkelerimizle hareket ediyoruz.",
        valuesTitle: "Değerlerimiz",
        qualityTitle: "Kalite",
        qualityDesc: "En yüksek kalite standartlarında ürün ve hizmet sunuyoruz.",
        reliabilityTitle: "Güvenilirlik",
        reliabilityDesc: "Müşterilerimizin güvenini kazanmak ve korumak önceliğimizdir.",
        innovationTitle: "Yenilikçilik",
        innovationDesc: "Sürekli gelişim ve yenilikçi çözümlerle sektöre öncülük ediyoruz."
    },
    EN: {
        title: "About Us",
        subtitle: "As Federal Gaz, we provide reliable solutions in the industrial gas sector.",
        missionTitle: "Our Mission",
        missionDesc: "With years of experience in the industrial gas sector, Federal Gaz provides reliable and high-quality solutions to its customers. Our mission is to provide sustainable and efficient energy sources using innovative technologies.",
        visionTitle: "Our Vision",
        visionDesc: "Our vision is to be a leading brand in the industrial gas sector and make a difference by offering the best service to our customers. We act with principles of continuous improvement and innovation.",
        valuesTitle: "Our Values",
        qualityTitle: "Quality",
        qualityDesc: "We provide products and services at the highest quality standards.",
        reliabilityTitle: "Reliability",
        reliabilityDesc: "Winning and maintaining our customers' trust is our priority.",
        innovationTitle: "Innovation",
        innovationDesc: "We lead the sector with continuous improvement and innovative solutions."
    }
};

export default function HakkimizdaPage() {
    const { language } = useLanguage();
    const t = translations[language];

    return (
        <>
            {/* Page Header */}
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">
                        {t.title}
                    </h1>
                    <p className="mt-4 text-lg text-white/80">
                        {t.subtitle}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="text-3xl font-bold text-secondary dark:text-white">
                                {t.missionTitle}
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-secondary/80 dark:text-white/70">
                                {t.missionDesc}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-secondary dark:text-white">
                                {t.visionTitle}
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-secondary/80 dark:text-white/70">
                                {t.visionDesc}
                            </p>
                        </div>
                    </div>

                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-secondary dark:text-white">
                            {t.valuesTitle}
                        </h2>
                        <div className="mt-8 grid gap-8 md:grid-cols-3">
                            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-background-dark">
                                <h3 className="text-xl font-bold text-primary">{t.qualityTitle}</h3>
                                <p className="mt-2 text-secondary/70 dark:text-white/60">
                                    {t.qualityDesc}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-background-dark">
                                <h3 className="text-xl font-bold text-primary">{t.reliabilityTitle}</h3>
                                <p className="mt-2 text-secondary/70 dark:text-white/60">
                                    {t.reliabilityDesc}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white p-6 shadow-md dark:bg-background-dark">
                                <h3 className="text-xl font-bold text-primary">{t.innovationTitle}</h3>
                                <p className="mt-2 text-secondary/70 dark:text-white/60">
                                    {t.innovationDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
