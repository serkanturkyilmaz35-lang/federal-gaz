"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import DataTable, { Column } from "@/components/dashboard/DataTable";
import * as XLSX from "xlsx";
import DateFilter, { DateRangeOption } from "@/components/dashboard/DateFilter";
import { filterByDate } from "@/lib/dateFilterUtils";
import CancellationModal from "@/components/dashboard/CancellationModal";

// Set page title
const PAGE_TITLE = "Siparişler";

// Order status types
type OrderStatus = "PENDING" | "PREPARING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

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
    rawDetails?: any; // Keep raw for detailed view if needed
    userId: number | null;
}

export default function OrdersPage() {

    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    const [exporting, setExporting] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cancellation Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Search & Filter State
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("q") || ""; // Read from URL

    // Removed local searchTerm state [const [searchTerm, setSearchTerm] = useState("");]

    const [dateRange, setDateRange] = useState<DateRangeOption>("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // Fetch Orders
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                const mappedOrders: Order[] = data.orders.map((o: any) => {
                    const details = o.details;
                    let customerName = "Bilinmiyor";
                    let customerEmail = "-";
                    let customerPhone = "-";
                    let address = "-";
                    let products = "-";
                    let notes = "-";

                    // Logic to extract data from JSON vs Legacy String
                    if (details.customer) {
                        // NEW JSON FORMAT
                        customerName = details.customer.name || "-";
                        customerEmail = details.customer.email || "-";
                        customerPhone = details.customer.phone || "-";
                        address = details.customer.address || "-";
                        notes = details.notes || "";

                        if (Array.isArray(details.items)) {
                            products = details.items.map((i: any) => `${i.product} (${i.amount} ${i.unit})`).join(', ');
                        }
                    } else if (details.raw) {
                        // LEGACY STRING FORMAT
                        // Parse manually: "Müşteri: Ahmet\n..."
                        const lines = details.raw.split('\n');
                        const map: any = {};
                        lines.forEach((l: string) => {
                            const parts = l.split(':');
                            if (parts.length >= 2) {
                                map[parts[0].trim()] = parts.slice(1).join(':').trim();
                            }
                        });
                        customerName = map['Müşteri'] || "-";
                        customerEmail = map['E-posta'] || "-";
                        customerPhone = map['Telefon'] || "-";
                        address = map['Adres'] || "-";
                        products = `${map['Ürün'] || ''} ${map['Miktar'] || ''}`;
                        notes = map['Notlar'] || "";
                    } else {
                        // Fallback mechanism if details has direct properties (unlikely based on my code, but safe)
                        customerName = details.name || "-";
                    }

                    // Format Date Manually to ensure DD.MM.YYYY consistency
                    const d = new Date(o.createdAt);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const formattedDate = `${day}.${month}.${year}`;

                    return {
                        id: o.id,
                        orderNumber: `#${10000 + o.id}`,
                        customerName,
                        customerEmail,
                        customerPhone,
                        address,
                        products,
                        notes,
                        date: formattedDate,
                        status: o.status,
                        rawDetails: details,
                        userId: o.userId
                    };
                });
                setOrders(mappedOrders);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Set page title
    useEffect(() => {
        document.title = `${PAGE_TITLE} - Federal Gaz`;
    }, []);



    const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
        { value: "PENDING", label: "Beklemede", color: "bg-yellow-500/10 text-yellow-500" },
        { value: "PREPARING", label: "Hazırlanıyor", color: "bg-blue-500/10 text-blue-500" },
        { value: "SHIPPING", label: "Yola Çıktı", color: "bg-purple-500/10 text-purple-500" },
        { value: "COMPLETED", label: "Tamamlandı", color: "bg-green-500/10 text-green-500" },
        { value: "CANCELLED", label: "İptal Edildi", color: "bg-red-500/10 text-red-500" },
    ];

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        // Intercept CANCELLED status to show modal
        if (newStatus === "CANCELLED") {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                setOrderToCancel(order);
                setShowCancelModal(true);
            }
            return;
        }

        setUpdatingOrderId(orderId);
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                );
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleCancelOrder = async (reason: string, note: string) => {
        if (!orderToCancel) return;

        setIsCancelling(true);
        try {
            const response = await fetch(`/api/orders/${orderToCancel.id}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason, note }),
            });

            if (response.ok) {
                setOrders((prev) =>
                    prev.map((order) =>
                        order.id === orderToCancel.id ? { ...order, status: "CANCELLED" } : order
                    )
                );
                setShowCancelModal(false);
                setOrderToCancel(null);
            } else {
                const errorData = await response.json();
                console.error("Failed to cancel order:", errorData);
                alert(`İptal hatası: ${errorData.error || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert('İptal işlemi sırasında bir hata oluştu');
        } finally {
            setIsCancelling(false);
        }
    };

    // Filter Logic
    // Filter Logic
    const dateFilteredOrders = filterByDate(orders, "date", dateRange, customStartDate, customEndDate);

    // Apply Search Filter using Turkish Locale
    const filteredOrders = dateFilteredOrders.filter((order) => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLocaleLowerCase('tr-TR');
        return (
            order.orderNumber.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            order.customerName.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            order.customerEmail.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            order.products.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            (order.customerPhone || "").toLocaleLowerCase('tr-TR').includes(lowerTerm)
        );
    });

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const XLSX = await import("xlsx-js-style");
            // Use filteredOrders for export
            const exportData = filteredOrders.map((order) => {
                // Use products string or reconstruct from rawDetails if available/needed
                // order.products is already a formatted string in fetchOrders

                return {
                    "Sipariş No": order.orderNumber,
                    "Müşteri": order.customerName,
                    "Üyelik": order.userId ? "ÜYE" : "MİSAFİR",
                    "E-posta": order.customerEmail,
                    "Telefon": order.customerPhone,
                    "Ürünler": order.products,
                    "Notlar": order.notes || "-",
                    "Tarih": order.date,
                    "Durum": getStatusLabel(order.status),
                };
            });

            const columnWidths = [
                { wch: 12 }, // Sipariş No
                { wch: 20 }, // Müşteri
                { wch: 12 }, // Üyelik
                { wch: 25 }, // E-posta
                { wch: 15 }, // Telefon
                { wch: 50 }, // Ürünler
                { wch: 30 }, // Notlar
                { wch: 12 }, // Tarih
                { wch: 12 }, // Durum
            ];

            const wb = XLSX.utils.book_new();
            const title = "Federal Gaz Sipariş Raporu";
            const sheetName = "Siparişler";
            const ws = XLSX.utils.aoa_to_sheet([
                [{ v: title, s: { font: { bold: true, sz: 14 } } }],
                [{ v: `Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")}`, s: { font: { bold: true } } }],
                // Add Date Range Info to Report
                [{ v: `Filtre: ${dateRange === 'custom' ? `${customStartDate} - ${customEndDate}` : dateRange}`, s: { font: { italic: true } } }],
                []
            ]);

            // Note: origin bumped to A5 because of added filter row
            XLSX.utils.sheet_add_json(ws, exportData, { origin: "A5", skipHeader: false });

            const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
            const headerRowIndex = 4; // Shifted to 4 (0-indexed) -> Row 5

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

            ws["!cols"] = columnWidths;
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, `federal-gaz-siparisler-${new Date().toISOString().split("T")[0]}.xlsx`);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Excel dışa aktarılırken bir hata oluştu");
        } finally {
            setExporting(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING": return "Beklemede";
            case "PREPARING": return "Hazırlanıyor";
            case "SHIPPING": return "Yolda";
            case "COMPLETED": return "Tamamlandı";
            case "CANCELLED": return "İptal Edildi";
            default: return status;
        }
    };

    const orderColumns: Column<Order>[] = [
        { key: "orderNumber", label: "Sipariş No", sortable: true, searchable: true, width: "w-20" },
        {
            key: "customerName",
            label: "Müşteri",
            sortable: true,
            searchable: true,
            render: (order) => (
                <span className="font-medium text-white">{order.customerName}</span>
            )
        },
        {
            key: "customerPhone",
            label: "Telefon",
            sortable: true,
            searchable: true,
            width: "w-28",
            render: (order) => (
                <span className="text-gray-300 text-xs">{order.customerPhone || "-"}</span>
            )
        },
        {
            key: "userId",
            label: "Üyelik",
            sortable: true,
            width: "w-20",
            render: (order) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${order.userId
                    ? "bg-[#137fec]/10 text-[#137fec] border-[#137fec]/20"
                    : "bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20"
                    }`}>
                    {order.userId ? "ÜYE" : "MİSAFİR"}
                </span>
            ),
            getValue: (order) => order.userId ? "ÜYE" : "MİSAFİR"
        },
        { key: "customerEmail", label: "E-posta", sortable: true, searchable: true },
        {
            key: "products",
            label: "Ürünler",
            sortable: false,
            searchable: true,
            width: "w-64",
            render: (order) => (
                <div className="flex flex-col gap-1 text-xs text-gray-300">
                    {order.rawDetails?.items?.length > 0 ? (
                        order.rawDetails.items.map((item: any, i: number) => (
                            <div key={i}>
                                <span className="text-white font-medium">{item.product}</span> <span className="text-gray-500">({item.amount} {item.unit})</span>
                            </div>
                        ))
                    ) : (
                        <span>{order.products}</span>
                    )}
                </div>
            )
        },
        { key: "date", label: "Tarih", sortable: true },
        {
            key: "status",
            label: "Durum",
            sortable: true,
            searchable: true,
            render: (order) => {
                const statusOptions = [
                    { value: "PENDING", label: "Beklemede", color: "text-amber-500" },
                    { value: "PREPARING", label: "Hazırlanıyor", color: "text-blue-500" },
                    { value: "SHIPPING", label: "Yolda", color: "text-purple-500" },
                    { value: "COMPLETED", label: "Tamamlandı", color: "text-green-500" },
                    { value: "CANCELLED", label: "İptal Edildi", color: "text-red-500" },
                ];
                const currentStatus = statusOptions.find(opt => opt.value === order.status);
                const isCancelled = order.status === "CANCELLED";

                // If cancelled, show read-only status
                if (isCancelled) {
                    return (
                        <span className={`${currentStatus?.color || 'text-white'} font-medium text-xs`}>
                            {currentStatus?.label}
                        </span>
                    );
                }

                return (
                    <div className="relative">
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            onClick={(e) => e.stopPropagation()}
                            className={`appearance-none bg-transparent ${currentStatus?.color || 'text-white'} font-medium text-xs py-2 pr-8 pl-2 focus:outline-none cursor-pointer hover:bg-white/10 rounded-lg transition-colors w-full min-w-[120px]`}
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#1c2127] text-gray-300">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <span className={`material-symbols-outlined text-sm absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${currentStatus?.color || 'text-white'}`}>
                            expand_more
                        </span>
                    </div>
                );
            },
            getValue: (order) => getStatusLabel(order.status)
        },
        {
            key: "actions",
            label: "",
            sortable: false,
            render: (order) => (
                <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#137fec]/20 bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec]/20 transition-colors group"
                >
                    <span className="material-symbols-outlined text-xs group-hover:scale-110 transition-transform">visibility</span>
                    <span className="text-[10px] font-bold">Detay</span>
                </Link>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Print Header - Only visible during printing */}
            <div className="print-header hidden">
                <img src="/dashboard-logo.png" alt="Federal Gaz" />
                <div className="print-brand">
                    <h2>Federal Gaz</h2>
                    <span style={{ fontSize: '8pt', color: '#666' }}>Teknik ve Tıbbi Gaz Tedarikçiniz</span>
                </div>
                <div className="print-title">
                    <h1>Siparişler</h1>
                    <p>Yazdırma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>



            {/* Page Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4 no-print">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                        Siparişler
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Gelen siparişleri görüntüleyin ve yönetin.
                    </p>
                </div>
            </div>

            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-4 lg:px-5 py-3 border-b border-[#3b4754] gap-3">
                    <h1 className="text-xl lg:text-2xl font-bold text-white leading-normal">Toplam {orders.length} Sipariş</h1>
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        {/* Date Filter */}
                        <DateFilter
                            dateRange={dateRange}
                            setDateRange={setDateRange}
                            customStartDate={customStartDate}
                            setCustomStartDate={setCustomStartDate}
                            customEndDate={customEndDate}
                            setCustomEndDate={setCustomEndDate}
                        />

                        <button
                            onClick={handleExportExcel}
                            disabled={exporting || orders.length === 0}
                            className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 text-xs font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 disabled:opacity-50 transition-colors no-print"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {exporting ? "hourglass_empty" : "file_download"}
                            </span>
                            <span className="hidden sm:inline">{exporting ? "İndiriliyor..." : "Dışa Aktar"}</span>
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors no-print"
                        >
                            <span className="material-symbols-outlined text-sm">print</span>
                            <span className="hidden sm:inline">Yazdır</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {isLoading ? (
                        <div className="text-white text-center py-10">Yükleniyor...</div>
                    ) : orders.length === 0 ? (
                        <div className="text-gray-400 text-center py-10">Henüz sipariş bulunmuyor.</div>
                    ) : (
                        <DataTable
                            data={filteredOrders}
                            columns={orderColumns}
                            totalLabel="kayıt"
                        />
                    )}
                </div>
            </div>

            {/* Cancellation Modal */}
            <CancellationModal
                isOpen={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setOrderToCancel(null);
                }}
                onConfirm={handleCancelOrder}
                orderNumber={orderToCancel?.orderNumber || ""}
                loading={isCancelling}
            />

            {/* Print Footer - Only visible during printing */}
            <div className="print-footer hidden">
                www.federalgaz.com | federal.gaz@hotmail.com | Tel: (0312) 395 35 95
            </div>
        </div >
    );
}
