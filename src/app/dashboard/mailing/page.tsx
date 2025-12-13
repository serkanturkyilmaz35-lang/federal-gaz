"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface MailingCampaign {
    id: number;
    name: string;
    subject: string;
    content: string;
    templateSlug: string;
    recipientType: string;
    recipientIds?: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
    scheduledAt?: string;
    sentAt?: string;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
    openCount: number;
    clickCount: number;
    errorLog?: string;
    createdAt: string;
}

interface EmailTemplate {
    id: number;
    slug: string;
    nameTR: string;
    nameEN: string;
    category: string;
    headerBgColor: string;
    headerTextColor: string;
    buttonColor: string;
}

interface Recipient {
    id: number;
    name: string;
    email: string;
}

const translations = {
    TR: {
        pageTitle: "Mailing Yönetimi",
        pageDesc: "E-posta kampanyalarını yönetin ve gönderin.",
        newCampaign: "Yeni Kampanya",
        loadTemplates: "Şablonları Yükle",
        totalCampaigns: "Toplam",
        sentCampaigns: "Gönderildi",
        scheduledCampaigns: "Zamanlanmış",
        subscribers: "Üyeler",
        tabAll: "Tümü",
        tabDrafts: "Taslaklar",
        tabSent: "Gönderildi",
        tabFailed: "Başarısız",
        tabScheduled: "Zamanlanmış",
        campaign: "Kampanya",
        subject: "Konu",
        status: "Durum",
        recipients: "Alıcı",
        sent: "Gönderildi",
        failed: "Başarısız",
        date: "Tarih",
        actions: "İşlemler",
        edit: "Düzenle",
        delete: "Sil",
        send: "Gönder",
        viewErrors: "Hataları Gör",
        noCampaigns: "Kampanya bulunamadı",
        noCampaignsDesc: "Bu kategoride henüz kampanya yok.",
        createNew: "Yeni Kampanya Oluştur",
        editCampaign: "Kampanyayı Düzenle",
        campaignName: "Kampanya Adı",
        emailSubject: "E-posta Konusu",
        content: "İçerik",
        template: "Şablon",
        recipientType: "Alıcı Tipi",
        allMembers: "Tüm Üyeler",
        selectMembers: "Belirli Üyeler",
        selectedCount: "seçili",
        scheduleAt: "Zamanlama (Opsiyonel)",
        cancel: "İptal",
        saveAsDraft: "Taslak Olarak Kaydet",
        saveAndSend: "Kaydet ve Gönder",
        saving: "Kaydediliyor...",
        sending: "Gönderiliyor...",
        campaignAdded: "Kampanya oluşturuldu!",
        campaignUpdated: "Kampanya güncellendi!",
        campaignSent: "Kampanya gönderildi!",
        campaignDeleted: "Kampanya silindi!",
        confirmDelete: "Bu kampanyayı silmek istediğinizden emin misiniz?",
        confirmSend: "Bu kampanyayı göndermek istediğinizden emin misiniz?",
        draft: "Taslak",
        scheduled: "Zamanlanmış",
        sendingStatus: "Gönderiliyor",
        sentStatus: "Gönderildi",
        failedStatus: "Başarısız",
        cancelled: "İptal Edildi",
        errorDetails: "Hata Detayları",
        close: "Kapat",
        noErrors: "Hata kaydı yok",
        general: "Genel",
        holiday: "Özel Gün",
        promotion: "Kampanya",
        segmentation: "Segmentasyon",
        noSegment: "Filtre Yok (Tümü)",
        active30: "Son 30 günde aktif",
        active90: "Son 3 ayda aktif",
        active180: "Son 6 ayda aktif",
        recipientLimit: "Alıcı Limiti",
        noLimit: "Limit Yok",
        first50: "İlk 50",
        first100: "İlk 100",
        first300: "İlk 300",
        first500: "İlk 500",
        minOrders: "Min. Sipariş Sayısı",
        minAmount: "Min. Sipariş Tutarı (₺)",
        any: "Herhangi",
        segmentApplied: "kullanıcı segmente uyuyor",
        // Advanced Marketing Segments
        vip: "VIP Müşteriler",
        aboutToChurn: "Kaybetmek Üzere",
        winBack: "Geri Kazanım (90+ gün)",
        regularBuyers: "Düzenli Alıcılar",
        firstTimeBuyers: "İlk Kez Alışveriş",
        newCustomers: "Yeni Üyeler (30 gün)",
        topOrders10: "Top 10 (Sipariş)",
        topOrders20: "Top 20 (Sipariş)",
        topOrders50: "Top 50 (Sipariş)",
        topAmount10: "Top 10 (Tutar)",
        topAmount20: "Top 20 (Tutar)",
        topAmount50: "Top 50 (Tutar)",
    },
    EN: {
        pageTitle: "Mailing Management",
        pageDesc: "Manage and send email campaigns.",
        newCampaign: "New Campaign",
        loadTemplates: "Load Templates",
        totalCampaigns: "Total",
        sentCampaigns: "Sent",
        scheduledCampaigns: "Scheduled",
        subscribers: "Members",
        tabAll: "All",
        tabDrafts: "Drafts",
        tabSent: "Sent",
        tabFailed: "Failed",
        tabScheduled: "Scheduled",
        campaign: "Campaign",
        subject: "Subject",
        status: "Status",
        recipients: "Recipients",
        sent: "Sent",
        failed: "Failed",
        date: "Date",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        send: "Send",
        viewErrors: "View Errors",
        noCampaigns: "No campaigns found",
        noCampaignsDesc: "No campaigns in this category yet.",
        createNew: "Create New Campaign",
        editCampaign: "Edit Campaign",
        campaignName: "Campaign Name",
        emailSubject: "Email Subject",
        content: "Content",
        template: "Template",
        recipientType: "Recipient Type",
        allMembers: "All Members",
        selectMembers: "Select Members",
        selectedCount: "selected",
        scheduleAt: "Schedule (Optional)",
        cancel: "Cancel",
        saveAsDraft: "Save as Draft",
        saveAndSend: "Save and Send",
        saving: "Saving...",
        sending: "Sending...",
        campaignAdded: "Campaign created!",
        campaignUpdated: "Campaign updated!",
        campaignSent: "Campaign sent!",
        campaignDeleted: "Campaign deleted!",
        confirmDelete: "Are you sure you want to delete this campaign?",
        confirmSend: "Are you sure you want to send this campaign?",
        draft: "Draft",
        scheduled: "Scheduled",
        sendingStatus: "Sending",
        sentStatus: "Sent",
        failedStatus: "Failed",
        cancelled: "Cancelled",
        errorDetails: "Error Details",
        close: "Close",
        noErrors: "No error log",
        general: "General",
        holiday: "Holiday",
        promotion: "Promotion",
        segmentation: "Segmentation",
        noSegment: "No Filter (All)",
        active30: "Active last 30 days",
        active90: "Active last 3 months",
        active180: "Active last 6 months",
        recipientLimit: "Recipient Limit",
        noLimit: "No Limit",
        first50: "First 50",
        first100: "First 100",
        first300: "First 300",
        first500: "First 500",
        minOrders: "Min. Order Count",
        minAmount: "Min. Order Amount (₺)",
        any: "Any",
        segmentApplied: "users match segment",
        // Advanced Marketing Segments
        vip: "VIP Customers",
        aboutToChurn: "About to Churn",
        winBack: "Win-back (90+ days)",
        regularBuyers: "Regular Buyers",
        firstTimeBuyers: "First-time Buyers",
        newCustomers: "New Customers (30 days)",
        topOrders10: "Top 10 (by Orders)",
        topOrders20: "Top 20 (by Orders)",
        topOrders50: "Top 50 (by Orders)",
        topAmount10: "Top 10 (by Amount)",
        topAmount20: "Top 20 (by Amount)",
        topAmount50: "Top 50 (by Amount)",
    }
};

