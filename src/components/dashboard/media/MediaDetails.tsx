"use client";

interface MediaFile {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
}

interface MediaDetailsProps {
    file: MediaFile | null;
    onClose: () => void;
    onDelete: (id: number) => void;
    onCopyUrl: (url: string) => void;
}

export default function MediaDetails({ file, onClose, onDelete, onCopyUrl }: MediaDetailsProps) {
    if (!file) {
        return (
            <div className="hidden lg:flex w-80 bg-[#111418] border-l border-[#3b4754] p-6 flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#1c2127] rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-3xl text-gray-600">image</span>
                </div>
                <p className="text-gray-400 text-sm">Görüntülemek için bir dosya seçin</p>
            </div>
        );
    }

    const isSystemFile = !file.url.includes("/uploads/");
    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isImage = file.mimeType.startsWith('image/');

    return (
        <aside className="w-full lg:w-80 bg-[#111418] border-l border-[#3b4754] flex flex-col h-full overflow-y-auto absolute right-0 top-0 z-20 shadow-xl lg:static lg:z-0 lg:shadow-none">
            <div className="p-4 border-b border-[#3b4754] flex items-center justify-between">
                <h3 className="font-semibold text-white">Dosya Detayları</h3>
                <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
                {/* Preview */}
                <div className="aspect-square bg-[#1c2127] rounded-lg border border-[#3b4754] overflow-hidden flex items-center justify-center relative group">
                    {isImage ? (
                        <img
                            src={file.url}
                            alt={file.originalName}
                            className="w-full h-full object-contain p-2"
                        />
                    ) : (
                        <span className="material-symbols-outlined text-6xl text-gray-500">description</span>
                    )}
                </div>

                {/* Info List */}
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Dosya Adı</label>
                        <p className="text-sm text-white break-all font-medium">{file.filename}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Boyut</label>
                            <p className="text-sm text-gray-300">{formatSize(file.size)}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 uppercase font-semibold">Tür</label>
                            <p className="text-sm text-gray-300 uppercase">{file.mimeType.split('/')[1]}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">Tarih</label>
                        <p className="text-sm text-gray-300">
                            {new Date(file.createdAt).toLocaleDateString('tr-TR', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-500 uppercase font-semibold">URL</label>
                        <div className="flex items-center gap-2 bg-[#0d1014] p-2 rounded border border-[#3b4754]">
                            <p className="text-xs text-gray-400 truncate flex-1 select-all">{file.url}</p>
                            <button
                                onClick={() => onCopyUrl(file.url)}
                                className="text-gray-500 hover:text-[#137fec]"
                                title="Kopyala"
                            >
                                <span className="material-symbols-outlined text-xs">content_copy</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-6 flex flex-col gap-2">
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#1c2127] text-white rounded-lg hover:bg-[#283039] transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-lg">open_in_new</span>
                        Tarayıcıda Aç
                    </a>

                    {!isSystemFile ? (
                        <button
                            onClick={() => onDelete(file.id)}
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Dosyayı Sil
                        </button>
                    ) : (
                        <div className="flex items-center justify-center gap-2 py-2.5 bg-gray-800/50 text-gray-500 rounded-lg text-xs border border-gray-700 cursor-not-allowed" title="Sistem dosyası">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Sistem Dosyası Silinemez
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
