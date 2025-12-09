"use client";

import { useState, useEffect } from "react";

interface MailingCampaign {
    id: number;
    name: string;
    subject: string;
    content: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
    scheduledAt?: string;
    sentAt?: string;
    recipientCount: number;
    openCount: number;
    clickCount: number;
    createdAt: string;
}

export default function MailingPage() {
    const [campaigns, setCampaigns] = useState<MailingCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        // TODO: Implement API
        setLoading(false);
    };

    const getStatusBadge = (status: MailingCampaign['status']) => {
        const styles = {
            draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            sending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            sent: 'bg-green-500/10 text-green-400 border-green-500/20',
            cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        const labels = {
            draft: 'Taslak',
            scheduled: 'Zamanlanmış',
            sending: 'Gönderiliyor',
            sent: 'Gönderildi',
            cancelled: 'İptal',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
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
                        Mailing Yönetimi
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        E-posta kampanyalarını yönetin.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Yeni Kampanya
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#137fec]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#137fec]">mail</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-sm text-gray-400">Toplam Kampanya</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-sm text-gray-400">Gönderilen</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-yellow-400">schedule</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-sm text-gray-400">Zamanlanmış</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-purple-400">group</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-sm text-gray-400">Aboneler</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-4 lg:px-5 py-3 border-b border-[#3b4754]">
                    <h2 className="text-xl font-bold text-white">Kampanyalar</h2>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2127] border-b border-[#3b4754] sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Kampanya</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Konu</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Durum</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Alıcı</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Açılma</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Tarih</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="material-symbols-outlined text-6xl text-gray-600">mail</span>
                                            <div>
                                                <p className="text-lg font-medium text-gray-300">Henüz kampanya yok</p>
                                                <p className="text-sm">İlk e-posta kampanyanızı oluşturmak için "Yeni Kampanya" butonuna tıklayın.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-white">{campaign.name}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-gray-300">{campaign.subject}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(campaign.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-300">{campaign.recipientCount}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-300">{campaign.openCount}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-400 text-sm">{new Date(campaign.createdAt).toLocaleDateString('tr-TR')}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-[#137fec] hover:text-[#137fec]/80 p-2">
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button className="text-red-400 hover:text-red-300 p-2">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
