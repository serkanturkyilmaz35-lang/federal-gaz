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
        title: "🎉 Siparişiniz Başarıyla Alındı!",
        orderNumber: "Sipariş Numaranız",
        saveInfo: "Lütfen sipariş numaranızı kaydedin. Size ulaşmamız durumunda bu numara üzerinden işlem yapılacaktır.",
        customerInfo: "Müşteri Bilgileri",
        name: "Ad Soyad",
        company: "Firma",
        email: "E-posta",
        phone: "Telefon",
        address: "Teslimat Adresi",
        notes: "Notlar",
        orderItems: "Sipariş Detayları",
        product: "Ürün",
        amount: "Miktar",
        unit: "Birim",
        homeBtn: "Ana Sayfaya Dön",
        thankYou: "Siparişiniz için teşekkür ederiz. En kısa sürede sizinle iletişime geçeceğiz."
    },
    EN: {
        title: "🎉 Your Order Has Been Received!",
        orderNumber: "Your Order Number",
        saveInfo: "Please save your order number. This number will be used for processing if we need to contact you.",
        customerInfo: "Customer Information",
        name: "Full Name",
        company: "Company",
        email: "Email",
        phone: "Phone",
        address: "Delivery Address",
        notes: "Notes",
        orderItems: "Order Details",
        product: "Product",
        amount: "Amount",
        unit: "Unit",
        homeBtn: "Return to Home",
        thankYou: "Thank you for your order. We will contact you shortly."
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
            const duration = 4000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 9999 };

            function randomInRange(min: number, max: number) {
                return Math.random() * (max - min) + min;
            }

            // Initial big burst
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                zIndex: 9999
            });

            // Continuous smaller bursts
            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) return clearInterval(interval);
                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg my-8 animate-fadeIn">
                <div className="rounded-2xl bg-white dark:bg-secondary shadow-2xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center text-white">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold">{t.title}</h2>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Order Number - Highlighted */}
                        <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t.orderNumber}</p>
                            <p className="text-3xl font-black text-primary">#{orderId}</p>
                        </div>

                        {/* Save Info Message */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 flex items-start gap-2">
                            <span className="material-symbols-outlined text-yellow-600 flex-shrink-0">info</span>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{t.saveInfo}</p>
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-secondary dark:text-white border-b pb-2">{t.customerInfo}</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="text-gray-500 dark:text-gray-400">{t.name}:</div>
                                <div className="text-secondary dark:text-white font-medium">{orderDetails.name}</div>

                                {orderDetails.company && (
                                    <>
                                        <div className="text-gray-500 dark:text-gray-400">{t.company}:</div>
                                        <div className="text-secondary dark:text-white font-medium">{orderDetails.company}</div>
                                    </>
                                )}

                                {orderDetails.email && (
                                    <>
                                        <div className="text-gray-500 dark:text-gray-400">{t.email}:</div>
                                        <div className="text-secondary dark:text-white font-medium">{orderDetails.email}</div>
                                    </>
                                )}

                                <div className="text-gray-500 dark:text-gray-400">{t.phone}:</div>
                                <div className="text-secondary dark:text-white font-medium">{orderDetails.phone}</div>

                                <div className="text-gray-500 dark:text-gray-400">{t.address}:</div>
                                <div className="text-secondary dark:text-white font-medium col-span-1">{orderDetails.address}</div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className="space-y-3">
                            <h3 className="font-bold text-secondary dark:text-white border-b pb-2">{t.orderItems}</h3>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-medium">{t.product}</th>
                                            <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 font-medium">{t.amount}</th>
                                            <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 font-medium">{t.unit}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {orderDetails.items.map((item, index) => (
                                            <tr key={index} className="bg-white dark:bg-secondary">
                                                <td className="px-3 py-2 text-secondary dark:text-white font-medium">{item.product}</td>
                                                <td className="px-3 py-2 text-center text-secondary dark:text-white">{item.amount}</td>
                                                <td className="px-3 py-2 text-center text-secondary dark:text-white">{item.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes if exists */}
                        {orderDetails.notes && (
                            <div className="space-y-2">
                                <h3 className="font-bold text-secondary dark:text-white">{t.notes}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">{orderDetails.notes}</p>
                            </div>
                        )}

                        {/* Thank you message */}
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm italic">{t.thankYou}</p>

                        {/* Home Button */}
                        <Link
                            href="/"
                            className="block w-full text-center rounded-xl bg-gradient-to-r from-primary to-primary/80 py-4 font-bold text-white transition-all hover:from-primary/90 hover:to-primary/70 hover:shadow-lg active:scale-[0.98]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">home</span>
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
                        from { opacity: 0; transform: scale(0.9) translateY(20px); }
                        to { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out;
                    }
                `
            }} />
        </div>
    );
}
