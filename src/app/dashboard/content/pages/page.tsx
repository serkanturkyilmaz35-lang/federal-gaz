"use client";

import { useState } from "react";
import Link from "next/link";

// All website pages - these are hardcoded as they represent the site structure
const websitePages = [
    {
        id: 1,
        title: "Ana Sayfa",
        slug: "/",
        type: "static",
        status: "published",
        editable: false,
        description: "Web sitesinin ana sayfası",
    },
    {
        id: 2,
        title: "Hakkımızda",
        slug: "/hakkimizda",
        type: "static",
        status: "published",
        editable: false,
        description: "Şirket hakkında bilgi sayfası",
    },
    {
        id: 3,
        title: "Ürünler",
        slug: "/urunler",
        type: "dynamic",
        status: "published",
        editable: false,
        description: "Ürün listeleme sayfası",
    },
    {
        id: 4,
        title: "Hizmetler",
        slug: "/hizmetler",
        type: "static",
        status: "published",
        editable: false,
        description: "Hizmetler ana sayfası",
    },
    {
        id: 5,
        title: "Medikal Gazlar",
        slug: "/hizmetler/medikal-gazlar",
        type: "static",
        status: "published",
        editable: false,
        description: "Medikal gaz hizmetleri",
    },
    {
        id: 6,
        title: "Kaynak Gazları",
        slug: "/hizmetler/kaynak-gazlari",
        type: "static",
        status: "published",
        editable: false,
        description: "Kaynak gazları hizmetleri",
    },
    {
        id: 7,
        title: "Özel Gaz Karışımları",
        slug: "/hizmetler/ozel-gaz-karisimlari",
        type: "static",
        status: "published",
        editable: false,
        description: "Özel gaz karışımları hizmetleri",
    },
    {
        id: 8,
        title: "Gıda Gazları",
        slug: "/hizmetler/gida-gazlari",
        type: "static",
        status: "published",
        editable: false,
        description: "Gıda gazları hizmetleri",
    },
    {
        id: 9,
        title: "Galeri",
        slug: "/galeri",
        type: "static",
        status: "published",
        editable: false,
        description: "Fotoğraf galerisi",
    },
    {
        id: 10,
        title: "İletişim",
        slug: "/iletisim",
        type: "static",
        status: "published",
        editable: false,
        description: "İletişim sayfası",
    },
    {
        id: 11,
        title: "Sipariş",
        slug: "/siparis",
        type: "dynamic",
        status: "published",
        editable: false,
        description: "Online sipariş formu",
    },
    {
        id: 12,
        title: "Gizlilik Politikası",
        slug: "/gizlilik-politikasi",
        type: "legal",
        status: "published",
        editable: true,
        description: "Gizlilik politikası sayfası",
    },
    {
        id: 13,
        title: "KVKK Aydınlatma Metni",
        slug: "/kvkk",
        type: "legal",
        status: "published",
        editable: true,
        description: "KVKK aydınlatma metni",
    },
    {
        id: 14,
        title: "Çerez Politikası",
        slug: "/cerez-politikasi",
        type: "legal",
        status: "published",
        editable: true,
        description: "Çerez politikası sayfası",
    },
    {
        id: 15,
        title: "Üye Girişi",
        slug: "/giris",
        type: "auth",
        status: "published",
        editable: false,
        description: "Üye giriş sayfası",
    },
    {
        id: 16,
        title: "Kayıt Ol",
        slug: "/kayit-ol",
        type: "auth",
        status: "published",
        editable: false,
        description: "Üyelik kayıt sayfası",
    },
    {
        id: 17,
        title: "Profil",
        slug: "/profil",
        type: "auth",
        status: "published",
        editable: false,
        description: "Kullanıcı profil sayfası",
    },
];

export default function ContentPagesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");

    const filteredPages = websitePages.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === "all" || page.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'legal': return 'Yasal';
            case 'static': return 'Statik';
            case 'dynamic': return 'Dinamik';
            case 'auth': return 'Kimlik';
            default: return type;
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'legal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'static': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'dynamic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'auth': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#292828] dark:text-white">
                        Sayfa Yönetimi
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#94847c]">
                        Web sitesindeki tüm sayfaları görüntüleyin
                    </p>
                </div>
            </div>

            {/* Info Box */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500">info</span>
                    <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Bu sayfada web sitenizde bulunan tüm sayfalar listelenmektedir.
                            <strong className="text-purple-600"> Yasal</strong> olarak işaretli sayfaların içeriklerini
                            Ayarlar → Yasal sekmesinden yönetebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-[#94847c]">
                            search
                        </span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none focus:ring-2 focus:ring-[#b13329]/20 dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white"
                        placeholder="Sayfa ara..."
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white"
                >
                    <option value="all">Tüm Türler</option>
                    <option value="static">Statik</option>
                    <option value="dynamic">Dinamik</option>
                    <option value="legal">Yasal</option>
                    <option value="auth">Kimlik</option>
                </select>
            </div>

            {/* Pages Table */}
            <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-[#3b4754]">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-[#283039]">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Sayfa
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                URL
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Tür
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Durum
                            </th>
                            <th className="w-24 px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1c2127]">
                        {filteredPages.map((page) => (
                            <tr
                                key={page.id}
                                className="border-t border-gray-200 hover:bg-gray-50 dark:border-[#3b4754] dark:hover:bg-[#283039]"
                            >
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-[#292828] dark:text-white">
                                            {page.title}
                                        </p>
                                        <p className="text-xs text-[#94847c]">
                                            {page.description}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {page.slug}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeBadgeColor(page.type)}`}>
                                        {getTypeLabel(page.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                        Yayında
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={page.slug}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#94847c] hover:text-blue-500"
                                            title="Sayfayı Görüntüle"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </a>
                                        {page.editable && (
                                            <Link
                                                href="/dashboard/settings"
                                                className="text-[#94847c] hover:text-[#b13329]"
                                                title="İçeriği Düzenle (Ayarlar → Yasal)"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-[#94847c]">
                    Toplam <span className="font-medium text-[#292828] dark:text-white">{filteredPages.length}</span> sayfa
                </p>
                <div className="flex gap-4 text-xs text-[#94847c]">
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        Statik: {websitePages.filter(p => p.type === 'static').length}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                        Dinamik: {websitePages.filter(p => p.type === 'dynamic').length}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                        Yasal: {websitePages.filter(p => p.type === 'legal').length}
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Kimlik: {websitePages.filter(p => p.type === 'auth').length}
                    </span>
                </div>
            </div>
        </div>
    );
}
