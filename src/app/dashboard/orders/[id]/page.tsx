"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type OrderStatus = "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";

interface OrderDetail {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    products: string;
    notes?: string;
    status: OrderStatus;
    createdAt: string;
}

export default function OrderDetailPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setTimeout(() => {
            setOrder({
                id: parseInt(orderId),
                orderNumber: `#1254${orderId}`,
                customerName: "Ahmet Yılmaz",
                customerEmail: "ahmet@example.com",
                customerPhone: "0532 123 45 67",
                address: "Organize Sanayi Bölgesi 2. Cadde No: 15, Ankara",
                products: "Oksijen Tüpü (50L) x 2, Argon Tüpü (40L) x 1",
                notes: "Sabah 09:00-12:00 arası teslimat tercih edilmektedir.",
                status: "PENDING",
                createdAt: "15.12.2024 14:30",
            });
            setLoading(false);
        }, 300);
    }, [orderId]);

    const statusOptions: { value: OrderStatus; label: string; color: string; bgColor: string }[] = [
        { value: "PENDING", label: "Beklemede", color: "text-blue-400", bgColor: "bg-blue-500/20" },
        { value: "PREPARING", label: "Hazırlanıyor", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
        { value: "DELIVERED", label: "Teslim Edildi", color: "text-green-400", bgColor: "bg-green-500/20" },
        { value: "CANCELLED", label: "İptal Edildi", color: "text-red-400", bgColor: "bg-red-500/20" },
    ];

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order) return;
        setUpdating(true);
        setError("");

        try {
            const response = await fetch(`/api/orders/${order.id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setOrder({ ...order, status: newStatus });
            } else {
                setError("Durum güncellenirken bir hata oluştu");
            }
        } catch {
            setError("Bir hata oluştu");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white">Yükleniyor...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-400">Sipariş bulunamadı</div>
            </div>
        );
    }

    const currentStatus = statusOptions.find((s) => s.value === order.status);

    return (
        <div className="max-w-5xl mx-auto">
            {/* Compact Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/orders" className="text-[#9dabb9] hover:text-white">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-xl font-bold text-white">Sipariş {order.orderNumber}</h1>
                    <span className="text-sm text-[#9dabb9]">• {order.createdAt}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm ${currentStatus?.bgColor} ${currentStatus?.color} font-medium`}>
                    {currentStatus?.label}
                </div>
            </div>

            {error && (
                <div className="mb-3 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Compact Grid Layout */}
            <div className="bg-[#111418] rounded-xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    {/* Customer Info - Inline */}
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">Müşteri</p>
                        <p className="text-white font-medium text-sm">{order.customerName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">E-posta</p>
                        <p className="text-white text-sm">{order.customerEmail}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">Telefon</p>
                        <p className="text-white text-sm">{order.customerPhone}</p>
                    </div>
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">Adres</p>
                        <p className="text-white text-sm">{order.address}</p>
                    </div>
                </div>

                <hr className="border-[#3b4754] mb-4" />

                {/* Products & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                        <p className="text-xs text-[#9dabb9] mb-1">Ürünler</p>
                        <p className="text-white text-sm">{order.products}</p>
                    </div>
                    {order.notes && (
                        <div>
                            <p className="text-xs text-[#9dabb9] mb-1">Notlar</p>
                            <p className="text-white text-sm italic">{order.notes}</p>
                        </div>
                    )}
                </div>

                <hr className="border-[#3b4754] mb-4" />

                {/* Status Update - Compact */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-white">Durum Güncelle</p>
                        <p className="text-xs text-[#9dabb9]">Durum değişince müşteriye mail gider</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                            <button
                                key={status.value}
                                onClick={() => handleStatusChange(status.value)}
                                disabled={updating || order.status === status.value}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${order.status === status.value
                                    ? `${status.bgColor} ${status.color} ring-2 ring-white/30`
                                    : `${status.bgColor} ${status.color} opacity-60 hover:opacity-100`
                                    } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
