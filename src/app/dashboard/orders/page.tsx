"use client";

import { useState, useMemo } from "react";
import { useOrderNotification } from "@/hooks/useOrderNotification";
import DataTable, { Column } from "@/components/dashboard/DataTable";
import * as XLSX from "xlsx";

// Tab types
type TabType = "orders" | "contacts";

// Order status types - matches database ENUM
type OrderStatus = "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";

interface Order {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    products: string;
    notes?: string;
    date: string;
    status: OrderStatus;
}

interface ContactForm {
    id: number;
    name: string;
    email: string;
    subject: string;
    date: string;
    status: "unread" | "read" | "replied";
}

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState<TabType>("orders");
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [newOrderAlert, setNewOrderAlert] = useState<number | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const [orders, setOrders] = useState<Order[]>([
        { id: 1, orderNumber: "#12548", customerName: "Ahmet Yılmaz", customerEmail: "ahmet@example.com", customerPhone: "0532 123 45 67", address: "Organize Sanayi Bölgesi 2. Cadde No: 15, Ankara", products: "Oksijen Tüpü (50L) x 2, Argon Tüpü (40L) x 1", notes: "Sabah teslim", date: "15.12.2024", status: "PENDING" },
        { id: 2, orderNumber: "#12547", customerName: "Ayşe Kaya", customerEmail: "ayse@example.com", customerPhone: "0533 234 56 78", address: "Sincan Sanayi Sitesi B Blok No: 8, Ankara", products: "Azot Tüpü (40L) x 3", date: "15.12.2024", status: "PREPARING" },
        { id: 3, orderNumber: "#12546", customerName: "Mehmet Demir", customerEmail: "mehmet@example.com", customerPhone: "0534 345 67 89", address: "Ostim OSB 5. Sokak No: 22, Ankara", products: "Oksijen Tüpü (50L) x 5", notes: "Öğleden sonra teslimat", date: "14.12.2024", status: "DELIVERED" },
        { id: 4, orderNumber: "#12545", customerName: "Fatma Çelik", customerEmail: "fatma@example.com", customerPhone: "0535 456 78 90", address: "Amet Sanayi Bölgesi A Blok, Ankara", products: "Argon Tüpü (40L) x 2", date: "14.12.2024", status: "DELIVERED" },
        { id: 5, orderNumber: "#12544", customerName: "Ali Vural", customerEmail: "ali@example.com", customerPhone: "0536 567 89 01", address: "Etimesgut Sanayi Sitesi No: 45, Ankara", products: "Helyum Tüpü (50L) x 1", notes: "Müşteri iptal etti", date: "13.12.2024", status: "CANCELLED" },
    ]);

    // Order notification hook
    useOrderNotification({
        enabled: true,
        onNewOrder: (count) => {
            setNewOrderAlert(count);
            setTimeout(() => setNewOrderAlert(null), 5000);
        },
    });

    // Mock contact forms data
    const contactForms: ContactForm[] = [
        { id: 1, name: "Murat Özkan", email: "murat@example.com", subject: "Fiyat Teklifi", date: "15.12.2024", status: "unread" },
        { id: 2, name: "Zeynep Yıldız", email: "zeynep@company.com", subject: "Teslimat Sorgusu", date: "14.12.2024", status: "read" },
        { id: 3, name: "Can Aksoy", email: "can@firma.com", subject: "Toptan Satış", date: "13.12.2024", status: "replied" },
    ];

    const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
        { value: "PENDING", label: "Beklemede", color: "bg-blue-500/20 text-blue-400" },
        { value: "PREPARING", label: "Hazırlanıyor", color: "bg-yellow-500/20 text-yellow-400" },
        { value: "DELIVERED", label: "Teslim Edildi", color: "bg-green-500/20 text-green-400" },
        { value: "CANCELLED", label: "İptal Edildi", color: "bg-red-500/20 text-red-400" },
    ];

    const getStatusBadge = (status: OrderStatus) => {
        const option = statusOptions.find((o) => o.value === status);
        return (
            <span className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium ${option?.color} `}>
                {option?.label}
            </span>
        );
    };

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        setUpdatingOrderId(orderId);

        try {
            const response = await fetch(`/ api / orders / ${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                // Update local state
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                );
            } else {
                console.error("Failed to update order status");
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getContactStatusBadge = (status: ContactForm["status"]) => {
        const styles = {
            unread: "bg-[#137fec]/20 text-[#137fec]",
            read: "bg-yellow-500/20 text-yellow-400",
            replied: "bg-green-500/20 text-green-400",
        };
        const labels = {
            unread: "Okunmadı",
            read: "Okundu",
            replied: "Yanıtlandı",
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const toggleOrderSelection = (id: number) => {
        setSelectedOrders((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAllOrders = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map((o) => o.id));
        }
    };

    const toggleContactSelection = (id: number) => {
        setSelectedContacts((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleAllContacts = () => {
        if (selectedContacts.length === contactForms.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contactForms.map((c) => c.id));
        }
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const XLSX = await import("xlsx-js-style");

            // Prepare data based on active tab
            let exportData: any[] = [];
            let sheetName = "";
            let title = "";
            let columnWidths: { wch: number }[] = [];

            if (activeTab === "orders") {
                sheetName = "Siparişler";
                title = "FEDERAL GAZ - SİPARİŞ RAPORU";

                const statusLabels: Record<OrderStatus, string> = {
                    PENDING: "Beklemede",
                    PREPARING: "Hazırlanıyor",
                    DELIVERED: "Teslim Edildi",
                    CANCELLED: "İptal Edildi",
                };

                exportData = orders.map((order) => ({
                    "Sipariş No": order.orderNumber,
                    "Müşteri Adı": order.customerName,
                    "E-posta": order.customerEmail,
                    "Telefon": order.customerPhone,
                    "Adres": order.address,
                    "Ürünler": order.products,
                    "Notlar": order.notes || "-",
                    "Tarih": order.date,
                    "Durum": statusLabels[order.status],
                }));

                columnWidths = [
                    { wch: 12 }, // Sipariş No
                    { wch: 18 }, // Müşteri Adı
                    { wch: 22 }, // E-posta
                    { wch: 16 }, // Telefon
                    { wch: 35 }, // Adres
                    { wch: 30 }, // Ürünler
                    { wch: 20 }, // Notlar
                    { wch: 12 }, // Tarih
                    { wch: 14 }, // Durum
                ];
            } else {
                sheetName = "İletişim Formları";
                title = "FEDERAL GAZ - İLETİŞİM FORMU RAPORU";

                exportData = contactForms.map((contact) => ({
                    "ID": contact.id,
                    "Gönderen": contact.name,
                    "E-posta": contact.email,
                    "Konu": contact.subject,
                    "Mesaj": "-", // Mock data doesn't have message body yet
                    "Tarih": contact.date,
                    "Durum": contact.status === "unread" ? "Okunmadı" : contact.status === "read" ? "Okundu" : "Yanıtlandı",
                }));

                columnWidths = [
                    { wch: 6 },  // ID
                    { wch: 20 }, // Gönderen
                    { wch: 25 }, // E-posta
                    { wch: 25 }, // Konu
                    { wch: 30 }, // Mesaj
                    { wch: 12 }, // Tarih
                    { wch: 12 }, // Durum
                ];
            }

            // Create workbook
            const wb = XLSX.utils.book_new();

            // Create worksheet with Title and Date initially
            const ws = XLSX.utils.aoa_to_sheet([
                [{ v: title, s: { font: { bold: true, sz: 14 } } }],
                [{ v: `Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")}`, s: { font: { bold: true } } }],
                [] // Empty row
            ]);

            // Add Data starting from A4
            XLSX.utils.sheet_add_json(ws, exportData, { origin: "A4", skipHeader: false });

            // Apply style to header row (Row 4, index 3)
            const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
            const headerRowIndex = 3; // 0-based index for Row 4

            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
                if (ws[cellRef]) {
                    ws[cellRef].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4F81BD" } },
                        alignment: { horizontal: "center" }
                    };
                }
            }

            // Set column widths
            ws["!cols"] = columnWidths;

            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Download file
            const fileName = activeTab === "orders"
                ? `federal-gaz-siparisler-${new Date().toISOString().split("T")[0]}.xlsx`
                : `federal-gaz-iletisim-${new Date().toISOString().split("T")[0]}.xlsx`;

            XLSX.writeFile(wb, fileName);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Excel dışa aktarılırken bir hata oluştu");
        } finally {
            setExporting(false);
        }
    };

    const orderColumns: Column<Order>[] = [
        { key: "orderNumber", label: "Sipariş No", sortable: true, searchable: true },
        { key: "customerName", label: "Müşteri Adı", sortable: true, searchable: true },
        { key: "customerEmail", label: "E-posta", sortable: true, searchable: true },
        { key: "customerPhone", label: "Telefon", sortable: true, searchable: true },
        { key: "date", label: "Tarih", sortable: true },
        {
            key: "status",
            label: "Durum",
            sortable: true,
            searchable: true,
            getValue: (order) => statusOptions.find(o => o.value === order.status)?.label || order.status,
            render: (order: Order) => (
                <select
                    value={order.status}
                    onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(order.id, e.target.value as OrderStatus);
                    }}
                    disabled={updatingOrderId === order.id}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-[#137fec] ${statusOptions.find((o) => o.value === order.status)?.color
                        } ${updatingOrderId === order.id ? "opacity-50" : ""}`}
                    style={{ backgroundColor: "transparent" }}
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-[#1c2127] text-white">
                            {option.label}
                        </option>
                    ))}
                </select>
            ),
        },
        {
            key: "actions",
            label: "İşlemler",
            sortable: false,
            searchable: false,
            render: (order: Order) => (
                <div className="text-right">
                    <a href={`/dashboard/orders/${order.id}`} className="text-[#137fec] hover:underline text-sm font-bold">
                        Detayları Gör
                    </a>
                </div>
            ),
        },
    ];

    const contactColumns: Column<ContactForm>[] = [
        { key: "name", label: "Ad Soyad", sortable: true, searchable: true },
        { key: "email", label: "E-posta", sortable: true, searchable: true },
        { key: "subject", label: "Konu", sortable: true, searchable: true },
        { key: "date", label: "Tarih", sortable: true },
        {
            key: "status",
            label: "Durum",
            sortable: true,
            searchable: true,
            getValue: (contact) => {
                const labels = {
                    unread: "Okunmadı",
                    read: "Okundu",
                    replied: "Yanıtlandı",
                };
                return labels[contact.status];
            },
            render: (contact: ContactForm) => getContactStatusBadge(contact.status),
        },
        {
            key: "actions",
            label: "İşlemler",
            sortable: false,
            searchable: false,
            render: (contact: ContactForm) => (
                <div className="text-right">
                    <a href={`/dashboard/contacts/${contact.id}`} className="text-[#137fec] hover:underline text-sm font-bold">
                        Detayları Gör
                    </a>
                </div>
            ),
        },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* New Order Alert */}
            {newOrderAlert && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-500/20 px-4 py-3 text-green-400 animate-pulse">
                    <span className="material-symbols-outlined">notifications_active</span>
                    <span className="font-medium">
                        {newOrderAlert} yeni sipariş geldi!
                    </span>
                    <button
                        onClick={() => setNewOrderAlert(null)}
                        className="ml-auto hover:text-white"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
            )}

            {/* Main Card */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-[#3b4754]">
                    <div className="flex px-4 gap-8">
                        <button
                            onClick={() => setActiveTab("orders")}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === "orders"
                                ? "border-b-[#137fec] text-white"
                                : "border-b-transparent text-[#9dabb9] hover:border-b-gray-600"
                                }`}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                                Gelen Siparişler
                            </p>
                        </button>
                        <button
                            onClick={() => setActiveTab("contacts")}
                            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${activeTab === "contacts"
                                ? "border-b-[#137fec] text-white"
                                : "border-b-transparent text-[#9dabb9] hover:border-b-gray-600"
                                }`}
                        >
                            <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                                İletişim Formları
                            </p>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex justify-between items-center gap-2 px-4 py-3 border-b border-[#3b4754]">
                    <div className="flex items-center gap-2">
                        {/* Filters are now handled inside DataTable */}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportExcel}
                            disabled={exporting}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-base">
                                {exporting ? "hourglass_empty" : "file_download"}
                            </span>
                            {exporting ? "İndiriliyor..." : "Dışa Aktar"}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-hidden p-4">
                    {activeTab === "orders" ? (
                        <DataTable
                            data={orders}
                            columns={orderColumns}
                            selectable
                            selectedIds={selectedOrders}
                            onSelectionChange={setSelectedOrders}
                        />
                    ) : (
                        <DataTable
                            data={contactForms}
                            columns={contactColumns}
                            selectable
                            selectedIds={selectedContacts}
                            onSelectionChange={setSelectedContacts}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