const emptyForm = {
    name: '',
    subject: '',
    content: '',
    templateSlug: 'modern',
    recipientType: 'all',
    recipientIds: [] as number[],
    scheduledAt: '',
    // Segmentation
    segment: 'none' as string,
    recipientLimit: '' as string,
    minOrders: '' as string,
    minAmount: '' as string,
};

const defaultTemplates: any[] = [
    // Genel Şablonlar
    { id: 1, slug: 'modern', nameTR: 'Modern', nameEN: 'Modern', category: 'general', isActive: true },
    { id: 2, slug: 'classic', nameTR: 'Klasik', nameEN: 'Classic', category: 'general', isActive: true },
    { id: 27, slug: 'welcome', nameTR: 'Hoş Geldiniz', nameEN: 'Welcome', category: 'general', isActive: true },
    { id: 26, slug: 'vip-customer', nameTR: 'VIP Müşteri', nameEN: 'VIP Customer', category: 'general', isActive: true },
    // Bayram Şablonları
    { id: 10, slug: 'new-year', nameTR: 'Yeni Yıl', nameEN: 'New Year', category: 'holiday', isActive: true },
    { id: 15, slug: 'ramazan-bayrami', nameTR: 'Ramazan Bayramı', nameEN: 'Eid al-Fitr', category: 'holiday', isActive: true },
    { id: 16, slug: 'kurban-bayrami', nameTR: 'Kurban Bayramı', nameEN: 'Eid al-Adha', category: 'holiday', isActive: true },
    { id: 11, slug: '23-nisan', nameTR: '23 Nisan', nameEN: '23 April', category: 'holiday', isActive: true },
    { id: 12, slug: '19-mayis', nameTR: '19 Mayıs', nameEN: '19 May', category: 'holiday', isActive: true },
    { id: 13, slug: '30-agustos', nameTR: '30 Ağustos', nameEN: '30 August', category: 'holiday', isActive: true },
    { id: 14, slug: '29-ekim', nameTR: '29 Ekim', nameEN: '29 October', category: 'holiday', isActive: true },
    // Kampanya ve Promosyon Şablonları
    { id: 30, slug: 'black-friday', nameTR: 'Efsane Cuma', nameEN: 'Black Friday', category: 'promotion', isActive: true },
    { id: 31, slug: 'weekend-sale', nameTR: 'Hafta Sonu İndirimi', nameEN: 'Weekend Sale', category: 'promotion', isActive: true },
    { id: 32, slug: 'winter-campaign', nameTR: 'Kış Kampanyası', nameEN: 'Winter Campaign', category: 'promotion', isActive: true },
    { id: 3, slug: 'promotion', nameTR: 'Kampanya / İndirim', nameEN: 'Promotion', category: 'promotion', isActive: true },
    { id: 4, slug: 'stock-reminder', nameTR: 'Stok Hatırlatma', nameEN: 'Stock Reminder', category: 'promotion', isActive: true },
    { id: 5, slug: 'win-back', nameTR: 'Geri Kazanım', nameEN: 'Win-back', category: 'promotion', isActive: true },
    { id: 25, slug: 'season-opening', nameTR: 'Sezon Açılış', nameEN: 'Season Opening', category: 'promotion', isActive: true },
];

