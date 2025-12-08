"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/dashboard/DataTable";
import DateFilter, { DateRangeOption } from "@/components/dashboard/DateFilter";
import ConfirmationModal from "@/components/dashboard/ConfirmationModal";
import { filterByDate } from "@/lib/dateFilterUtils";
import * as XLSX from "xlsx-js-style";

interface ContactForm {
    id: number;
    name: string;
    email: string;
    subject: string;
    date: string;
    status: "unread" | "read" | "replied";
}

export default function QuotesPage() {
    const [contactForms, setContactForms] = useState<ContactForm[]>([]);
    const [allContacts, setAllContacts] = useState<ContactForm[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [exporting, setExporting] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isBulkDelete, setIsBulkDelete] = useState(false);

    // Date Filter State
    const [dateRange, setDateRange] = useState<DateRangeOption>("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // Initial Data Fetch
    useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/contacts');
                const data = await res.json();
                if (data.success) {
                    const formatted = data.contacts.map((c: any) => {
                        // Map database status to UI status
                        let uiStatus: "unread" | "read" | "replied" = "unread";
                        if (c.status === "replied") uiStatus = "replied";
                        else if (c.status === "read") uiStatus = "read";
                        // 'new' and anything else maps to 'unread'

                        return {
                            id: c.id,
                            name: c.name,
                            email: c.email,
                            subject: c.company ? `${c.company} (Firma)` : "İletişim Formu",
                            date: new Date(c.createdAt).toLocaleString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }),
                            status: uiStatus
                        };
                    });
                    setAllContacts(formatted);
                }
            } catch (error) {
                console.error("Failed to fetch contacts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, []);

    // Update contactForms when allContacts or date filters change
    useEffect(() => {
        setContactForms(filterByDate(allContacts, "date", dateRange, customStartDate, customEndDate));
    }, [allContacts, dateRange, customStartDate, customEndDate]);

    // Set page title
    useEffect(() => {
        document.title = "Talepler - Federal Gaz";
    }, []);

    const handleBulkDeleteClick = () => {
        setIsBulkDelete(true);
        setShowDeleteModal(true);
    };

    const confirmDeleteAction = async () => {
        if (isBulkDelete) {
            try {
                const res = await fetch('/api/contacts', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: selectedContacts })
                });

                if (res.ok) {
                    setAllContacts(prev => prev.filter(c => !selectedContacts.includes(c.id)));
                    setSelectedContacts([]);
                } else {
                    alert("Silme işlemi başarısız oldu.");
                }
            } catch (error) {
                console.error("Bulk delete failed", error);
                alert("Bir hata oluştu.");
            }
        }
        setShowDeleteModal(false);
    };

    const handleExportExcel = () => {
        setExporting(true);
        try {
            const dataToExport = contactForms.map(form => ({
                "ID": form.id,
                "Ad Soyad": form.name,
                "E-posta": form.email,
                "Konu/Firma": form.subject,
                "Tarih": form.date,
                "Durum": form.status === 'unread' ? 'Okunmadı' : form.status === 'read' ? 'Okundu' : 'Yanıtlandı'
            }));

            const ws = XLSX.utils.json_to_sheet(dataToExport);

            // Auto-width columns
            const colWidths = [
                { wch: 5 },  // ID
                { wch: 20 }, // Name
                { wch: 25 }, // Email
                { wch: 30 }, // Subject
                { wch: 15 }, // Date
                { wch: 15 }  // Status
            ];
            ws['!cols'] = colWidths;

            // Header Style
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_col(C) + "1";
                if (!ws[address]) continue;
                ws[address].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "4F46E5" } },
                    alignment: { horizontal: "center", vertical: "center" }
                };
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Talepler");

            // Add Date Range info to filename
            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `talepler_${dateRange}_${dateStr}.xlsx`);
        } catch (error) {
            console.error("Export error", error);
        } finally {
            setExporting(false);
        }
    };

    const columns: Column<ContactForm>[] = [
        { label: "Ad Soyad", key: "name" },
        { label: "E-posta", key: "email" },
        { label: "Konu / Firma", key: "subject" },
        { label: "Tarih", key: "date" },
        {
            label: "Durum",
            key: "status",
            render: (item: ContactForm) => (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'unread' ? 'bg-red-500/10 text-red-500' :
                    item.status === 'replied' ? 'bg-green-500/10 text-green-500' :
                        'bg-blue-500/10 text-blue-500'
                    }`}>
                    {item.status === 'unread' ? 'Bekliyor' : item.status === 'replied' ? 'Yanıtlandı' : 'İncelendi'}
                </span>
            )
        },
        {
            label: "",
            key: "id",
            sortable: false,
            render: (item: ContactForm) => (
                <Link
                    href={`/dashboard/contacts/${item.id}`}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#137fec]/20 bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec]/20 transition-colors group"
                >
                    <span className="material-symbols-outlined text-xs group-hover:scale-110 transition-transform">visibility</span>
                    <span className="text-[10px] font-bold">Detay</span>
                </Link>
            )
        }
    ];

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Yükleniyor...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Print Header - Only visible during printing */}
            <div className="print-header hidden">
                <img src="/dashboard-logo.png" alt="Federal Gaz" />
                <div className="print-brand">
                    <h2>Federal Gaz</h2>
                    <span style={{ fontSize: '8pt', color: '#666' }}>Teknik ve Tıbbi Gaz Tedarikçiniz</span>
                </div>
                <div className="print-title">
                    <h1>Talepler</h1>
                    <p>Yazdırma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>

            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Talepler
                    </h1>
                    <p className="text-base font-normal leading-normal text-gray-400">
                        Gelen talepleri görüntüleyin ve yönetin.
                    </p>
                </div>
            </div>

            {/* Header with Title, Bulk Actions, Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white">
                        Toplam {allContacts.length} Talep
                    </h2>
                    {selectedContacts.length > 0 && (
                        <button
                            onClick={handleBulkDeleteClick}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base">delete</span>
                            Sil ({selectedContacts.length})
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
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
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 bg-[#137fec] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 no-print"
                    >
                        <span className="material-symbols-outlined">download</span>
                        {exporting ? 'İndiriliyor...' : 'Excel İndir'}
                    </button>

                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors no-print"
                    >
                        <span className="material-symbols-outlined">print</span>
                        Yazdır
                    </button>
                </div>
            </div>

            <div className="bg-[#1c2127] rounded-xl border border-gray-800 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={contactForms}
                    selectable={true}
                    selectedIds={selectedContacts}
                    onSelectionChange={setSelectedContacts}
                />
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                title="Talepleri Sil"
                message={`Seçili ${selectedContacts.length} talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                onConfirm={confirmDeleteAction}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Sil"
                cancelText="Vazgeç"
            />

            {/* Print Footer - Only visible during printing */}
            <div className="print-footer hidden">
                www.federalgaz.com | federal.gaz@hotmail.com | Tel: (0312) 395 35 95
            </div>
        </div>
    );
}
