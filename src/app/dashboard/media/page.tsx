"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "@/context/LanguageContext";

interface MediaFile {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
}

const translations = {
    TR: {
        pageTitle: "Medya Kütüphanesi",
        pageDesc: "Görselleri ve dosyaları yönetin",
        filter: "Filtrele",
        uploadFile: "Dosya Yükle",
        files: "dosya",
        selected: "seçili",
        dragAndDrop: "Dosyaları buraya sürükleyin",
        orSelect: "veya bilgisayarınızdan seçin",
        selectFile: "Dosya Seç",
        supportedFormats: "Desteklenen formatlar: JPG, PNG, GIF, WEBP, SVG, PDF (Max: 10MB)",
        uploading: "Yükleniyor...",
        deleteSelected: "Seçilenleri Sil",
        confirmDelete: "Seçili dosyaları silmek istediğinizden emin misiniz?",
        confirmDeleteSingle: "Bu dosyayı silmek istediğinizden emin misiniz?",
        fileDeleted: "Dosya silindi!",
        filesDeleted: "dosya silindi!",
        fileUploaded: "Dosya yüklendi!",
        copyUrl: "URL Kopyala",
        urlCopied: "URL kopyalandı!",
        noFiles: "Henüz dosya yüklenmemiş",
        noFilesDesc: "Dosya yüklemek için yukarıdaki alana sürükleyin veya butona tıklayın.",
        delete: "Sil",
        view: "Görüntüle",
    },
    EN: {
        pageTitle: "Media Library",
        pageDesc: "Manage images and files",
        filter: "Filter",
        uploadFile: "Upload File",
        files: "files",
        selected: "selected",
        dragAndDrop: "Drag and drop files here",
        orSelect: "or select from your computer",
        selectFile: "Select File",
        supportedFormats: "Supported formats: JPG, PNG, GIF, WEBP, SVG, PDF (Max: 10MB)",
        uploading: "Uploading...",
        deleteSelected: "Delete Selected",
        confirmDelete: "Are you sure you want to delete the selected files?",
        confirmDeleteSingle: "Are you sure you want to delete this file?",
        fileDeleted: "File deleted!",
        filesDeleted: "files deleted!",
        fileUploaded: "File uploaded!",
        copyUrl: "Copy URL",
        urlCopied: "URL copied!",
        noFiles: "No files uploaded yet",
        noFilesDesc: "Drag files above or click the button to upload.",
        delete: "Delete",
        view: "View",
    }
};