export default function MailingPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [campaigns, setCampaigns] = useState<MailingCampaign[]>([]);
    const [templates, setTemplates] = useState<any[]>(defaultTemplates);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'sent' | 'failed' | 'scheduled'>('all');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Error modal
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorLog, setErrorLog] = useState<{ email: string; error: string }[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    // ESC key to close modals
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsModalOpen(false);
                setErrorModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchData = async () => {
        try {
            // Priority 1: Load campaigns first for fast initial render
            const campaignsRes = await fetch('/api/dashboard/mailing');
            if (campaignsRes.ok) {
                const campaignsData = await campaignsRes.json();
                setCampaigns(campaignsData.campaigns || []);
                setSubscriberCount(campaignsData.subscriberCount || 0);
            }
            setLoading(false); // Show UI immediately

            // Priority 2: Load templates and recipients in background
            try {
                const [templatesRes, recipientsRes] = await Promise.all([
                    fetch('/api/dashboard/templates'),
                    fetch('/api/dashboard/mailing/recipients?limit=100'),
                ]);

                if (templatesRes.ok) {
                    const templatesData = await templatesRes.json();
                    if (templatesData.templates && templatesData.templates.length > 0) {
                        setTemplates(templatesData.templates);
                    }
                }

                if (recipientsRes.ok) {
                    const recipientsData = await recipientsRes.json();
                    setRecipients(recipientsData.recipients || []);
                }
            } catch (innerError) {
                console.error('Background fetch error:', innerError);
                // If templates fetch fails, defaultTemplates will remain
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setLoading(false);
        }
    };

    const seedTemplates = async () => {
        setSaving(true);
        try {
            // First sync database to create tables
            await fetch('/api/dashboard/sync', { method: 'POST' });

            // Then seed templates
            const res = await fetch('/api/dashboard/templates/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(data.message);
                fetchData();
                setTimeout(() => setSuccessMessage(""), 3000);
            } else {
                // Show message even if templates already exist
                setSuccessMessage(data.message || 'Şablonlar zaten yüklü');
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to seed templates:', error);
            setSuccessMessage('Hata oluştu, lütfen tekrar deneyin');
            setTimeout(() => setSuccessMessage(""), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleNew = () => {
        setForm(emptyForm);
        setEditingId(null);
        setIsNew(true);
        setIsModalOpen(true);
    };

    const handleEdit = (campaign: MailingCampaign) => {
        setForm({
            name: campaign.name,
            subject: campaign.subject,
            content: campaign.content,
            templateSlug: campaign.templateSlug || 'modern',
            recipientType: campaign.recipientType || 'all',
            recipientIds: campaign.recipientIds ? JSON.parse(campaign.recipientIds) : [],
            scheduledAt: campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : '',
            segment: 'none',
            recipientLimit: '',
            minOrders: '',
            minAmount: '',
        });
        setEditingId(campaign.id);
        setIsNew(false);
        setIsModalOpen(true);
    };

    const syncDatabase = async () => {
        try {
            const res = await fetch('/api/dashboard/sync', { method: 'POST' });
            if (res.ok) {
                alert('Veritabanı başarıyla güncellendi. Lütfen işleminizi tekrar deneyin.');
            } else {
                const data = await res.json();
                alert(`Güncelleme başarısız: ${data.error || 'Bilinmeyen hata'}`);
            }
        } catch (e) {
            console.error('Sync failed:', e);
            alert('Veritabanı güncelleme hatası.');
        }
    };

    const handleSave = async (sendNow = false) => {
        if (!form.name || !form.subject || !form.content) {
            alert('Lütfen tüm zorunlu alanları (Kampanya Adı, Konu, İçerik) doldurun.');
            return;
        }

        setSaving(true);

        try {
            const method = isNew ? 'POST' : 'PUT';
            const body = {
                ...(!isNew && { id: editingId }),
                name: form.name,
                subject: form.subject,
                content: form.content,
                templateSlug: form.templateSlug,
                recipientType: form.recipientType,
                recipientIds: form.recipientType === 'custom' ? JSON.stringify(form.recipientIds) : undefined,
                scheduledAt: form.scheduledAt || undefined,
                status: form.scheduledAt ? 'scheduled' : 'draft',
            };

            const res = await fetch('/api/dashboard/mailing', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok && sendNow && data.campaign) {
                // Send immediately
                setSending(true);
                const sendRes = await fetch('/api/dashboard/mailing/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ campaignId: data.campaign.id }),
                });

                if (sendRes.ok) {
                    setSuccessMessage(t.campaignSent);
                } else {
                    const sendData = await sendRes.json();
                    alert(`Kampanya kaydedildi ancak gönderilemedi: ${sendData.error || 'Bilinmeyen hata'}`);
                }
                setSending(false);
            } else if (res.ok) {
                setSuccessMessage(isNew ? t.campaignAdded : t.campaignUpdated);
            } else {
                // Show detailed error and offer sync
                const errorMessage = data.error || 'Bilinmeyen hata';
                const details = data.details ? JSON.stringify(data.details) : '';

                if (confirm(`Hatayla karşılaşıldı: ${errorMessage}\n\nDetay: ${details}\n\nVeritabanını güncellemek ve onarmak ister misiniz? (Yeni özellikler için gerekli)`)) {
                    await syncDatabase();
                }
            }

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to save campaign:', error);
            if (confirm('Beklenmeyen bir hata oluştu. Veritabanını onarmayı denemek ister misiniz?')) {
                await syncDatabase();
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async (campaignId: number) => {
        if (!confirm(t.confirmSend)) return;

        try {
            const res = await fetch('/api/dashboard/mailing/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId }),
            });

            if (res.ok) {
                setSuccessMessage(t.campaignSent);
                fetchData();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to send campaign:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const res = await fetch(`/api/dashboard/mailing?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage(t.campaignDeleted);
                fetchData();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to delete campaign:', error);
        }
    };

    const showErrors = (campaign: MailingCampaign) => {
        if (campaign.errorLog) {
            try {
                setErrorLog(JSON.parse(campaign.errorLog));
            } catch {
                setErrorLog([]);
            }
        } else {
            setErrorLog([]);
        }
        setErrorModalOpen(true);
    };

    const toggleRecipient = (id: number) => {
        setForm(prev => ({
            ...prev,
            recipientIds: prev.recipientIds.includes(id)
                ? prev.recipientIds.filter(rid => rid !== id)
                : [...prev.recipientIds, id]
        }));
    };

    const getStatusBadge = (status: MailingCampaign['status']) => {
        const styles: Record<string, string> = {
            draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            sending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            sent: 'bg-green-500/10 text-green-400 border-green-500/20',
            failed: 'bg-red-500/10 text-red-400 border-red-500/20',
            cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        };
        const labels: Record<string, string> = {
            draft: t.draft,
            scheduled: t.scheduled,
            sending: t.sendingStatus,
            sent: t.sentStatus,
            failed: t.failedStatus,
            cancelled: t.cancelled,
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.draft}`}>
                {labels[status] || status}
            </span>
        );
    };

    // Filter campaigns by tab
    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === 'all') return true;
        if (activeTab === 'draft') return c.status === 'draft';
        if (activeTab === 'sent') return c.status === 'sent';
        if (activeTab === 'failed') return c.status === 'failed';
        if (activeTab === 'scheduled') return c.status === 'scheduled';
        return true;
    });

    // Stats
    const stats = {
        total: campaigns.length,
        sent: campaigns.filter(c => c.status === 'sent').length,
        scheduled: campaigns.filter(c => c.status === 'scheduled').length,
        drafts: campaigns.filter(c => c.status === 'draft').length,
        failed: campaigns.filter(c => c.status === 'failed').length,
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
            {/* Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">{t.pageTitle}</h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">{t.pageDesc}</p>
                </div>
                <div className="flex gap-2">
                    {templates.length === 0 && (
                        <button onClick={seedTemplates} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-600">
                            <span className="material-symbols-outlined text-sm">download</span>
                            {t.loadTemplates}
                        </button>
                    )}
                    <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90">
                        <span className="material-symbols-outlined text-sm">add</span>
                        {t.newCampaign}
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#111418] rounded-xl p-4 border border-[#3b4754]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#137fec]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#137fec]">mail</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
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
                            <p className="text-2xl font-bold text-white">{stats.sent}</p>
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
                            <p className="text-2xl font-bold text-white">{stats.scheduled}</p>
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
                            <p className="text-2xl font-bold text-white">{subscriberCount}</p>
                            <p className="text-sm text-gray-400">{t.subscribers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-[#111418] p-1 rounded-lg border border-[#3b4754] overflow-x-auto">
                {[
                    { key: 'all', label: t.tabAll, count: stats.total },
                    { key: 'draft', label: t.tabDrafts, count: stats.drafts },
                    { key: 'sent', label: t.tabSent, count: stats.sent },
                    { key: 'failed', label: t.tabFailed, count: stats.failed },
                    { key: 'scheduled', label: t.tabScheduled, count: stats.scheduled },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`flex-1 min-w-[100px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.key
                            ? 'bg-[#137fec] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Campaign List */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden border border-[#3b4754]">
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2127] border-b border-[#3b4754] sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.campaign}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.status}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.recipients}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.sent}/{t.failed}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{t.date}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {filteredCampaigns.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <span className="material-symbols-outlined text-6xl text-gray-600">mail</span>
                                            <p className="text-lg font-medium text-gray-300">{t.noCampaigns}</p>
                                            <p className="text-sm">{t.noCampaignsDesc}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {filteredCampaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-white">{campaign.name}</p>
                                        <p className="text-sm text-gray-400">{campaign.subject}</p>
                                    </td>
                                    <td className="px-4 py-3">{getStatusBadge(campaign.status)}</td>
                                    <td className="px-4 py-3 text-gray-300">{campaign.recipientCount}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-green-400">{campaign.sentCount}</span>
                                        {campaign.failedCount > 0 && (
                                            <span className="text-red-400 ml-2">/ {campaign.failedCount}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {new Date(campaign.createdAt).toLocaleDateString(language === 'TR' ? 'tr-TR' : 'en-US')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-end">
                                            {campaign.status === 'draft' && (
                                                <button onClick={() => handleSend(campaign.id)} className="p-2 text-green-400 hover:text-green-300" title={t.send}>
                                                    <span className="material-symbols-outlined">send</span>
                                                </button>
                                            )}
                                            {campaign.failedCount > 0 && (
                                                <button onClick={() => showErrors(campaign)} className="p-2 text-yellow-400 hover:text-yellow-300" title={t.viewErrors}>
                                                    <span className="material-symbols-outlined">warning</span>
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(campaign)} className="p-2 text-[#137fec] hover:text-[#137fec]/80" title={t.edit}>
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(campaign.id)} className="p-2 text-red-400 hover:text-red-300" title={t.delete}>
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Campaign Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{isNew ? t.createNew : t.editCampaign}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Row 1: Name, Subject, Template */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.campaignName}</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.emailSubject}</label>
                                    <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">{t.template}</label>
                                    <select
                                        value={form.templateSlug}
                                        onChange={(e) => setForm({ ...form, templateSlug: e.target.value })}
                                        className="w-full px-3 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    >
                                        {templates.length === 0 && <option value="modern">Modern (Varsayılan)</option>}
                                        {templates.map((template) => (
                                            <option key={template.slug} value={template.slug}>
                                                {language === 'TR' ? template.nameTR : template.nameEN}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Recipient Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.recipientType}</label>
                                <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={form.recipientType === 'all'} onChange={() => setForm({ ...form, recipientType: 'all' })}
                                            className="w-4 h-4 text-[#137fec] bg-[#111418] border-[#3b4754]" />
                                        <span className="text-white">{t.allMembers} ({subscriberCount})</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" checked={form.recipientType === 'custom'} onChange={() => setForm({ ...form, recipientType: 'custom' })}
                                            className="w-4 h-4 text-[#137fec] bg-[#111418] border-[#3b4754]" />
                                        <span className="text-white">{t.selectMembers}</span>
                                    </label>
                                </div>

                                {form.recipientType === 'custom' && (
                                    <div className="max-h-40 overflow-y-auto bg-[#111418] border border-[#3b4754] rounded-lg p-3">
                                        {recipients.map((r) => (
                                            <label key={r.id} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-white/5 px-2 rounded">
                                                <input type="checkbox" checked={form.recipientIds.includes(r.id)} onChange={() => toggleRecipient(r.id)}
                                                    className="w-4 h-4 text-[#137fec] bg-[#111418] border-[#3b4754] rounded" />
                                                <span className="text-white text-sm">{r.name}</span>
                                                <span className="text-gray-500 text-xs">({r.email})</span>
                                            </label>
                                        ))}
                                        {recipients.length === 0 && <p className="text-gray-500 text-sm">Üye bulunamadı</p>}
                                    </div>
                                )}
                                {form.recipientType === 'custom' && form.recipientIds.length > 0 && (
                                    <p className="text-sm text-[#137fec] mt-2">{form.recipientIds.length} {t.selectedCount}</p>
                                )}

                                {/* Segmentation Options - Show when "All Members" is selected */}
                                {form.recipientType === 'all' && (
                                    <div className="mt-4 p-4 bg-[#111418] border border-[#3b4754] rounded-lg space-y-4">
                                        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#137fec]">tune</span>
                                            {t.segmentation}
                                        </h4>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {/* Limit */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">{t.recipientLimit}</label>
                                                <select
                                                    value={form.recipientLimit}
                                                    onChange={(e) => setForm({ ...form, recipientLimit: e.target.value })}
                                                    className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                >
                                                    <option value="">{t.noLimit}</option>
                                                    <option value="50">{t.first50}</option>
                                                    <option value="100">{t.first100}</option>
                                                    <option value="300">{t.first300}</option>
                                                    <option value="500">{t.first500}</option>
                                                </select>
                                            </div>

                                            {/* Activity Period */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">{t.segmentation}</label>
                                                <select
                                                    value={form.segment}
                                                    onChange={(e) => setForm({ ...form, segment: e.target.value })}
                                                    className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                >
                                                    <optgroup label="Genel">
                                                        <option value="none">{t.noSegment}</option>
                                                    </optgroup>
                                                    <optgroup label="Aktivite">
                                                        <option value="active30">{t.active30}</option>
                                                        <option value="active90">{t.active90}</option>
                                                        <option value="active180">{t.active180}</option>
                                                    </optgroup>
                                                    <optgroup label="Marketing">
                                                        <option value="vip">{t.vip}</option>
                                                        <option value="aboutToChurn">{t.aboutToChurn}</option>
                                                        <option value="winBack">{t.winBack}</option>
                                                        <option value="regularBuyers">{t.regularBuyers}</option>
                                                        <option value="firstTimeBuyers">{t.firstTimeBuyers}</option>
                                                        <option value="newCustomers">{t.newCustomers}</option>
                                                    </optgroup>
                                                    <optgroup label="Top Sipariş">
                                                        <option value="topOrders10">{t.topOrders10}</option>
                                                        <option value="topOrders20">{t.topOrders20}</option>
                                                        <option value="topOrders50">{t.topOrders50}</option>
                                                    </optgroup>
                                                    <optgroup label="Top Tutar">
                                                        <option value="topAmount10">{t.topAmount10}</option>
                                                        <option value="topAmount20">{t.topAmount20}</option>
                                                        <option value="topAmount50">{t.topAmount50}</option>
                                                    </optgroup>
                                                </select>
                                            </div>

                                            {/* Min Orders */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">{t.minOrders}</label>
                                                <select
                                                    value={form.minOrders}
                                                    onChange={(e) => setForm({ ...form, minOrders: e.target.value })}
                                                    className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                >
                                                    <option value="">{t.any}</option>
                                                    <option value="1">1+</option>
                                                    <option value="3">3+</option>
                                                    <option value="5">5+</option>
                                                    <option value="10">10+</option>
                                                </select>
                                            </div>

                                            {/* Min Amount */}
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">{t.minAmount}</label>
                                                <select
                                                    value={form.minAmount}
                                                    onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                                                    className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                >
                                                    <option value="">{t.any}</option>
                                                    <option value="500">500₺+</option>
                                                    <option value="1000">1.000₺+</option>
                                                    <option value="5000">5.000₺+</option>
                                                    <option value="10000">10.000₺+</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.content}</label>
                                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]" />
                            </div>

                            {/* Schedule */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.scheduleAt}</label>
                                <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]" />
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600">
                                {t.cancel}
                            </button>
                            <button onClick={() => handleSave(false)} disabled={saving} className="px-6 py-2.5 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-500 disabled:opacity-50">
                                {saving ? t.saving : t.saveAsDraft}
                            </button>
                            <button onClick={() => handleSave(true)} disabled={saving || sending}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">send</span>
                                {sending ? t.sending : t.saveAndSend}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Error Modal */}
            {
                errorModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                        <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-lg max-h-[70vh] overflow-y-auto m-4 border border-[#3b4754]">
                            <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">{t.errorDetails}</h2>
                                <button onClick={() => setErrorModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6">
                                {errorLog.length === 0 ? (
                                    <p className="text-gray-400">{t.noErrors}</p>
                                ) : (
                                    <div className="space-y-3">
                                        {errorLog.map((err, i) => (
                                            <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                                <p className="text-red-400 font-medium">{err.email}</p>
                                                <p className="text-gray-400 text-sm">{err.error}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-[#3b4754] flex justify-end">
                                <button onClick={() => setErrorModalOpen(false)} className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600">
                                    {t.close}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
