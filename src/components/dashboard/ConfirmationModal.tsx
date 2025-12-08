"use client";

import { useEffect, useState } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Evet, Sil",
    cancelText = "İptal",
    isDanger = true
}: ConfirmationModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            ></div>

            {/* Modal */}
            <div className={`relative w-full max-w-sm rounded-2xl bg-[#1c2127] border border-[#3b4754] shadow-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}>
                <div className="p-6 text-center">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-ull bg-red-500/10 rounded-full font-bold text-2xl ${isDanger ? "text-red-500" : "text-blue-500"}`}>
                        <span className="material-symbols-outlined text-3xl">
                            {isDanger ? "delete" : "info"}
                        </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                    <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="flex-1 rounded-xl border border-[#3b4754] bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-[#3b4754]/50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${isDanger
                                    ? "bg-red-600 hover:bg-red-500 shadow-red-500/20"
                                    : "bg-[#137fec] hover:bg-[#137fec]/90 shadow-[#137fec]/20"
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
