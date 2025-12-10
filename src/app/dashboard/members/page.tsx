"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DateFilter, { DateRangeOption } from "@/components/dashboard/DateFilter";
import { filterByDate } from "@/lib/dateFilterUtils";

interface Address {
    id: number;
    title: string;
    address: string;
    isDefault: boolean;
}

interface OrderItem {
    id: number;
    status: string;
    createdAt: string;
    details: any;
}

interface Member {
    id: number;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    joinDate: string;
    addresses: Address[];
    orders: OrderItem[];
    totalOrders: number;
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModal, setIsDetailModal] = useState(false);

    // Updated state for multi-address support
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        phone: string;
        addresses: Address[];
        deletedAddressIds: number[];
    }>({
        name: "",
        email: "",
        phone: "",
        addresses: [],
        deletedAddressIds: []
    });

    const [successMessage, setSuccessMessage] = useState("");

    // Search & Date Filter
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get("q") || "";
    const [dateRange, setDateRange] = useState<DateRangeOption>("all");
    const [customStartDate, setCustomStartDate] = useState("");
    const [customEndDate, setCustomEndDate] = useState("");

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/members');
            const data = await res.json();
            if (data.success) {
                const formattedMembers = data.members.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: u.phone || "-",
                    isActive: u.isActive !== false, // Default to true
                    joinDate: new Date(u.createdAt).toLocaleDateString('tr-TR'),
                    // Sort addresses: Default first
                    addresses: (u.addresses || []).sort((a: Address, b: Address) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)),
                    orders: u.orders || [],
                    totalOrders: u.totalOrders || 0
                }));
                setMembers(formattedMembers);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Filter Logic
    const dateFilteredMembers = filterByDate(members, "joinDate", dateRange, customStartDate, customEndDate);
    const filteredMembers = dateFilteredMembers.filter((m) => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLocaleLowerCase('tr-TR');
        return (
            m.name.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            m.email.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            m.phone.toLocaleLowerCase('tr-TR').includes(lowerTerm)
        );
    });

    const handleViewDetail = (member: Member) => {
        setEditingMember(member);
        setIsDetailModal(true);
        setIsModalOpen(true);
    };

    const handleEdit = (member: Member) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone === "-" ? "" : member.phone,
            // Deep copy addresses to avoid mutating state directly
            addresses: JSON.parse(JSON.stringify(member.addresses)),
            deletedAddressIds: []
        });
        setIsDetailModal(false);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingMember) return;

        try {
            const res = await fetch(`/api/users/${editingMember.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccessMessage("Üye bilgileri güncellendi!");
                setIsModalOpen(false);
                fetchMembers();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu üyeyi silmek istediğinizden emin misiniz?")) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage("Üye silindi!");
                fetchMembers();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    // Address Management Handlers
    const handleAddAddress = () => {
        setFormData({
            ...formData,
            addresses: [
                ...formData.addresses,
                { id: 0, title: "", address: "", isDefault: false } // id 0 marks new
            ]
        });
    };

    const handleRemoveAddress = (index: number) => {
        const addrToRemove = formData.addresses[index];
        const newAddresses = formData.addresses.filter((_, i) => i !== index);

        // If it's an existing address (has id > 0), mark for deletion
        let newDeletedIds = formData.deletedAddressIds;
        if (addrToRemove.id > 0) {
            newDeletedIds = [...newDeletedIds, addrToRemove.id];
        }

        setFormData({
            ...formData,
            addresses: newAddresses,
            deletedAddressIds: newDeletedIds
        });
    };

    const handleAddressChange = (index: number, field: keyof Address, value: any) => {
        const newAddresses = [...formData.addresses];
        newAddresses[index] = { ...newAddresses[index], [field]: value };

        // Ensure only one default
        if (field === 'isDefault' && value === true) {
            newAddresses.forEach((a, i) => {
                if (i !== index) a.isDefault = false;
            });
        }

        setFormData({ ...formData, addresses: newAddresses });
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'PENDING': 'Beklemede',
            'PREPARING': 'Hazırlanıyor',
            'SHIPPING': 'Yolda',
            'COMPLETED': 'Tamamlandı',
            'CANCELLED': 'İptal'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'PENDING': 'text-yellow-400',
            'PREPARING': 'text-blue-400',
            'SHIPPING': 'text-purple-400',
            'COMPLETED': 'text-green-400',
            'CANCELLED': 'text-red-400'
        };
        return colors[status] || 'text-gray-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                        Üyeler
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Web sitesine kayıtlı tüm müşterileri yönetin.
                    </p>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Main Card */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center px-4 lg:px-5 py-3 border-b border-[#3b4754] gap-3">
                    <h2 className="text-xl font-bold text-white">Toplam {filteredMembers.length} Müşteri</h2>
                    <DateFilter
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        customStartDate={customStartDate}
                        setCustomStartDate={setCustomStartDate}
                        customEndDate={customEndDate}
                        setCustomEndDate={setCustomEndDate}
                    />
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2127] border-b border-[#3b4754] sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Müşteri</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Telefon</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Sipariş</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Adres</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Üyelik</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Durum</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#137fec]/10 text-[#137fec] font-bold text-sm">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{member.name}</p>
                                                <p className="text-sm text-gray-400">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-gray-300">{member.phone}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#137fec]/10 text-[#137fec] border border-[#137fec]/20">
                                            {member.totalOrders} sipariş
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        {member.addresses.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {member.addresses.slice(0, 3).map((addr, idx) => ( // Show first 3 for simplicity, or ALL? User said "kaç adres girmişse hepsini göster"
                                                    <div key={idx} className="flex flex-col text-sm border-b border-white/5 last:border-0 pb-1 last:pb-0">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-200 font-medium text-xs">{addr.title}</span>
                                                            {addr.isDefault && <span className="text-[10px] text-[#137fec] bg-[#137fec]/10 px-1 rounded">Varsayılan</span>}
                                                        </div>
                                                        <span className="text-gray-400 text-xs truncate max-w-[200px]" title={addr.address}>{addr.address}</span>
                                                    </div>
                                                ))}
                                                {member.addresses.length > 3 && (
                                                    <span className="text-xs text-gray-500 italic">+{member.addresses.length - 3} diğer (tamamı için düzenle)</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-gray-400 text-sm">{member.joinDate}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${member.isActive
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {member.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => handleViewDetail(member)}
                                            className="text-gray-400 hover:text-white p-2"
                                            title="Detay"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="text-[#137fec] hover:text-[#137fec]/80 p-2"
                                            title="Düzenle"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
                                            title="Sil"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="material-symbols-outlined text-6xl text-gray-600">group</span>
                                            <div>
                                                <p className="text-lg font-medium text-gray-300">Henüz müşteri yok</p>
                                                <p className="text-sm">Web sitesine kayıt olan müşteriler burada görünecek.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && editingMember && isDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-3xl m-4 border border-[#3b4754] max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Müşteri Detayı</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {/* No changes to Detail View content needed, logic handles dynamic addresses already if member.addresses is correct */}
                        <div className="p-6">
                            {/* ... (Existing Detail Logic - Condensed for brevity, keeping same) */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#137fec]/10 text-[#137fec] font-bold text-2xl">
                                    {editingMember.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{editingMember.name}</h3>
                                    <p className="text-gray-400">{editingMember.email}</p>
                                    <p className="text-gray-500 text-sm mt-1">{editingMember.phone}</p>
                                </div>
                            </div>

                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#137fec]">location_on</span>
                                Kayıtlı Adresler
                            </h4>
                            <div className="space-y-3">
                                {editingMember.addresses.map((addr) => (
                                    <div key={addr.id} className="bg-[#111418] p-4 rounded-lg border border-[#3b4754]">
                                        <p className="font-medium text-white flex items-center gap-2">
                                            {addr.title}
                                            {addr.isDefault && <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#137fec]/10 text-[#137fec] border border-[#137fec]/20">Varsayılan</span>}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">{addr.address}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg">Kapat</button>
                            <button onClick={() => { setIsDetailModal(false); handleEdit(editingMember); }} className="flex items-center gap-2 px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg">
                                <span className="material-symbols-outlined text-sm">edit</span> Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Multi-Address Support) */}
            {isModalOpen && editingMember && !isDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 overflow-y-auto py-10">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-2xl m-4 border border-[#3b4754] max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white">Müşteri Bilgilerini Düzenle</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Personal Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Address Management */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#137fec]">location_on</span>
                                        Adresler
                                    </h3>
                                    <button
                                        onClick={handleAddAddress}
                                        className="text-sm text-[#137fec] hover:underline font-medium flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Yeni Adres Ekle
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.addresses.map((addr, idx) => (
                                        <div key={idx} className="bg-[#111418] border border-[#3b4754] rounded-lg p-4 relative group">
                                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-white">
                                                    <input
                                                        type="radio"
                                                        name="defaultAddress"
                                                        checked={addr.isDefault}
                                                        onChange={() => handleAddressChange(idx, 'isDefault', true)}
                                                        className="accent-[#137fec]"
                                                    />
                                                    Varsayılan
                                                </label>
                                                <button
                                                    onClick={() => handleRemoveAddress(idx)}
                                                    className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                    title="Sil"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Başlık</label>
                                                    <input
                                                        type="text"
                                                        value={addr.title}
                                                        onChange={(e) => handleAddressChange(idx, 'title', e.target.value)}
                                                        placeholder="Örn: Ev, İş"
                                                        className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white focus:border-[#137fec] focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Açık Adres</label>
                                                    <textarea
                                                        value={addr.address}
                                                        onChange={(e) => handleAddressChange(idx, 'address', e.target.value)}
                                                        rows={2}
                                                        placeholder="Mahalle, Sokak, İlçe/Şehir..."
                                                        className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white focus:border-[#137fec] focus:outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.addresses.length === 0 && (
                                        <div className="text-center py-6 text-gray-500 bg-[#111418] rounded-lg border border-dashed border-[#3b4754]">
                                            Kayıtlı adres yok.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors">İptal</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 transition-colors">
                                <span className="material-symbols-outlined text-sm">save</span> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
