"use client";

import { useState, useEffect, useCallback } from "react";
import UploadWidget from "@/components/dashboard/media/UploadWidget";
import MediaGrid from "@/components/dashboard/media/MediaGrid";
import ConfirmationModal from "@/components/dashboard/ConfirmationModal";
import ImagePreviewModal from "@/components/dashboard/media/ImagePreviewModal";
import ImageEditorModal from "@/components/dashboard/media/ImageEditorModal";

// Define MediaSidebar locally if not imported? 
// The current `page.tsx` doesn't import MediaSidebar, it implements the UI inline usually?
// Step 3191 lines 212-215 show Sidebar is inline `UploadWidget` etc. 
// Step 3150 tried to use `<MediaSidebar ... />` but Step 3191 shows the file reverted/kept the inline sidebar logic?
// Ah, allow me to check if MediaSidebar exists. Step 3105 summary said "Created MediaSidebar.tsx". 
// But `page.tsx` in Step 3191 doesn't seem to use it.
// I will stick to the existing structure in Step 3191 and just add the missing logic.

interface MediaFile {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
    width?: number;
    height?: number;
    format?: string;
    altText?: string;
}

export default function MediaLibraryPage() {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [cropFile, setCropFile] = useState<MediaFile | null>(null);

    // Categories
    const [activeCategory, setActiveCategory] = useState("hero");
    const categories = [
        { id: 'hero', label: 'Hero / Slider' },
        { id: 'products', label: 'Ürünler' },
        { id: 'gallery', label: 'Galeri' },
        { id: 'services', label: 'Hizmetler' },
        { id: 'templates', label: 'Mail Şablonları' },
        { id: 'icons', label: 'İkon & Logo' },

        { id: 'others', label: 'Diğer' },
        { id: 'trash', label: 'Çöp Kutusu', icon: '🗑️' }
    ];

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'soft_delete' | 'permanent_delete' | 'restore' | 'bulk_delete' | 'empty_trash' | 'restore_all' | null;
        itemId: number | null;
        itemIds?: number[];
        title: string;
        message: string;
        confirmText?: string;
        isDanger: boolean;
    }>({
        isOpen: false,
        type: null,
        itemId: null,
        itemIds: [],
        title: '',
        message: '',
        confirmText: 'Evet, Sil',
        isDanger: false
    });

    const fetchMedia = useCallback(async (isTrash = false) => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const res = await fetch(`/api/dashboard/media?trash=${isTrash}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setMediaFiles(data.mediaFiles || []);
        } catch (error) {
            console.error('Failed to fetch media:', error);
            setErrorMessage('Medya dosyaları yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeCategory === 'trash') {
            fetchMedia(true);
        } else {
            fetchMedia(false);
        }
    }, [activeCategory, fetchMedia]);

    const handleSync = async () => {
        setSyncing(true);
        setErrorMessage(null);
        try {
            const res = await fetch('/api/dashboard/media/sync', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(`Senk: ${data.result.added} yeni, ${data.result.removed || 0} silinen.`);
                fetchMedia(activeCategory === 'trash');
            } else {
                setErrorMessage(data.message || "Senkronizasyon başarısız oldu.");
            }
        } catch (error) {
            console.error("Sync failed:", error);
            setErrorMessage("Senkronizasyon sırasında bir hata oluştu.");
        } finally {
            setSyncing(false);
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    const handleUpload = async (files: File[], folder: string) => {
        if (files.length === 0) return;
        setUploading(true);

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);
                const res = await fetch('/api/dashboard/media', { method: 'POST', body: formData });
                if (res.ok) {
                    setSuccessMessage("Dosya yüklendi.");
                    setTimeout(() => setSuccessMessage(""), 3000);
                }
            } catch (error) {
                console.error('Upload error:', error);
            }
        }
        await fetchMedia(activeCategory === 'trash');
        setUploading(false);
        if (activeCategory !== 'trash') setActiveCategory(folder);
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleAction = (type: 'soft_delete' | 'permanent_delete' | 'restore', id: number) => {
        let title = '';
        let message = '';
        let confirmText = 'Evet, Sil';
        let isDanger = false;

        if (type === 'soft_delete') {
            title = 'Görseli Sil';
            message = 'Bu görseli silmek istediğinizden emin misiniz? Silinen görsel çöp kutusuna taşınacaktır.';
            isDanger = true;
        } else if (type === 'permanent_delete') {
            title = 'Kalıcı Olarak Sil';
            message = 'Bu işlem geri alınamaz! Görsel sunucudan tamamen silinecektir.';
            isDanger = true;
        } else if (type === 'restore') {
            title = 'Geri Yükle';
            message = 'Bu görseli orijinal konumuna geri yüklemek istiyor musunuz?';
            confirmText = 'Geri Yükle';
            isDanger = false;
        }

        setModalConfig({
            isOpen: true,
            type,
            itemId: id,
            title,
            message,
            confirmText,
            isDanger
        });
    };

    const confirmAction = async () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));

        try {
            let res;
            const { type, itemId, itemIds } = modalConfig;

            if (type === 'soft_delete' && itemId) {
                res = await fetch(`/api/dashboard/media?id=${itemId}`, { method: 'DELETE' });
            } else if (type === 'permanent_delete' && itemId) {
                res = await fetch(`/api/dashboard/media?id=${itemId}&force=true`, { method: 'DELETE' });
            } else if (type === 'restore' && itemId) {
                res = await fetch(`/api/dashboard/media/restore?id=${itemId}`, { method: 'POST' });
            } else if (type === 'bulk_delete' && itemIds && itemIds.length > 0) {
                // Bulk delete (soft or permanent based on current category)
                const isTrash = activeCategory === 'trash';
                res = await fetch(`/api/dashboard/media/bulk`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: itemIds, force: isTrash })
                });
            } else if (type === 'empty_trash') {
                res = await fetch(`/api/dashboard/media/empty-trash`, { method: 'DELETE' });
            } else if (type === 'restore_all') {
                res = await fetch(`/api/dashboard/media/restore-all`, { method: 'POST' });
            }

            if (res) {
                const data = await res.json();
                if (data.success) {
                    setSuccessMessage(data.message || 'İşlem başarılı');
                    setTimeout(() => setSuccessMessage(""), 3000);
                    setSelectedIds(new Set()); // Clear selection
                    fetchMedia(activeCategory === 'trash');
                } else {
                    setErrorMessage(data.error || 'İşlem başarısız oldu.');
                    setTimeout(() => setErrorMessage(null), 3000);
                }
            }
        } catch (error) {
            console.error('Action Failed:', error);
            setErrorMessage('İşlem sırasında bir hata oluştu.');
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        const isTrash = activeCategory === 'trash';
        setModalConfig({
            isOpen: true,
            type: 'bulk_delete',
            itemId: null,
            itemIds: Array.from(selectedIds),
            title: isTrash ? 'Seçilenleri Kalıcı Sil' : 'Seçilenleri Sil',
            message: isTrash
                ? `${selectedIds.size} dosyayı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`
                : `${selectedIds.size} dosyayı çöp kutusuna taşımak istediğinizden emin misiniz?`,
            confirmText: 'Evet, Sil',
            isDanger: true
        });
    };

    const handleEmptyTrash = () => {
        const trashCount = mediaFiles.length; // Already filtered for trash in fetch
        if (trashCount === 0) {
            setSuccessMessage('Çöp kutusu zaten boş.');
            setTimeout(() => setSuccessMessage(""), 3000);
            return;
        }
        setModalConfig({
            isOpen: true,
            type: 'empty_trash',
            itemId: null,
            itemIds: [],
            title: 'Çöp Kutusunu Temizle',
            message: `Çöp kutusundaki tüm dosyaları (${trashCount} adet) kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`,
            confirmText: 'Evet, Tümünü Sil',
            isDanger: true
        });
    };

    const handleRestoreAll = () => {
        const trashCount = mediaFiles.length;
        if (trashCount === 0) {
            setSuccessMessage('Çöp kutusu zaten boş.');
            setTimeout(() => setSuccessMessage(""), 3000);
            return;
        }
        setModalConfig({
            isOpen: true,
            type: 'restore_all',
            itemId: null,
            itemIds: [],
            title: 'Tümünü Geri Yükle',
            message: `Çöp kutusundaki tüm dosyaları (${trashCount} adet) geri yüklemek istediğinizden emin misiniz?`,
            confirmText: 'Evet, Geri Yükle',
            isDanger: false
        });
    };

    const getFilteredFiles = () => {
        let filtered = mediaFiles;

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.filename.toLowerCase().includes(q) ||
                f.originalName.toLowerCase().includes(q)
            );
        }

        // 2. Strict Category Logic
        switch (activeCategory) {
            case 'hero':
                filtered = filtered.filter(f => {
                    const isBanner = f.filename.toLowerCase().includes('dashboard-banner');
                    if (isBanner) return false;
                    return f.url.includes('/hero/') || f.filename.toLowerCase().startsWith('hero-');
                });
                break;
            case 'products':
                filtered = filtered.filter(f => f.url.includes('/products/'));
                break;
            case 'gallery':
                filtered = filtered.filter(f =>
                    f.url.includes('/gallery/') ||
                    f.url.includes('/galeri/')
                );
                break;
            case 'services':
                filtered = filtered.filter(f =>
                    f.url.includes('/services/') ||
                    f.url.includes('/hizmetler/')
                );
                break;
            case 'templates':
                filtered = filtered.filter(f =>
                    f.url.includes('/templates/') ||
                    (f.filename.toLowerCase().includes('sablon') || f.filename.toLowerCase().includes('template'))
                );
                break;
            case 'icons':
                filtered = filtered.filter(f =>
                    f.filename.toLowerCase().includes('logo') ||
                    f.filename.toLowerCase().includes('icon') ||
                    f.filename.toLowerCase().includes('favicon') ||
                    f.mimeType === 'image/svg+xml'
                );
                break;
            case 'uploads':
                filtered = filtered.filter(f => f.url.includes('/uploads/'));
                break;
            case 'others':
                filtered = filtered.filter(f => {
                    const isHero = (f.url.includes('/hero/') || f.filename.toLowerCase().startsWith('hero-')) && !f.filename.toLowerCase().includes('dashboard-banner');
                    const isProduct = f.url.includes('/products/');
                    const isGallery = f.url.includes('/gallery/') || f.url.includes('/galeri/');
                    const isService = f.url.includes('/services/') || f.url.includes('/hizmetler/');
                    const isTemplate = f.url.includes('/templates/') || (f.filename.toLowerCase().includes('sablon') || f.filename.toLowerCase().includes('template'));
                    const isIcon = f.filename.toLowerCase().includes('logo') || f.filename.toLowerCase().includes('icon') || f.filename.toLowerCase().includes('favicon') || f.mimeType === 'image/svg+xml';
                    const isUpload = f.url.includes('/uploads/');
                    return !isHero && !isProduct && !isGallery && !isService && !isTemplate && !isIcon && !isUpload;
                });
                break;
        }

        // 3. Sort
        return filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    };

    const filteredFiles = getFilteredFiles();

    return (
        <div className="h-full overflow-hidden flex flex-col lg:flex-row gap-4">

            {/* Left Sidebar (Upload & Settings) */}
            <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <UploadWidget onDrop={handleUpload} uploading={uploading} selectedCategory={activeCategory} />

                {/* Auto Optimization Info */}
                <div className="bg-[#111418] border border-[#3b4754] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-green-400">auto_awesome</span>
                        <span className="text-white font-medium text-sm">Otomatik Optimizasyon</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                            <span>WebP formatına otomatik dönüşüm</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                            <span>%80 kalite sıkıştırma</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>
                            <span>Maks 1920px genişlik</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content (Grid) */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#111418] border border-[#3b4754] rounded-2xl overflow-hidden shadow-2xl">

                {/* Header Area */}
                <div className="p-4 border-b border-[#3b4754] bg-[#111418]">

                    {/* Top Row: Title, Search, Sync, Sort */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">

                        {/* Title & Count */}
                        <div className="flex-shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Medya Kütüphanesi
                                <span className="text-xs font-medium text-gray-400 bg-[#1c2127] px-2 py-0.5 rounded-full border border-[#3b4754]">
                                    {filteredFiles.length}
                                </span>
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Web sitesi görsellerini yönetin</p>
                        </div>

                        {/* Actions: Search, Sort, Sync */}
                        <div className="flex flex-col sm:flex-row gap-3 flex-1 xl:justify-end">
                            {/* Search (Expanded) */}
                            <div className="relative flex-1 sm:max-w-md">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0d1014] border border-[#3b4754] text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:border-[#137fec] outline-none placeholder:text-gray-600"
                                />
                            </div>

                            {/* Sort Button */}
                            <button
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center justify-center gap-2 bg-[#0d1014] border border-[#3b4754] text-gray-300 text-sm font-medium rounded-lg px-3 py-2 hover:bg-[#1c2127] transition-colors whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {sortOrder === 'desc' ? 'sort' : 'swap_vert'}
                                </span>
                                {sortOrder === 'desc' ? 'En Yeni' : 'En Eski'}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Row: Categories (Scrollable, Single Line) */}
                    <div className="flex items-center bg-[#0d1014] p-1.5 rounded-lg border border-[#3b4754] w-full overflow-hidden">
                        <div className="flex overflow-x-auto gap-2 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {categories.filter(c => c.id !== 'uploads').map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setActiveCategory(cat.id); setSelectedIds(new Set()); }}
                                    className={`flex-none px-5 py-2.5 rounded-md text-base whitespace-nowrap font-medium transition-all ${activeCategory === cat.id
                                        ? 'bg-[#137fec] text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center gap-3 mt-3">
                        {/* Select All / Deselect All Button */}
                        {filteredFiles.length > 0 && (
                            <button
                                onClick={() => {
                                    if (selectedIds.size === filteredFiles.length) {
                                        setSelectedIds(new Set());
                                    } else {
                                        setSelectedIds(new Set(filteredFiles.map(f => f.id)));
                                    }
                                }}
                                className="flex items-center gap-2 bg-[#1c2127] border border-[#3b4754] text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#252b33] transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {selectedIds.size === filteredFiles.length ? 'deselect' : 'select_all'}
                                </span>
                                {selectedIds.size === filteredFiles.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                            </button>
                        )}

                        {/* Bulk Delete Button */}
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Seçilenleri Sil ({selectedIds.size})
                            </button>
                        )}

                        {/* Empty Trash Button - Only in trash category */}
                        {activeCategory === 'trash' && filteredFiles.length > 0 && (
                            <button
                                onClick={handleEmptyTrash}
                                className="flex items-center gap-2 bg-red-600/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">delete_forever</span>
                                Çöp Kutusunu Temizle
                            </button>
                        )}

                        {/* Restore All Button - Only in trash category */}
                        {activeCategory === 'trash' && filteredFiles.length > 0 && (
                            <button
                                onClick={handleRestoreAll}
                                className="flex items-center gap-2 bg-green-600/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">restore</span>
                                Tümünü Geri Yükle
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="relative flex-1 overflow-hidden bg-[#111418]">
                    {/* Success Toast */}
                    {successMessage && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#1c2127] border border-[#137fec]/30 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                            <span className="material-symbols-outlined text-[#137fec] text-lg">check_circle</span>
                            <span className="text-sm font-medium">{successMessage}</span>
                        </div>
                    )}

                    {/* Error Toast */}
                    {errorMessage && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-[#1c2127] border border-red-500/30 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                            <span className="text-sm font-medium">{errorMessage}</span>
                        </div>
                    )}

                    <div className="h-full overflow-y-auto p-4 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
                                    <span className="text-sm text-gray-500">Yükleniyor...</span>
                                </div>
                            </div>
                        ) : (
                            <MediaGrid
                                files={filteredFiles}
                                onDelete={(id) => handleAction(activeCategory === 'trash' ? 'permanent_delete' : 'soft_delete', id)}
                                onCopyUrl={(url) => { navigator.clipboard.writeText(url); setSuccessMessage("URL Kopyalandı"); setTimeout(() => setSuccessMessage(""), 2000); }}
                                isTrash={activeCategory === 'trash'}
                                onRestore={(id) => handleAction('restore', id)}
                                onPermanentDelete={(id) => handleAction('permanent_delete', id)}
                                selectedIds={selectedIds}
                                onToggleSelect={(id) => {
                                    const newSet = new Set(selectedIds);
                                    if (newSet.has(id)) {
                                        newSet.delete(id);
                                    } else {
                                        newSet.add(id);
                                    }
                                    setSelectedIds(newSet);
                                }}
                                onPreview={(file) => setPreviewFile(file)}
                            />
                        )}
                    </div>
                </div>
            </main>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                confirmText={modalConfig.confirmText}
                onConfirm={confirmAction}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
            <ImagePreviewModal
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                file={previewFile}
                onCopyUrl={(url) => { navigator.clipboard.writeText(url); setSuccessMessage("URL Kopyalandı"); setTimeout(() => setSuccessMessage(""), 2000); }}
                onDelete={(id) => { setPreviewFile(null); handleAction('soft_delete', id); }}
                onUpdateAltText={async (id, altText) => {
                    const res = await fetch(`/api/dashboard/media/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ altText })
                    });
                    if (res.ok) {
                        setMediaFiles(prev => prev.map(f => f.id === id ? { ...f, altText } : f));
                        setSuccessMessage("Alt text güncellendi");
                        setTimeout(() => setSuccessMessage(""), 2000);
                    }
                }}
                onCrop={(file) => setCropFile(file)}
            />
            <ImageEditorModal
                isOpen={!!cropFile}
                onClose={() => setCropFile(null)}
                file={cropFile}
                onSave={async (file, croppedBlob) => {
                    const formData = new FormData();
                    formData.append('file', croppedBlob, 'cropped.webp');

                    const res = await fetch(`/api/dashboard/media/${file.id}/crop`, {
                        method: 'POST',
                        body: formData
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setMediaFiles(prev => [data.mediaFile, ...prev]);
                        setSuccessMessage("Görsel kırpıldı ve kaydedildi");
                        setTimeout(() => setSuccessMessage(""), 3000);
                    }
                }}
            />
        </div>
    );
}

