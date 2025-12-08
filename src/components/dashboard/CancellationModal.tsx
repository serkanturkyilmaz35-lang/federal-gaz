"use client";

import { useState } from "react";

interface CancellationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, note: string) => void;
    orderNumber: string;
    loading?: boolean;
}

const CANCELLATION_REASONS = [
    { value: "stock", label: "Stok Yetersizliği" },
    { value: "customer", label: "Müşteri Talebi" },
    { value: "delivery", label: "Teslimat Bölgesi Dışı" },
    { value: "duplicate", label: "Mükerrer Sipariş" },
    { value: "other", label: "Diğer" },
];

export default function CancellationModal({
    isOpen,
    onClose,
    onConfirm,
    orderNumber,
    loading = false,
}: CancellationModalProps) {
    const [reason, setReason] = useState("");
    const [note, setNote] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason) return;
        const reasonLabel = CANCELLATION_REASONS.find(r => r.value === reason)?.label || reason;
        onConfirm(reasonLabel, note);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-[#1c2127] rounded-xl border border-gray-700 shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-700 bg-red-500/10">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500 text-2xl">cancel</span>
                        <div>
                            <h2 className="text-lg font-bold text-white">Sipariş İptali</h2>
                            <p className="text-sm text-gray-400">{orderNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Reason Dropdown */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            İptal Nedeni <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#111418] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                        >
                            <option value="">Bir neden seçin...</option>
                            {CANCELLATION_REASONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Optional Note */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Özel Not <span className="text-gray-500">(İsteğe bağlı)</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Müşteriye iletilecek ek açıklama..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#111418] border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
                        />
                    </div>

                    <p className="text-xs text-gray-500">
                        * Müşteriye e-posta ile bildirim gönderilecektir.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-700 bg-[#111418] flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Vazgeç
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason || loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>
                                İptal Ediliyor...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                İptal Et ve Bildir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
