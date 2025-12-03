"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContentPagesPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data
    const pages = [
        {
            id: 1,
            title: "Ana Sayfa",
            slug: "/",
            status: "published",
            lastModified: "2024-12-03",
            author: "Admin",
        },
        {
            id: 2,
            title: "Hakkımızda",
            slug: "/hakkimizda",
            status: "published",
            lastModified: "2024-12-02",
            author: "Admin",
        },
        {
            id: 3,
            title: "Hizmetlerimiz",
            slug: "/hizmetler",
            status: "published",
            lastModified: "2024-12-01",
            author: "Editor",
        },
        {
            id: 4,
            title: "İletişim",
            slug: "/iletisim",
            status: "draft",
            lastModified: "2024-11-30",
            author: "Admin",
        },
    ];

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
                <Link
                    href="/dashboard/content/pages/new"
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#b13329] px-4 text-white hover:bg-[#b13329]/90"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span className="text-sm font-medium">Yeni Sayfa</span>
                </Link>
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
                <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white">
                    <option value="all">Tüm Durumlar</option>
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                </select>
            </div>

            {/* Pages Table */}
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
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Yazar
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Son Güncelleme
                            </th>
                            <th className="w-24 px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1c2127]">
                        {pages.map((page) => (
                            <tr
                                key={page.id}
                                className="border-t border-gray-200 hover:bg-gray-50 dark:border-[#3b4754] dark:hover:bg-[#283039]"
                            >
                                <td className="px-6 py-4">
                                    <Link
                                        href={`/dashboard/content/pages/${page.id}`}
                                        className="font-medium text-[#292828] hover:text-[#b13329] dark:text-white dark:hover:text-[#b13329]"
                                    >
                                        {page.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {page.slug}
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
                                    {page.author}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {page.lastModified}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/dashboard/content/pages/${page.id}/edit`}
                                            className="text-[#94847c] hover:text-[#b13329]"
                                            title="Düzenle"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </Link>
                                        <button
                                            className="text-[#94847c] hover:text-red-500"
                                            title="Sil"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-[#94847c]">
                    <span className="font-medium text-[#292828] dark:text-white">4</span>{" "}
                    sayfadan{" "}
                    <span className="font-medium text-[#292828] dark:text-white">
                        1-4
                    </span>{" "}
                    arası gösteriliyor
                </p>
                <div className="flex gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-[#94847c] hover:bg-gray-100 disabled:opacity-50 dark:border-[#3b4754] dark:bg-[#1c2127] dark:hover:bg-[#283039]" disabled>
                        <span className="material-symbols-outlined text-lg">
                            chevron_left
                        </span>
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-[#94847c] hover:bg-gray-100 disabled:opacity-50 dark:border-[#3b4754] dark:bg-[#1c2127] dark:hover:bg-[#283039]" disabled>
                        <span className="material-symbols-outlined text-lg">
                            chevron_right
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
