"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

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

const translations = {
    TR: {
        pageTitle: "Mailing Yönetimi",
        pageDesc: "E-posta kampanyalarını yönetin.",
        newCampaign: "Yeni Kampanya",
        totalCampaigns: "Toplam Kampanya",
        sentCampaigns: "Gönderilen",
        scheduledCampaigns: "Zamanlanmış",
        subscribers: "Aboneler",
        campaigns: "Kampanyalar",
        noCampaigns: "Henüz kampanya yok",
        noCampaignsDesc: "İlk e-posta kampanyanızı oluşturmak için \"Yeni Kampanya\" butonuna tıklayın.",
        campaign: "Kampanya",
        subject: "Konu",
        status: "Durum",
        recipients: "Alıcı",
        opened: "Açılma",
        date: "Tarih",
        actions: "İşlemler",
        edit: "Düzenle",
        delete: "Sil",
        addNew: "Yeni Kampanya Oluştur",
        editCampaign: "Kampanyayı Düzenle",
        campaignName: "Kampanya Adı",
        emailSubject: "E-posta Konusu",
        content: "İçerik",
        scheduleAt: "Zamanlama (Opsiyonel)",
        cancel: "İptal",
        save: "Kaydet",
        saving: "Kaydediliyor...",
        campaignAdded: "Kampanya oluşturuldu!",
        campaignUpdated: "Kampanya güncellendi!",
        campaignDeleted: "Kampanya silindi!",
        confirmDelete: "Bu kampanyayı silmek istediğinizden emin misiniz?",
        draft: "Taslak",
        scheduled: "Zamanlanmış",
        sending: "Gönderiliyor",
        sent: "Gönderildi",
        cancelled: "İptal Edildi",
    },
    EN: {
        pageTitle: "Mailing Management",
        pageDesc: "Manage email campaigns.",
        newCampaign: "New Campaign",
        totalCampaigns: "Total Campaigns",
        sentCampaigns: "Sent",
        scheduledCampaigns: "Scheduled",
        subscribers: "Subscribers",
        campaigns: "Campaigns",
        noCampaigns: "No campaigns yet",
        noCampaignsDesc: "Click \"New Campaign\" button to create your first email campaign.",
        campaign: "Campaign",
        subject: "Subject",
        status: "Status",
        recipients: "Recipients",
        opened: "Opened",
        date: "Date",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        addNew: "Create New Campaign",
        editCampaign: "Edit Campaign",
        campaignName: "Campaign Name",
        emailSubject: "Email Subject",
        content: "Content",
        scheduleAt: "Schedule (Optional)",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving...",
        campaignAdded: "Campaign created!",
        campaignUpdated: "Campaign updated!",
        campaignDeleted: "Campaign deleted!",
        confirmDelete: "Are you sure you want to delete this campaign?",
        draft: "Draft",
        scheduled: "Scheduled",
        sending: "Sending",
        sent: "Sent",
        cancelled: "Cancelled",
    }
};

const emptyCampaign: Omit<MailingCampaign, 'id' | 'createdAt' | 'recipientCount' | 'openCount' | 'clickCount'> = {
    name: '',
    subject: '',
    content: '',
    status: 'draft',
    scheduledAt: undefined,
    sentAt: undefined,
};

export default function MailingPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [campaigns, setCampaigns] = useState<MailingCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCampaign, setEditingCampaign] = useState<Partial<MailingCampaign> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/dashboard/mailing');
            const data = await res.json();
            setCampaigns(data.campaigns || []);
        } catch (error) {
            console.error('Failed to fetch campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (campaign: MailingCampaign) => {
        setEditingCampaign({ ...campaign });
        setIsNew(false);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingCampaign({ id: 0, ...emptyCampaign });
        setIsNew(true);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingCampaign) return;
        setSaving(true);

        try {
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch('/api/dashboard/mailing', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCampaign),
            });

            if (res.ok) {
                setSuccessMessage(isNew ? t.campaignAdded : t.campaignUpdated);
                setIsModalOpen(false);
                fetchCampaigns();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to save campaign:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const res = await fetch(`/api/dashboard/mailing?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage(t.campaignDeleted);
                fetchCampaigns();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to delete campaign:', error);
        }
    };

    const updateField = (field: keyof MailingCampaign, value: string) => {
        if (!editingCampaign) return;
        setEditingCampaign({ ...editingCampaign, [field]: value });
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
            draft: t.draft,
            scheduled: t.scheduled,
            sending: t.sending,
            sent: t.sent,
            cancelled: t.cancelled,
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    // Stats
    const totalSent = campaigns.filter(c => c.status === 'sent').length;
    const totalScheduled = campaigns.filter(c => c.status === 'scheduled').length;

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
                        {t.pageTitle}
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        {t.pageDesc}
                    </p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    {t.newCampaign}
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#137fec]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#137fec]">mail</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{campaigns.length}</p>
                            <p className="text-sm text-gray-400">{t.totalCampaigns}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-green-400">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalSent}</p>
                            <p className="text-sm text-gray-400">{t.sentCampaigns}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-yellow-400">schedule</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{totalScheduled}</p>
                            <p className="text-sm text-gray-400">{t.scheduledCampaigns}</p>
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
                            <p className="text-sm text-gray-400">{t.subscribers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-4 lg:px-5 py-3 border-b border-[#3b4754]">
                    <h2 className="text-xl font-bold text-white">{t.campaigns}</h2>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2127] border-b border-[#3b4754] sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.campaign}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.subject}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.status}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.recipients}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.opened}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.date}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="material-symbols-outlined text-6xl text-gray-600">mail</span>
                                            <div>
                                                <p className="text-lg font-medium text-gray-300">{t.noCampaigns}</p>
                                                <p className="text-sm">{t.noCampaignsDesc}</p>
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
                                        <span className="text-gray-400 text-sm">
                                            {new Date(campaign.createdAt).toLocaleDateString(language === 'TR' ? 'tr-TR' : 'en-US')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleEdit(campaign)}
                                            className="text-[#137fec] hover:text-[#137fec]/80 p-2"
                                            title={t.edit}
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(campaign.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
                                            title={t.delete}
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {isNew ? t.addNew : t.editCampaign}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.campaignName}</label>
                                <input
                                    type="text"
                                    value={editingCampaign.name || ''}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    placeholder={language === 'TR' ? 'Örn: Yaz Kampanyası' : 'E.g: Summer Campaign'}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.emailSubject}</label>
                                <input
                                    type="text"
                                    value={editingCampaign.subject || ''}
                                    onChange={(e) => updateField('subject', e.target.value)}
                                    placeholder={language === 'TR' ? 'E-posta konusu' : 'Email subject line'}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.content}</label>
                                <textarea
                                    value={editingCampaign.content || ''}
                                    onChange={(e) => updateField('content', e.target.value)}
                                    rows={6}
                                    placeholder={language === 'TR' ? 'E-posta içeriğini yazın...' : 'Write email content...'}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.scheduleAt}</label>
                                <input
                                    type="datetime-local"
                                    value={editingCampaign.scheduledAt ? new Date(editingCampaign.scheduledAt).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => updateField('scheduledAt', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        {t.saving}
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        {t.save}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
