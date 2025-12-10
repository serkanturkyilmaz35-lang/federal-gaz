"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DateFilter, { DateRangeOption } from "@/components/dashboard/DateFilter";
import { filterByDate } from "@/lib/dateFilterUtils";

interface Address {
    id: number;
    title: string;
    fullAddress: string;
    city: string;
    district: string;
    phone: string;
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
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });
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
                    addresses: u.addresses || [],
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
        // Get first address or default one
        const defaultAddr = member.addresses.find(a => a.isDefault) || member.addresses[0];
        setFormData({
            name: member.name,
            email: member.email,
            phone: member.phone === "-" ? "" : member.phone,
            address: defaultAddr ? defaultAddr.address : ""
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
                                    <td className="px-4 py-4">
                                        {member.addresses.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-300 truncate max-w-[200px]" title={member.addresses[0].address}>
                                                    {member.addresses[0].address}
                                                </span>
                                                {member.addresses.length > 1 && (
                                                    <span className="text-xs text-gray-500">+{member.addresses.length - 1} diğer</span>
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

                        <div className="p-6">
                            {/* Member Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#137fec]/10 text-[#137fec] font-bold text-2xl">
                                    {editingMember.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{editingMember.name}</h3>
                                    <p className="text-gray-400">{editingMember.email}</p>
                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#137fec]/10 text-[#137fec] border border-[#137fec]/20 mt-1 inline-block">
                                        Müşteri
                                    </span>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-[#111418] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Telefon</p>
                                    <p className="text-white font-medium">{editingMember.phone}</p>
                                </div>
                                <div className="bg-[#111418] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Üyelik Tarihi</p>
                                    <p className="text-white font-medium">{editingMember.joinDate}</p>
                                </div>
                                <div className="bg-[#111418] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Toplam Sipariş</p>
                                    <p className="text-white font-medium">{editingMember.totalOrders}</p>
                                </div>
                                <div className="bg-[#111418] p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-1">Hesap Durumu</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${editingMember.isActive
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {editingMember.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>
                            </div>

                            {/* Last 5 Orders */}
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec]">shopping_cart</span>
                                    Son Siparişler
                                </h4>
                                {editingMember.orders.length === 0 ? (
                                    <div className="bg-[#111418] p-6 rounded-lg text-center text-gray-400">
                                        <span className="material-symbols-outlined text-4xl mb-2">shopping_cart</span>
                                        <p>Henüz sipariş bulunmuyor</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {editingMember.orders.map((order) => (
                                            <div key={order.id} className="bg-[#111418] p-4 rounded-lg border border-[#3b4754] flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-gray-400 font-mono">#{10000 + order.id}</span>
                                                    <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                                <span className={`${getStatusColor(order.status)} font-medium text-sm`}>
                                                    {getStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Addresses */}
                            <div>
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec]">location_on</span>
                                    Kayıtlı Adresler ({editingMember.addresses.length})
                                </h4>
                                {editingMember.addresses.length === 0 ? (
                                    <div className="bg-[#111418] p-6 rounded-lg text-center text-gray-400">
                                        <span className="material-symbols-outlined text-4xl mb-2">location_off</span>
                                        <p>Kayıtlı adres bulunmuyor</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {editingMember.addresses.map((addr) => (
                                            <div key={addr.id} className="bg-[#111418] p-4 rounded-lg border border-[#3b4754]">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-white flex items-center gap-2">
                                                            {addr.title}
                                                            {addr.isDefault && (
                                                                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#137fec]/10 text-[#137fec] border border-[#137fec]/20">
                                                                    Varsayılan
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-400 mt-1">{addr.fullAddress || addr.address}</p>
                                                        <p className="text-sm text-gray-500">{addr.district}, {addr.city}</p>
                                                        {addr.phone && <p className="text-sm text-gray-500 mt-1">Tel: {addr.phone}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Kapat
                            </button>
                            <button
                                onClick={() => {
                                    setIsDetailModal(false);
                                    setFormData({
                                        name: editingMember.name,
                                        email: editingMember.email,
                                        phone: editingMember.phone === "-" ? "" : editingMember.phone,
                                        address: editingMember.addresses[0]?.address || ""
                                    });
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Düzenle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isModalOpen && editingMember && !isDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-md m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Müşteri Bilgilerini Düzenle</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Ad Soyad</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Telefon</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+90 5xx xxx xx xx"
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Adres</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Mahalle, Sokak, No, İlçe/Şehir"
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
