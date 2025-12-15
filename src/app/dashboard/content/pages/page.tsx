"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PageData {
    id: number;
    slug: string;
    title: string;
    status: 'published' | 'draft';
    type: 'legal' | 'static' | 'dynamic';
    isSystemPage: boolean;
    updatedAt: string;
}

export default function ContentPagesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pages, setPages] = useState<PageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await fetch('/api/dashboard/pages');
            if (res.ok) {
                const data = await res.json();
                setPages(data.pages);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const seedLegalPages = async () => {
        setSeeding(true);
        try {
            const res = await fetch('/api/dashboard/pages/seed', { method: 'POST' });
            if (res.ok) {
                await fetchPages();
            }
        } catch (error) {
            console.error('Error seeding pages:', error);
        } finally {
            setSeeding(false);
        }
    };

    const deletePage = async (id: number) => {
        if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/dashboard/pages/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPages(pages.filter(p => p.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || 'Silme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error deleting page:', error);
        }
    };

    const filteredPages = pages.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || page.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'legal': return 'Yasal';
            case 'static': return 'Statik';
            case 'dynamic': return 'Dinamik';
            default: return type;
        }
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'legal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'static': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'dynamic': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
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
                        Web sitesi sayfalarını oluşturun ve düzenleyin
                    </p>
                </div>
                <div className="flex gap-2">
                    {pages.length === 0 && !loading && (
                        <button
                            onClick={seedLegalPages}
                            disabled={seeding}
                            className="flex h-10 items-center gap-2 rounded-lg bg-purple-600 px-4 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-lg">gavel</span>
                            <span className="text-sm font-medium">
                                {seeding ? 'Oluşturuluyor...' : 'Yasal Sayfaları Oluştur'}
                            </span>
                        </button>
                    )}
                    <Link
                        href="/dashboard/content/pages/new"
                        className="flex h-10 items-center gap-2 rounded-lg bg-[#b13329] px-4 text-white hover:bg-[#b13329]/90"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        <span className="text-sm font-medium">Yeni Sayfa</span>
                    </Link>
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white"
                >
                    <option value="all">Tüm Durumlar</option>
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                </select>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            )}

            {/* Empty State */}
            {!loading && pages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">article</span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz sayfa yok</h3>
                    <p className="text-gray-500 mb-4">Yasal sayfaları otomatik oluşturmak için butona tıklayın</p>
                    <button
                        onClick={seedLegalPages}
                        disabled={seeding}
                        className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">gavel</span>
                        {seeding ? 'Oluşturuluyor...' : 'Yasal Sayfaları Oluştur'}
                    </button>
                </div>
            )}

            {/* Pages Table */}
            {!loading && pages.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-[#3b4754]">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-[#283039]">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Başlık
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Tür
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Durum
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Son Güncelleme
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
                                        <Link
                                            href={`/dashboard/content/pages/${page.id}`}
                                            className="font-medium text-[#292828] hover:text-[#b13329] dark:text-white dark:hover:text-[#b13329] flex items-center gap-2"
                                        >
                                            {page.isSystemPage && (
                                                <span className="material-symbols-outlined text-sm text-purple-500">lock</span>
                                            )}
                                            {page.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#94847c]">
                                        /{page.slug}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getTypeBadgeColor(page.type)}`}>
                                            {getTypeLabel(page.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${page.status === "published"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}
                                        >
                                            {page.status === "published" ? "Yayında" : "Taslak"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[#94847c]">
                                        {new Date(page.updatedAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/dashboard/content/pages/${page.id}`}
                                                className="text-[#94847c] hover:text-[#b13329]"
                                                title="Düzenle"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </Link>
                                            <a
                                                href={`/${page.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#94847c] hover:text-blue-500"
                                                title="Görüntüle"
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </a>
                                            {!page.isSystemPage && (
                                                <button
                                                    onClick={() => deletePage(page.id)}
                                                    className="text-[#94847c] hover:text-red-500"
                                                    title="Sil"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!loading && filteredPages.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-[#94847c]">
                        <span className="font-medium text-[#292828] dark:text-white">{filteredPages.length}</span>{" "}
                        sayfa gösteriliyor
                    </p>
                </div>
            )}
        </div>
    );
}
