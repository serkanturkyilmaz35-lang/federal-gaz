"use client";

import { useState, useEffect } from "react";

interface ContentSection {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    count?: number;
}

export default function ContentPage() {
    const [loading, setLoading] = useState(true);

    const contentSections: ContentSection[] = [
        {
            id: 'pages',
            title: 'Sayfa Düzenleyici',
            description: 'Ana sayfa, Hakkımızda ve diğer sayfaların içeriklerini düzenleyin',
            icon: 'edit_document',
            link: '/dashboard/content/pages',
        },
        {
            id: 'products',
            title: 'Ürünler',
            description: 'Web sitesindeki ürün kategorilerini yönetin',
            icon: 'inventory_2',
            link: '/dashboard/products',
            count: 6
        },
        {
            id: 'services',
            title: 'Hizmetler',
            description: 'Web sitesindeki hizmetleri yönetin',
            icon: 'build',
            link: '/dashboard/services',
            count: 5
        },
    ];

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                        İçerik Yönetimi
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Web sitesindeki tüm içerikleri merkezi olarak yönetin.
                    </p>
                </div>
            </div>

            {/* Content Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contentSections.map((section) => (
                    <a
                        key={section.id}
                        href={section.link}
                        className="bg-[#111418] rounded-xl p-6 border border-[#3b4754] hover:border-[#137fec]/50 transition-all hover:shadow-lg group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-[#137fec]/10 rounded-lg group-hover:bg-[#137fec]/20 transition-colors">
                                <span className="material-symbols-outlined text-[#137fec] text-2xl">{section.icon}</span>
                            </div>
                            {section.count !== undefined && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-gray-300">
                                    {section.count} öğe
                                </span>
                            )}
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#137fec] transition-colors">
                            {section.title}
                        </h3>
                        <p className="text-sm text-gray-400">{section.description}</p>
                        <div className="mt-4 flex items-center text-[#137fec] text-sm font-medium">
                            <span>Yönet</span>
                            <span className="material-symbols-outlined text-lg ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </div>
                    </a>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-[#111418] rounded-xl p-6 border border-[#3b4754]">
                <h3 className="text-lg font-bold text-white mb-4">Hızlı İstatistikler</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-[#137fec]">12</p>
                        <p className="text-sm text-gray-400">Sayfa</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-green-400">6</p>
                        <p className="text-sm text-gray-400">Ürün</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-400">5</p>
                        <p className="text-sm text-gray-400">Hizmet</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