export default function MediaLibraryPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const res = await fetch('/api/dashboard/media');
            const data = await res.json();
            setMediaFiles(data.mediaFiles || []);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);

        for (const file of acceptedFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/dashboard/media', {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    setSuccessMessage(t.fileUploaded);
                    setTimeout(() => setSuccessMessage(""), 3000);
                }
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }

        fetchMedia();
        setUploading(false);
    }, [t.fileUploaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
            'application/pdf': ['.pdf'],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handleFileSelect = (id: number) => {
        setSelectedFiles((prev) =>
            prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.confirmDeleteSingle)) return;

        try {
            const res = await fetch(`/api/dashboard/media?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage(t.fileDeleted);
                fetchMedia();
                setSelectedFiles(prev => prev.filter(fid => fid !== id));
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedFiles.length === 0) return;
        if (!confirm(t.confirmDelete)) return;

        for (const id of selectedFiles) {
            try {
                await fetch(`/api/dashboard/media?id=${id}`, { method: 'DELETE' });
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }

        setSuccessMessage(`${selectedFiles.length} ${t.filesDeleted}`);
        setSelectedFiles([]);
        fetchMedia();
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setSuccessMessage(t.urlCopied);
        setTimeout(() => setSuccessMessage(""), 2000);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImage = (mimeType: string) => mimeType.startsWith('image/');

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
                        {t.pageTitle}
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        {t.pageDesc}
                    </p>
                </div>
                <div className="flex gap-2">
                    {selectedFiles.length > 0 && (
                        <button
                            onClick={handleDeleteSelected}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            {t.deleteSelected} ({selectedFiles.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* View Toggle & Stats */}
            <div className="mb-4 flex items-center justify-between rounded-lg bg-[#111418] border border-[#3b4754] p-4">
                <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-400">
                        <span className="font-bold text-white">{mediaFiles.length}</span> {t.files}
                    </p>
                    {selectedFiles.length > 0 && (
                        <p className="text-sm text-gray-400">
                            <span className="font-bold text-[#137fec]">{selectedFiles.length}</span> {t.selected}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex h-8 w-8 items-center justify-center rounded ${viewMode === "grid"
                            ? "bg-[#137fec] text-white"
                            : "bg-[#1c2127] text-gray-400 hover:bg-[#283039]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex h-8 w-8 items-center justify-center rounded ${viewMode === "list"
                            ? "bg-[#137fec] text-white"
                            : "bg-[#1c2127] text-gray-400 hover:bg-[#283039]"
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`mb-6 rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all ${isDragActive
                        ? 'border-[#137fec] bg-[#137fec]/10'
                        : 'border-[#3b4754] bg-[#111418] hover:border-[#137fec]/50'
                    }`}
            >
                <input {...getInputProps()} />
                <span className="material-symbols-outlined mb-4 text-5xl text-gray-500">
                    {uploading ? 'sync' : 'cloud_upload'}
                </span>
                <h3 className="mb-2 text-lg font-bold text-white">
                    {uploading ? t.uploading : t.dragAndDrop}
                </h3>
                <p className="mb-4 text-sm text-gray-400">{t.orSelect}</p>
                <button
                    className="rounded-lg bg-[#137fec] px-6 py-2 text-sm font-medium text-white hover:bg-[#137fec]/90"
                    disabled={uploading}
                >
                    {t.selectFile}
                </button>
                <p className="mt-4 text-xs text-gray-500">{t.supportedFormats}</p>
            </div>

            {/* Media Grid/List */}
            {mediaFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-[#111418] rounded-xl border border-[#3b4754] p-12">
                    <span className="material-symbols-outlined text-6xl mb-4">folder_open</span>
                    <p className="text-lg font-medium text-gray-300">{t.noFiles}</p>
                    <p className="text-sm">{t.noFilesDesc}</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {mediaFiles.map((file) => (
                        <div
                            key={file.id}
                            className={`group relative cursor-pointer overflow-hidden rounded-lg border transition-all ${selectedFiles.includes(file.id)
                                ? "border-[#137fec] ring-2 ring-[#137fec]/20"
                                : "border-[#3b4754] hover:border-[#137fec]/50"
                                }`}
                            onClick={() => handleFileSelect(file.id)}
                        >
                            <div className="aspect-square bg-[#1c2127]">
                                {isImage(file.mimeType) ? (
                                    <img
                                        src={file.url}
                                        alt={file.originalName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-gray-500">
                                            description
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#111418] p-3">
                                <p className="truncate text-sm font-medium text-white">{file.originalName}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                            {/* Actions Overlay */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                                    className="p-1.5 bg-black/60 rounded text-white hover:bg-black/80"
                                    title={t.copyUrl}
                                >
                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); window.open(file.url, '_blank'); }}
                                    className="p-1.5 bg-black/60 rounded text-white hover:bg-black/80"
                                    title={t.view}
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                    className="p-1.5 bg-red-600/80 rounded text-white hover:bg-red-600"
                                    title={t.delete}
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                            {/* Checkbox */}
                            <div className="absolute left-2 top-2">
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.includes(file.id)}
                                    onChange={() => handleFileSelect(file.id)}
                                    className="h-5 w-5 rounded border-gray-300 text-[#137fec] focus:ring-[#137fec]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-[#3b4754] bg-[#111418]">
                    <table className="w-full">
                        <thead className="bg-[#1c2127]">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-[#137fec]"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedFiles(mediaFiles.map(f => f.id));
                                            } else {
                                                setSelectedFiles([]);
                                            }
                                        }}
                                        checked={selectedFiles.length === mediaFiles.length && mediaFiles.length > 0}
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                    {language === 'TR' ? 'Dosya Adı' : 'File Name'}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                    {language === 'TR' ? 'Boyut' : 'Size'}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                    {language === 'TR' ? 'Tür' : 'Type'}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                                    {language === 'TR' ? 'Tarih' : 'Date'}
                                </th>
                                <th className="w-32 px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {mediaFiles.map((file) => (
                                <tr key={file.id} className="hover:bg-white/5">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(file.id)}
                                            onChange={() => handleFileSelect(file.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#137fec]"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#1c2127] overflow-hidden">
                                                {isImage(file.mimeType) ? (
                                                    <img src={file.url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-gray-500">description</span>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-white truncate max-w-[200px]">
                                                {file.originalName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {formatFileSize(file.size)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {file.mimeType.split('/')[1].toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {new Date(file.createdAt).toLocaleDateString(language === 'TR' ? 'tr-TR' : 'en-US')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-end">
                                            <button
                                                onClick={() => copyUrl(file.url)}
                                                className="p-1.5 text-gray-400 hover:text-[#137fec]"
                                                title={t.copyUrl}
                                            >
                                                <span className="material-symbols-outlined text-lg">content_copy</span>
                                            </button>
                                            <button
                                                onClick={() => window.open(file.url, '_blank')}
                                                className="p-1.5 text-gray-400 hover:text-[#137fec]"
                                                title={t.view}
                                            >
                                                <span className="material-symbols-outlined text-lg">open_in_new</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-400"
                                                title={t.delete}
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
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
