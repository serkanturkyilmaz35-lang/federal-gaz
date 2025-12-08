"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import Link from "next/link";

interface OrderItem {
    product: string;
    amount: string;
    unit: string;
}

interface OrderSummaryModalProps {
    isOpen: boolean;
    orderId: number;
    orderDetails: {
        name: string;
        company?: string;
        email?: string;
        phone: string;
        address: string;
        notes?: string;
        items: OrderItem[];
    };
    language: "TR" | "EN";
}

const translations = {
    TR: {
        title: "🎉 Siparişiniz Alındı!",
        orderNumber: "Sipariş No",
        saveInfo: "Sipariş numaranızı kaydedin.",
        customerInfo: "Müşteri Bilgileri",
        name: "Ad Soyad",
        company: "Firma",
        email: "E-posta",
        phone: "Telefon",
        address: "Adres",
        notes: "Notlar",
        orderItems: "Sipariş Detayları",
        product: "Ürün",
        amount: "Miktar",
        unit: "Birim",
        homeBtn: "Ana Sayfaya Dön",
        thankYou: "En kısa sürede sizinle iletişime geçeceğiz."
    },
    EN: {
        title: "🎉 Order Received!",
        orderNumber: "Order No",
        saveInfo: "Please save your order number.",
        customerInfo: "Customer Info",
        name: "Name",
        company: "Company",
        email: "Email",
        phone: "Phone",
        address: "Address",
        notes: "Notes",
        orderItems: "Order Details",
        product: "Product",
        amount: "Qty",
        unit: "Unit",
        homeBtn: "Return to Home",
        thankYou: "We will contact you shortly."
    }
};

export default function OrderSummaryModal({
    isOpen,
    orderId,
    orderDetails,
    language
}: OrderSummaryModalProps) {
    const t = translations[language];

    useEffect(() => {
        if (isOpen) {
            // Big confetti burst!
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { x: 0.5, y: 0.4 },
                zIndex: 9999
            });

            setTimeout(() => {
                confetti({ particleCount: 80, angle: 60, spread: 50, origin: { x: 0 }, zIndex: 9999 });
                confetti({ particleCount: 80, angle: 120, spread: 50, origin: { x: 1 }, zIndex: 9999 });
            }, 200);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content - Scrollable */}
            <div className="relative z-10 w-full max-w-md max-h-[95vh] overflow-y-auto animate-fadeIn">
                <div className="rounded-xl bg-white dark:bg-secondary shadow-2xl">
                    {/* Header - Compact */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-center text-white rounded-t-xl">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold">{t.title}</h2>
                    </div>

                    <div className="p-4 space-y-3">
                        {/* Order Number - Compact */}
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.orderNumber}</p>
                            <p className="text-2xl font-black text-primary">#{orderId}</p>
                        </div>

                        {/* Save Info - Compact */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-600 text-lg">info</span>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">{t.saveInfo}</p>
                        </div>

                        {/* Customer Info - Compact Grid */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-sm text-secondary dark:text-white border-b pb-1">{t.customerInfo}</h3>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                <span className="text-gray-500">{t.name}:</span>
                                <span className="text-secondary dark:text-white font-medium truncate">{orderDetails.name}</span>

                                {orderDetails.company && (
                                    <>
                                        <span className="text-gray-500">{t.company}:</span>
                                        <span className="text-secondary dark:text-white font-medium truncate">{orderDetails.company}</span>
                                    </>
                                )}

                                <span className="text-gray-500">{t.phone}:</span>
                                <span className="text-secondary dark:text-white font-medium">{orderDetails.phone}</span>

                                <span className="text-gray-500">{t.address}:</span>
                                <span className="text-secondary dark:text-white font-medium truncate">{orderDetails.address}</span>
                            </div>
                        </div>

                        {/* Order Items - Compact Table */}
                        <div className="space-y-2">
                            <h3 className="font-bold text-sm text-secondary dark:text-white border-b pb-1">{t.orderItems}</h3>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-2 py-1.5 text-left text-gray-600 dark:text-gray-300">{t.product}</th>
                                            <th className="px-2 py-1.5 text-center text-gray-600 dark:text-gray-300">{t.amount}</th>
                                            <th className="px-2 py-1.5 text-center text-gray-600 dark:text-gray-300">{t.unit}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {orderDetails.items.map((item, index) => (
                                            <tr key={index} className="bg-white dark:bg-secondary">
                                                <td className="px-2 py-1.5 text-secondary dark:text-white font-medium">{item.product}</td>
                                                <td className="px-2 py-1.5 text-center text-secondary dark:text-white">{item.amount}</td>
                                                <td className="px-2 py-1.5 text-center text-secondary dark:text-white">{item.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes - Compact */}
                        {orderDetails.notes && (
                            <div>
                                <span className="font-bold text-xs text-secondary dark:text-white">{t.notes}: </span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{orderDetails.notes}</span>
                            </div>
                        )}

                        {/* Thank you */}
                        <p className="text-center text-gray-500 dark:text-gray-400 text-xs">{t.thankYou}</p>

                        {/* Home Button */}
                        <Link
                            href="/"
                            className="block w-full text-center rounded-lg bg-gradient-to-r from-primary to-primary/80 py-3 font-bold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg">home</span>
                                {t.homeBtn}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes fadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.2s ease-out;
                    }
                `
            }} />
        </div>
    );
}
