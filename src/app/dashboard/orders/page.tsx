"use client";

import { useState } from "react";

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data
    const orders = [
        {
            id: 1,
            orderNumber: "ORD-2024-0001",
            customer: "Ali Yılmaz",
            company: "ABC Ltd.",
            status: "delivered",
            total: "15,450",
            date: "2024-12-01",
        },
        {
            id: 2,
            orderNumber: "ORD-2024-0002",
            customer: "Ayşe Demir",
            company: "XYZ A.Ş.",
            status: "processing",
            total: "8,200",
            date: "2024-12-02",
        },
        {
            id: 3,
            orderNumber: "ORD-2024-0003",
            customer: "Mehmet Kaya",
            company: "DEF Şirketi",
            status: "pending",
            total: "22,750",
            date: "2024-12-03",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case "processing":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "cancelled":
                return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "delivered":
                return "Teslim Edildi";
            case "processing":
                return "İşleniyor";
            case "pending":
                return "Beklemede";
            case "cancelled":
                return "İptal";
            default:
                return status;
        }
    };

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#292828] dark:text-white">
                        Sipariş Yönetimi
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#94847c]">
                        Tüm siparişleri görüntüleyin ve yönetin
                    </p>
                </div>
                <button className="flex h-10 items-center gap-2 rounded-lg bg-[#b13329] px-4 text-white hover:bg-[#b13329]/90">
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span className="text-sm font-medium">Rapor İndir</span>
                </button>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="material-symbols-outlined text-[#94847c]">
                            search
                        </span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none focus:ring-2 focus:ring-[#b13329]/20 dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white"
                        placeholder="Sipariş ara..."
                    />
                </div>
                <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white">
                    <option value="all">Tüm Durumlar</option>
                    <option value="pending">Beklemede</option>
                    <option value="processing">İşleniyor</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal</option>
                </select>
                <input
                    type="date"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#292828] focus:border-[#b13329] focus:outline-none dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white"
                />
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-lg border border-gray-300 dark:border-[#3b4754]">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-[#283039]">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Sipariş No
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Müşteri
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Şirket
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Tutar
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-[#292828] dark:text-white">
                                Tarih
                            </th>
                            <th className="w-24 px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1c2127]">
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="border-t border-gray-200 hover:bg-gray-50 dark:border-[#3b4754] dark:hover:bg-[#283039]"
                            >
                                <td className="px-6 py-4">
                                    <span className="font-mono font-medium text-[#292828] dark:text-white">
                                        {order.orderNumber}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-[#292828] dark:text-white">
                                    {order.customer}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {order.company}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {getStatusText(order.status)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-[#292828] dark:text-white">
                                    ₺{order.total}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#94847c]">
                                    {order.date}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="text-[#94847c] hover:text-[#b13329]"
                                            title="Detay"
                                        >
                                            <span className="material-symbols-outlined">
                                                visibility
                                            </span>
                                        </button>
                                        <button
                                            className="text-[#94847c] hover:text-[#b13329]"
                                            title="Düzenle"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
