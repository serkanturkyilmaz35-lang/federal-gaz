"use client";

import { useDropzone } from "react-dropzone";
import { useState, useEffect } from "react";

interface UploadProgress {
    file: File;
    status: 'pending' | 'uploading' | 'done' | 'error';
    progress: number;
}

interface UploadWidgetProps {
    onDrop: (files: File[], folder: string) => void;
    uploading: boolean;
    selectedCategory?: string;
}

export default function UploadWidget({ onDrop, uploading, selectedCategory }: UploadWidgetProps) {
    const [selectedFolder, setSelectedFolder] = useState('hero');
    const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Sync folder with parent category when it changes
    useEffect(() => {
        if (selectedCategory && selectedCategory !== 'trash' && selectedCategory !== 'all') {
            // Map 'others' category to 'images' folder
            const folderToSet = selectedCategory === 'others' ? 'images' : selectedCategory;
            setSelectedFolder(folderToSet);
        }
    }, [selectedCategory]);

    const folders = [
        { id: 'hero', label: 'Hero / Slider' },
        { id: 'products', label: 'Ürünler' },
        { id: 'gallery', label: 'Galeri' },
        { id: 'services', label: 'Hizmetler' },
        { id: 'templates', label: 'Mail Şablonları' },
        { id: 'icons', label: 'İkon & Logo' },
        { id: 'images', label: 'Diğer (Genel)' },
    ];

    const handleDrop = async (files: File[]) => {
        if (files.length === 0) return;

        // Initialize queue
        const queue: UploadProgress[] = files.map(file => ({
            file,
            status: 'pending',
            progress: 0
        }));
        setUploadQueue(queue);
        setIsUploading(true);

        // Upload files sequentially
        for (let i = 0; i < files.length; i++) {
            // Update status to uploading
            setUploadQueue(prev => prev.map((item, idx) =>
                idx === i ? { ...item, status: 'uploading', progress: 30 } : item
            ));

            try {
                const formData = new FormData();
                formData.append('file', files[i]);
                formData.append('folder', selectedFolder);

                const res = await fetch('/api/dashboard/media', {
                    method: 'POST',
                    body: formData
                });

                if (res.ok) {
                    setUploadQueue(prev => prev.map((item, idx) =>
                        idx === i ? { ...item, status: 'done', progress: 100 } : item
                    ));
                } else {
                    setUploadQueue(prev => prev.map((item, idx) =>
                        idx === i ? { ...item, status: 'error', progress: 0 } : item
                    ));
                }
            } catch {
                setUploadQueue(prev => prev.map((item, idx) =>
                    idx === i ? { ...item, status: 'error', progress: 0 } : item
                ));
            }
        }

        // Call parent onDrop for refresh
        onDrop(files, selectedFolder);

        // Clear queue after 2 seconds
        setTimeout(() => {
            setUploadQueue([]);
            setIsUploading(false);
        }, 2000);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept: { 'image/*': [], 'application/pdf': [] },
        disabled: isUploading || uploading,
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: true
    });

    const completedCount = uploadQueue.filter(q => q.status === 'done').length;
    const totalCount = uploadQueue.length;

    return (
        <div className="bg-[#111418] border border-[#3b4754] rounded-2xl p-4 relative overflow-hidden group">
            {/* Folder Selection */}
            <div className="mb-3">
                <label className="text-[10px] text-gray-500 font-medium mb-1 block ml-1 uppercase tracking-wider">Yüklenecek Klasör</label>
                <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full bg-[#1c2127] border border-[#3b4754] text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#137fec] transition-all cursor-pointer hover:bg-[#283039]"
                    disabled={isUploading || uploading}
                    onClick={(e) => e.stopPropagation()}
                >
                    {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                </select>
            </div>

            {/* Upload Progress Queue */}
            {uploadQueue.length > 0 && (
                <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Yükleniyor</span>
                        <span>{completedCount}/{totalCount}</span>
                    </div>
                    {uploadQueue.map((item, idx) => (
                        <div key={idx} className="relative">
                            <div className="flex items-center gap-2 text-xs">
                                <span className={`material-symbols-outlined text-sm ${item.status === 'done' ? 'text-green-400' :
                                        item.status === 'error' ? 'text-red-400' :
                                            item.status === 'uploading' ? 'text-blue-400 animate-pulse' :
                                                'text-gray-500'
                                    }`}>
                                    {item.status === 'done' ? 'check_circle' :
                                        item.status === 'error' ? 'error' :
                                            item.status === 'uploading' ? 'sync' : 'schedule'}
                                </span>
                                <span className="text-gray-300 truncate flex-1" title={item.file.name}>
                                    {item.file.name.length > 20 ? item.file.name.slice(0, 20) + '...' : item.file.name}
                                </span>
                            </div>
                            {item.status === 'uploading' && (
                                <div className="mt-1 h-1 bg-[#283039] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#137fec] transition-all duration-300"
                                        style={{ width: `${item.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!isUploading && !uploading && (
                <>
                    <div className="absolute inset-0 border-2 border-dashed border-[#3b4754] rounded-xl m-2 pointer-events-none group-hover:border-[#137fec]/50 transition-colors z-0"></div>

                    <div className="relative z-10 flex flex-col items-center text-center py-2" {...getRootProps()}>
                        <input {...getInputProps()} />

                        <div className="w-12 h-12 rounded-full bg-[#137fec]/10 flex items-center justify-center mb-2 group-hover:bg-[#137fec]/20 transition-colors">
                            <span className="material-symbols-outlined text-[#137fec] text-2xl">cloud_upload</span>
                        </div>

                        <h3 className="text-white font-bold text-sm mb-1">Dosyaları Sürükle & Bırak</h3>
                        <p className="text-gray-400 text-xs mb-4 leading-relaxed px-2">
                            JPG, PNG, PDF (Max 10MB) - Çoklu seçim desteklenir
                        </p>

                        <button
                            disabled={isUploading || uploading}
                            className="bg-[#137fec] text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-[#137fec]/90 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-[140px]"
                        >
                            Dosya Seç
                        </button>
                    </div>
                </>
            )}

            {isDragActive && (
                <div className="absolute inset-0 bg-[#137fec]/90 z-20 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                    <span className="text-white font-bold text-lg animate-pulse">Bırakın!</span>
                </div>
            )}
        </div>
    );
}
