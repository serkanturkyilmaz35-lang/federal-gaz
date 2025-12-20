"use client";

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

interface MediaGridProps {
    files: MediaFile[];
    onDelete: (id: number, url: string) => void;
    onCopyUrl: (url: string) => void;
    isTrash?: boolean;
    onRestore?: (id: number) => void;
    onPermanentDelete?: (id: number) => void;
    selectedIds?: Set<number>;
    onToggleSelect?: (id: number) => void;
    onPreview?: (file: MediaFile) => void;
}

export default function MediaGrid({ files, onDelete, onCopyUrl, isTrash = false, onRestore, onPermanentDelete, selectedIds, onToggleSelect, onPreview }: MediaGridProps) {
    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                    {isTrash ? 'delete_outline' : 'image_not_supported'}
                </span>
                <p>{isTrash ? 'Çöp kutusu boş.' : 'Görüntülenecek medya bulunamadı.'}</p>
            </div>
        );
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
                <div key={file.id} className={`group bg-[#111418] border rounded-xl overflow-hidden hover:border-[#137fec]/50 transition-all hover:shadow-lg hover:shadow-[#137fec]/5 relative ${selectedIds?.has(file.id) ? 'border-[#137fec] ring-2 ring-[#137fec]/30' : 'border-[#3b4754]'}`}>
                    {/* Selection Checkbox */}
                    {onToggleSelect && (
                        <button
                            onClick={() => onToggleSelect(file.id)}
                            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds?.has(file.id) ? 'bg-[#137fec] border-[#137fec]' : 'bg-black/40 border-white/40 opacity-0 group-hover:opacity-100'}`}
                        >
                            {selectedIds?.has(file.id) && (
                                <span className="material-symbols-outlined text-white text-lg">check</span>
                            )}
                        </button>
                    )}
                    {/* Image Area - Click to Preview */}
                    <div
                        className="aspect-[4/3] bg-[#0d1014] relative overflow-hidden flex items-center justify-center cursor-pointer"
                        onClick={() => onPreview?.(file)}
                    >
                        {file.mimeType.startsWith('image/') ? (
                            <img
                                src={file.url}
                                alt={file.altText || file.originalName}
                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isTrash ? 'grayscale opacity-70' : ''}`}
                                loading="lazy"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-5xl text-gray-600">description</span>
                        )}

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            {isTrash ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onRestore?.(file.id); }}
                                        className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg backdrop-blur-md transition-colors border border-green-500/20"
                                        title="Geri Yükle"
                                    >
                                        <span className="material-symbols-outlined text-xl">restore_from_trash</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(file.id); }}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg backdrop-blur-md transition-colors border border-red-500/20"
                                        title="Kalıcı Olarak Sil"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete_forever</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onCopyUrl(file.url); }}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-md transition-colors"
                                        title="URL Kopyala"
                                    >
                                        <span className="material-symbols-outlined text-xl">content_copy</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onPreview?.(file); }}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-md transition-colors"
                                        title="Önizle"
                                    >
                                        <span className="material-symbols-outlined text-xl">visibility</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(file.id, file.url); }}
                                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg backdrop-blur-md transition-colors border border-red-500/20"
                                        title="Sil"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="p-3">
                        <p className="text-white text-sm font-medium truncate mb-1" title={file.originalName}>
                            {file.originalName}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                            <div className="flex items-center gap-1.5">
                                {/* Format Badge */}
                                {file.format && (
                                    <span className={`uppercase px-1.5 py-0.5 rounded text-[10px] font-medium ${file.format === 'webp' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {file.format}
                                    </span>
                                )}
                                {/* Dimensions */}
                                {file.width && file.height && (
                                    <span className="text-gray-500">{file.width}×{file.height}</span>
                                )}
                            </div>
                            <span className="bg-[#1c2127] px-1.5 py-0.5 rounded border border-[#3b4754]">
                                {formatSize(file.size)}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
