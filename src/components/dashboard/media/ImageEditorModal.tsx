"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface MediaFile {
    id: number;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    width?: number;
    height?: number;
}

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: MediaFile | null;
    onSave: (file: MediaFile, croppedImageBlob: Blob) => Promise<void>;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageEditorModal({ isOpen, onClose, file, onSave }: ImageEditorModalProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [saving, setSaving] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect || width / height));
    }, [aspect]);

    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        if (!imgRef.current || !completedCrop) return null;

        const image = imgRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/webp', 0.8);
        });
    }, [completedCrop]);

    const handleSave = async () => {
        if (!file) return;
        setSaving(true);
        try {
            const blob = await getCroppedImg();
            if (blob) {
                await onSave(file, blob);
                onClose();
            }
        } catch (error) {
            console.error('Crop save error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !file) return null;

    const aspectRatios = [
        { label: 'Serbest', value: undefined },
        { label: '1:1', value: 1 },
        { label: '16:9', value: 16 / 9 },
        { label: '4:3', value: 4 / 3 },
        { label: '3:2', value: 3 / 2 },
        { label: '2:3', value: 2 / 3 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#111418] border border-[#3b4754] rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#3b4754] bg-[#1c2127]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#137fec]">crop</span>
                        <h3 className="text-white font-medium">Görsel Kırpma</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#283039] rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-gray-400">close</span>
                    </button>
                </div>

                {/* Aspect Ratio Selection */}
                <div className="px-4 py-2 border-b border-[#3b4754] bg-[#1c2127] flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400">En/Boy Oranı:</span>
                    {aspectRatios.map((ar) => (
                        <button
                            key={ar.label}
                            onClick={() => setAspect(ar.value)}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${aspect === ar.value
                                    ? 'bg-[#137fec] text-white'
                                    : 'bg-[#283039] text-gray-300 hover:bg-[#3b4754]'
                                }`}
                        >
                            {ar.label}
                        </button>
                    ))}
                </div>

                {/* Crop Area */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0d1014]">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        className="max-h-[60vh]"
                    >
                        <img
                            ref={imgRef}
                            src={file.url}
                            alt={file.originalName}
                            onLoad={onImageLoad}
                            className="max-h-[60vh] object-contain"
                            crossOrigin="anonymous"
                        />
                    </ReactCrop>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-[#3b4754] bg-[#1c2127] flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                        Kırpmak istediğiniz alanı seçin, ardındanu Kaydet'e tıklayın.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#283039] text-white rounded-lg text-sm hover:bg-[#3b4754] transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !completedCrop}
                            className="px-4 py-2 bg-[#137fec] text-white rounded-lg text-sm font-medium hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Kırpıp Kaydet
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
