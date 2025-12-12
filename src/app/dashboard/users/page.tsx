"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DataTable, { Column } from "@/components/dashboard/DataTable";
import * as XLSX from "xlsx";
import { useAuth } from "@/context/AuthContext";

import DateFilter, { DateRangeOption } from "@/components/dashboard/DateFilter";
import ConfirmationModal from '@/components/dashboard/ConfirmationModal';
import { filterByDate } from "@/lib/dateFilterUtils";

interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "editor" | "user";
    status: "active" | "inactive";
    joinDate: string;
}

export default function UsersPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [exporting, setExporting] = useState(false);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);

    // Modal & Form
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "user" as User["role"],
        password: "",
        phone: "",
    });

    // Search & Date Filter State
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("q") || "";
    // Removed local searchTerm state

    const [dateRange, setDateRange] = useState<DateRangeOption>("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    // FETCH USERS (unchanged)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                const formattedUsers = data.users.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role || 'user',
                    status: 'active', // Default status for now
                    joinDate: new Date(u.createdAt).toLocaleDateString('tr-TR')
                }));
                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Set page title
    useEffect(() => {
        document.title = "Kullanıcılar - Federal Gaz";
    }, []);

    // ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowModal(false);
                setShowDeleteModal(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Filter Logic
    const dateFilteredUsers = filterByDate(users, "joinDate", dateRange, customStartDate, customEndDate);
    const filteredUsers = dateFilteredUsers.filter((u) => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLocaleLowerCase('tr-TR');
        return (
            u.name.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            u.email.toLocaleLowerCase('tr-TR').includes(lowerTerm)
        );
    });

    const getRoleBadge = (role: User["role"]) => {
        const styles = {
            admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
            editor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            user: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        };
        const labels = {
            admin: "Yönetici",
            editor: "Editör",
            user: "Kullanıcı",
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
                {labels[role]}
            </span>
        );
    };

    const getStatusBadge = (status: User["status"]) => {
        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
            >
                {status === "active" ? "Aktif" : "Pasif"}
            </span>
        );
    };

    const handleNewUserClick = () => {
        setEditingUser(null);
        setFormData({
            name: "",
            email: "",
            role: "editor",
            password: "", // Mandatory for New User
            phone: ""
        });
        setShowModal(true);
    };



    const confirmDeleteAction = () => {
        if (isBulkDelete) {
            handleBulkDelete();
        } else if (itemToDelete) {
            handleDeleteUser(itemToDelete);
        }
        setShowDeleteModal(false);
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setIsBulkDelete(false);
        setShowDeleteModal(true);
    };

    const handleBulkDeleteClick = () => {
        setIsBulkDelete(true);
        setItemToDelete(null);
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async (id: number) => {
        // Confirmation moved to Modal
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
                setSelectedUsers(prev => prev.filter(uid => uid !== id));
            } else {
                alert("Silme işlemi başarısız oldu.");
            }
        } catch (error) {
            console.error("Delete failed", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleBulkDelete = async () => {
        // Confirmation moved to Modal
        try {
            for (const id of selectedUsers) {
                await fetch(`/api/users/${id}`, { method: 'DELETE' });
            }
            setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
            setSelectedUsers([]);
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Toplu silme sırasında bir hata oluştu.");
        }
    };

    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const XLSX = await import("xlsx-js-style");

            const sheetName = "Kullanıcılar";
            const title = "FEDERAL GAZ - KULLANICI LİSTESİ";

            const exportData = filteredUsers.map((user) => ({
                "ID": user.id,
                "Ad Soyad": user.name,
                "E-posta": user.email,
                "Rol": user.role === "admin" ? "Yönetici" : user.role === "editor" ? "Editör" : "Kullanıcı",
                "Durum": user.status === "active" ? "Aktif" : "Pasif",
                "Kayıt Tarihi": user.joinDate,
            }));

            const columnWidths = [
                { wch: 6 },  // ID
                { wch: 20 }, // Ad Soyad
                { wch: 25 }, // E-posta
                { wch: 12 }, // Rol
                { wch: 10 }, // Durum
                { wch: 15 }, // Kayıt Tarihi
            ];

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet([
                [{ v: title, s: { font: { bold: true, sz: 14 } } }],
                [{ v: `Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")}`, s: { font: { bold: true } } }],
                [{ v: `Filtre: ${dateRange === 'custom' ? `${customStartDate} - ${customEndDate}` : dateRange === 'all' ? 'Tüm Zamanlar' : dateRange}`, s: { font: { italic: true } } }],
                []
            ]);

            XLSX.utils.sheet_add_json(ws, exportData, { origin: "A5", skipHeader: false });

            const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
            const headerRowIndex = 4;

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
            XLSX.writeFile(wb, `federal-gaz-kullanicilar-${new Date().toISOString().split("T")[0]}.xlsx`);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Excel dışa aktarılırken bir hata oluştu");
        } finally {
            setExporting(false);
        }
    };

    const columns: Column<User>[] = [
        {
            key: "name",
            label: "Kullanıcı",
            sortable: true,
            searchable: true,
            render: (user) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b13329] text-white font-bold text-sm">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: "role",
            label: "Rol",
            sortable: true,
            searchable: true,
            render: (user) => getRoleBadge(user.role),
        },
        {
            key: "status",
            label: "Durum",
            sortable: true,
            searchable: true,
            render: (user) => getStatusBadge(user.status),
        },
        { key: "joinDate", label: "Kayıt Tarihi", sortable: true },
        {
            key: "actions",
            label: "",
            sortable: false,
            searchable: false,
            render: (user) => (
                <div className="flex items-center justify-end gap-2">
                    {currentUser?.role === 'admin' && (
                        <>
                            <button
                                onClick={() => handleEditClick(user)}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Düzenle"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button
                                onClick={() => handleDeleteClick(user.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Kullanıcıyı Sil"
                            >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </>
                    )}
                </div >
            ),
        }
    ];

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            password: "", // Empty for update unless changing
            phone: "" // Not in table but in model?
        });
        setShowModal(true);
    };

    const handleSaveUser = async () => {
        if (!formData.name || !formData.email) {
            alert("Lütfen zorunlu alanları doldurun.");
            return;
        }

        const dataToSend = { ...formData };
        if (!editingUser) {
            dataToSend.password = "123456"; // Default password
        }

        try {
            let res;
            if (editingUser) {
                res = await fetch(`/api/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                });
            } else {
                res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dataToSend)
                });
            }

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchUsers();
            } else {
                alert("Hata: " + (data.error || "Bilinmeyen hata"));
            }
        } catch (error) {
            alert("İşlem başarısız.");
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-white">
                        Kullanıcılar
                    </h1>
                    <p className="text-base font-normal leading-normal text-gray-400">
                        Kayıtlı kullanıcıları görüntüleyin ve yönetin.
                    </p>
                </div>
            </div>

            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="px-5 py-4 border-b border-[#3b4754] flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white leading-normal">
                            Toplam {filteredUsers.length} Kullanıcı
                        </h2>
                        {selectedUsers.length > 0 && (
                            <button
                                onClick={handleBulkDeleteClick}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">delete</span>
                                Seçilenleri Sil ({selectedUsers.length})
                            </button>
                        )}
                    </div>
                    <div className="flex gap-2 items-center">
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
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-base">
                                {exporting ? "hourglass_empty" : "file_download"}
                            </span>
                            {exporting ? "İndiriliyor..." : "Dışa Aktar"}
                        </button>

                        <button
                            onClick={handleNewUserClick}
                            className="flex items-center gap-2 rounded-lg bg-[#b13329] px-4 py-2 text-white hover:bg-[#b13329]/90 transition-colors ml-2"
                        >
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            <span className="text-sm font-bold">Yeni Kullanıcı</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="p-4 text-white">Yükleniyor...</div>
                    ) : (
                        <DataTable
                            data={filteredUsers}
                            columns={columns}
                            selectable
                            selectedIds={selectedUsers}
                            onSelectionChange={setSelectedUsers}
                        />
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl bg-[#1c2127] border border-[#3b4754] p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-white">
                            {editingUser ? "Kullanıcı Düzenle" : "Yeni Kullanıcı Ekle"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Ad Soyad *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border border-[#3b4754] bg-[#111418] px-3 py-2 text-white focus:border-[#137fec] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">E-posta *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full rounded-lg border border-[#3b4754] bg-[#111418] px-3 py-2 text-white focus:border-[#137fec] focus:outline-none"
                                />
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User["role"] })}
                                    className="w-full rounded-lg border border-[#3b4754] bg-[#111418] px-3 py-2 text-white focus:border-[#137fec] focus:outline-none"
                                >
                                    <option value="editor">Editör</option>
                                    <option value="admin">Yönetici</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="rounded-lg bg-[#137fec] px-4 py-2 text-sm font-bold text-white hover:bg-[#137fec]/90"
                            >
                                {editingUser ? "Güncelle" : "Oluştur"}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                title={isBulkDelete ? "Toplu Silme İşlemi" : "Kullanıcı Silme İşlemi"}
                message={isBulkDelete
                    ? `Seçili ${selectedUsers.length} kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
                    : "Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                }
                onConfirm={confirmDeleteAction}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Sil"
                cancelText="Vazgeç"
            />
        </div >
    );
}
