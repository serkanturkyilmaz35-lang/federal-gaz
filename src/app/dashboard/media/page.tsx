"use client";

import { useState } from "react";
import Link from "next/link";

export default function MediaLibraryPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);

    // Mock data - will be replaced with API
    const mediaFiles = [
        {
            id: 1,
            filename: "product-oxygen.jpg",
            type: "image",
            size: "2.4 MB",
            dimensions: "1920x1080",
            uploadedAt: "2024-12-01",
            url: "/placeholder.jpg",
        },
        {
            id: 2,
            filename: "banner-industrial.jpg",
            type: "image",
            size: "3.1 MB",
            dimensions: "1920x600",
            uploadedAt: "2024-12-02",
            url: "/placeholder.jpg",
        },
        // Add more mock files as needed
    ];

    const handleFileSelect = (id: number) => {
        setSelectedFiles((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#292828] dark:text-white">
                        Medya Kütüphanesi
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#94847c]">
                        Görselleri ve dosyaları yönetin
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-[#292828] hover:bg-gray-100 dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white dark:hover:bg-[#283039]">
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        <span className="text-sm font-medium">Filtrele</span>
                    </button>
                    <button className="flex h-10 items-center gap-2 rounded-lg bg-[#b13329] px-4 text-white hover:bg-[#b13329]/90">
                        <span className="material-symbols-outlined text-lg">upload</span>
                        <span className="text-sm font-medium">Dosya Yükle</span>
                    </button>
                </div>
            </div>

            {/* View Toggle & Stats */}
            <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 dark:border-[#3b4754] dark:bg-[#1c2127]">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-[#94847c]">
                        <span className="font-bold text-[#292828] dark:text-white">
                            {mediaFiles.length}
                        </span>{" "}
                        dosya
                    </p>
                    {selectedFiles.length > 0 && (
                        <p className="text-sm text-[#94847c]">
                            <span className="font-bold text-[#b13329]">
                                {selectedFiles.length}
                            </span>{" "}
                            seçili
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex h-8 w-8 items-center justify-center rounded ${viewMode === "grid"
                                ? "bg-[#b13329] text-white"
                                : "bg-gray-100 text-[#94847c] hover:bg-gray-200 dark:bg-[#283039] dark:hover:bg-[#3b4754]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex h-8 w-8 items-center justify-center rounded ${viewMode === "list"
                                ? "bg-[#b13329] text-white"
                                : "bg-gray-100 text-[#94847c] hover:bg-gray-200 dark:bg-[#283039] dark:hover:bg-[#3b4754]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            <div className="mb-6 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-[#3b4754] dark:bg-[#1c2127]">
                <span className="material-symbols-outlined mb-4 text-6xl text-[#94847c]">
                    cloud_upload
                </span>
                <h3 className="mb-2 text-lg font-bold text-[#292828] dark:text-white">
                    Dosyaları buraya sürükleyin
                </h3>
                <p className="mb-4 text-sm text-[#94847c]">
                    veya bilgisayarınızdan seçin
                </p>
                <button className="rounded-lg bg-[#b13329] px-6 py-2 text-sm font-medium text-white hover:bg-[#b13329]/90">
                    Dosya Seç
                </button>
                <p className="mt-4 text-xs text-[#94847c]">
                    Desteklenen formatlar: JPG, PNG, GIF, SVG, PDF (Max: 10MB)
                </p>
            </div>

            {/* Media Grid/List */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {mediaFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`group relative cursor-pointer overflow-hidden rounded-lg border ${selectedFiles.includes(file.id)
                                    ? "border-[#b13329] ring-2 ring-[#b13329]/20"
                                    : "border-gray-300 dark:border-[#3b4754]"
                                }`}
                            onClick={() => handleFileSelect(file.id)}
                        >
                            <div className="aspect-square bg-gray-100 dark:bg-[#283039]">
                                <div className="flex h-full items-center justify-center">
                                    <span className="material-symbols-outlined text-6xl text-[#94847c]">
                                        image
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white p-3 dark:bg-[#1c2127]">
                                <p className="truncate text-sm font-medium text-[#292828] dark:text-white">
                                    {file.filename}
                                </p>
                                <p className="text-xs text-[#94847c]">{file.size}</p>
                            </div>
                            {/* Checkbox */}
                            <div className="absolute right-2 top-2">
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file.id)}
                                    onChange={() => handleFileSelect(file.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#b13329] focus:ring-[#b13329]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-[#3b4754]">
                    <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-[#283039]">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[#b13329]"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Dosya Adı
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Boyut
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Boyutlar
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                    Tarih
                                </th>
                                <th className="w-12 px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#1c2127]">
                            {mediaFiles.map((file) => (
                                <tr
                                    key={file.id}
                                    className="border-t border-gray-200 dark:border-[#3b4754]"
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(file.id)}
                                            onChange={() => handleFileSelect(file.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#b13329]"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 dark:bg-[#283039]">
                                                <span className="material-symbols-outlined text-[#94847c]">
                                                    image
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-[#292828] dark:text-white">
                                                {file.filename}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#94847c]">
                                        {file.size}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#94847c]">
                                        {file.dimensions}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[#94847c]">
                                        {file.uploadedAt}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button className="text-[#94847c] hover:text-[#b13329]">
                                            <span className="material-symbols-outlined">
                                                more_vert
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
