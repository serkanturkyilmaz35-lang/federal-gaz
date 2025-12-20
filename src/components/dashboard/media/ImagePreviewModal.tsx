"use client";

import { useState, useEffect } from "react";

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

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: MediaFile | null;
    onCopyUrl: (url: string) => void;
    onDelete: (id: number) => void;
    onUpdateAltText?: (id: number, altText: string) => void;
    onCrop?: (file: MediaFile) => void;
}

export default function ImagePreviewModal({ isOpen, onClose, file, onCopyUrl, onDelete, onUpdateAltText, onCrop }: ImagePreviewModalProps) {
    const [altText, setAltText] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (file) {
            setAltText(file.altText || "");
            setSaved(false);
        }
    }, [file]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose]);

    if (!isOpen || !file) return null;

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSaveAltText = async () => {
        if (!onUpdateAltText) return;
        setSaving(true);
        try {
            await onUpdateAltText(file.id, altText);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            console.error("Failed to save alt text");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#111418] border border-[#3b4754] rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b4754] bg-[#1c2127]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#137fec]">image</span>
                        <div>
                            <h3 className="text-white font-medium text-sm truncate max-w-md" title={file.originalName}>
                                {file.originalName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                {file.format && (
                                    <span className={`uppercase px-1.5 py-0.5 rounded text-[10px] font-medium ${file.format === 'webp' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {file.format}
                                    </span>
                                )}
                                {file.width && file.height && (
                                    <span>{file.width}×{file.height}</span>
                                )}
                                <span>•</span>
                                <span>{formatSize(file.size)}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#283039] rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                {/* Image Preview */}
                <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#0d1014] p-4">
                    {file.mimeType.startsWith('image/') ? (
                        <img
                            src={file.url}
                            alt={file.altText || file.originalName}
                            className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="text-center text-gray-400">
                            <span className="material-symbols-outlined text-6xl mb-2">description</span>
                            <p>Bu dosya önizlenemez</p>
                        </div>
                    )}
                </div>

                {/* Footer - Alt Text & Actions */}
                <div className="px-4 py-3 border-t border-[#3b4754] bg-[#1c2127] space-y-3">
                    {/* Alt Text Input */}
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">
                            Alt Text (SEO İçin)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={altText}
                                onChange={(e) => setAltText(e.target.value)}
                                placeholder="Görselin açıklamasını yazın..."
                                className="flex-1 px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:border-[#137fec] outline-none"
                            />
                            <button
                                onClick={handleSaveAltText}
                                disabled={saving || altText === (file.altText || "")}
                                className="px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-medium hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                ) : saved ? (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                ) : (
                                    <span className="material-symbols-outlined text-sm">save</span>
                                )}
                                {saved ? "Kaydedildi" : "Kaydet"}
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onCopyUrl(file.url)}
                                className="flex items-center gap-2 px-3 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg text-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                                URL Kopyala
                            </button>
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg text-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                Yeni Sekmede Aç
                            </a>
                            {file.mimeType.startsWith('image/') && onCrop && (
                                <button
                                    onClick={() => { onClose(); onCrop(file); }}
                                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors border border-purple-500/30"
                                >
                                    <span className="material-symbols-outlined text-sm">crop</span>
                                    Kırp
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => onDelete(file.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors border border-red-500/30"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
