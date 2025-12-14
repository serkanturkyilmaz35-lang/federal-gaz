"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface EmailTemplate {
    id: number;
    slug: string;
    nameTR: string;
    nameEN: string;
    category: 'general' | 'holiday' | 'promotion';
    headerBgColor: string;
    headerTextColor: string;
    buttonColor: string;
    bannerImage?: string;
    headerHtml: string;
    footerHtml: string;
    isActive: boolean;
    sortOrder: number;
}

const translations = {
    TR: {
        pageTitle: "E-posta Şablonları",
        pageDesc: "Kampanya e-posta şablonlarını yönetin ve düzenleyin.",
        seedTemplates: "Varsayılan Şablonları Yükle",
        noTemplates: "Şablon bulunamadı",
        noTemplatesDesc: "Varsayılan şablonları yüklemek için butona tıklayın.",
        edit: "Düzenle",
        general: "Genel",
        holiday: "Kutlama",
        promotion: "Kampanya",
        templateName: "Şablon Adı (TR)",
        templateNameEN: "Şablon Adı (EN)",
        headerBgColor: "Üst Alan Rengi",
        headerTextColor: "Başlık Yazı Rengi",
        buttonColor: "Buton Rengi",
        active: "Aktif",
        inactive: "Pasif",
        save: "Kaydet",
        cancel: "İptal",
        saving: "Kaydediliyor...",
        saved: "Şablon kaydedildi!",
        preview: "Önizleme",
    },
    EN: {
        pageTitle: "Email Templates",
        pageDesc: "Manage and edit campaign email templates.",
        seedTemplates: "Load Default Templates",
        noTemplates: "No templates found",
        noTemplatesDesc: "Click the button to load default templates.",
        edit: "Edit",
        general: "General",
        holiday: "Holiday",
        promotion: "Promotion",
        templateName: "Template Name (TR)",
        templateNameEN: "Template Name (EN)",
        headerBgColor: "Header Background",
        headerTextColor: "Header Text Color",
        buttonColor: "Button Color",
        active: "Active",
        inactive: "Inactive",
        save: "Save",
        cancel: "Cancel",
        saving: "Saving...",
        saved: "Template saved!",
        preview: "Preview",
    }
};
// Default templates for instant render
const defaultTemplates: EmailTemplate[] = [
    // Genel
    { id: 1, slug: 'modern', nameTR: 'Modern', nameEN: 'Modern', category: 'general', headerBgColor: 'linear-gradient(135deg, #1a2744 0%, #0a1628 100%)', headerTextColor: '#ffffff', buttonColor: 'linear-gradient(135deg, #b13329 0%, #8b1a12 100%)', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 1 },
    { id: 2, slug: 'classic', nameTR: 'Klasik', nameEN: 'Classic', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', buttonColor: '#b13329', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 2 },
    { id: 27, slug: 'welcome', nameTR: 'Hoş Geldiniz', nameEN: 'Welcome', category: 'general', headerBgColor: 'linear-gradient(135deg, #1a2744 0%, #2d4a7c 100%)', headerTextColor: '#ffffff', buttonColor: '#b13329', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 27 },
    { id: 26, slug: 'vip-customer', nameTR: 'VIP Müşteri', nameEN: 'VIP Customer', category: 'general', headerBgColor: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)', headerTextColor: '#ffd700', buttonColor: '#c41e3a', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 26 },
    // Bayram
    { id: 10, slug: 'new-year', nameTR: 'Yeni Yıl', nameEN: 'New Year', category: 'holiday', headerBgColor: 'linear-gradient(135deg, #1e3a5f 0%, #0d1f33 100%)', headerTextColor: '#ffd700', buttonColor: '#c41e3a', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 10 },
    { id: 15, slug: 'ramazan-bayrami', nameTR: 'Ramazan Bayramı', nameEN: 'Eid al-Fitr', category: 'holiday', headerBgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', headerTextColor: '#ffd700', buttonColor: '#4ecdc4', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 15 },
    { id: 16, slug: 'kurban-bayrami', nameTR: 'Kurban Bayramı', nameEN: 'Eid al-Adha', category: 'holiday', headerBgColor: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)', headerTextColor: '#ffffff', buttonColor: '#b13329', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 16 },
    { id: 11, slug: '23-nisan', nameTR: '23 Nisan', nameEN: '23 April', category: 'holiday', headerBgColor: 'linear-gradient(135deg, #e30a17 0%, #b30813 100%)', headerTextColor: '#ffffff', buttonColor: '#1a2744', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 11 },
    // Promosyon
    { id: 30, slug: 'black-friday', nameTR: 'Efsane Cuma', nameEN: 'Black Friday', category: 'promotion', headerBgColor: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)', headerTextColor: '#ffffff', buttonColor: '#ff2d2d', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 30 },
    { id: 31, slug: 'weekend-sale', nameTR: 'Hafta Sonu İndirimi', nameEN: 'Weekend Sale', category: 'promotion', headerBgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', headerTextColor: '#ffffff', buttonColor: '#f093fb', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 31 },
    { id: 32, slug: 'winter-campaign', nameTR: 'Kış Kampanyası', nameEN: 'Winter Campaign', category: 'promotion', headerBgColor: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)', headerTextColor: '#1a2744', buttonColor: '#1a2744', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 32 },
    { id: 3, slug: 'promotion', nameTR: 'Kampanya / İndirim', nameEN: 'Promotion', category: 'promotion', headerBgColor: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)', headerTextColor: '#ffffff', buttonColor: '#1a2744', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 20 },
    { id: 4, slug: 'stock-reminder', nameTR: 'Stok Hatırlatma', nameEN: 'Stock Reminder', category: 'promotion', headerBgColor: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)', headerTextColor: '#ffffff', buttonColor: '#1a2744', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 21 },
];

export default function TemplatesPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
    const [loading, setLoading] = useState(false); // Start with false - show default immediately
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string>("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'holiday' | 'promotion'>('all');
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);

    // Sort templates: active first, then by sortOrder
    const sortedTemplates = [...templates]
        .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
        .sort((a, b) => {
            // Active templates first
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;

            // Group by Category (General -> Holiday -> Promotion)
            const catOrder: Record<string, number> = { 'general': 1, 'holiday': 2, 'promotion': 3 };
            const catA = catOrder[a.category] || 99;
            const catB = catOrder[b.category] || 99;
            if (catA !== catB) return catA - catB;

            // Then by sortOrder
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

    useEffect(() => {
        fetchTemplates();
    }, []);

    // ESC key to close modals
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditingTemplate(null);
                setPreviewTemplate(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Fetch preview HTML when template is selected
    useEffect(() => {
        if (previewTemplate) {
            setPreviewLoading(true);
            fetch('/api/dashboard/templates/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateSlug: previewTemplate.slug })
            })
                .then(res => res.json())
                .then(data => {
                    setPreviewHtml(data.html || '');
                    setPreviewLoading(false);
                })
                .catch(() => {
                    setPreviewHtml('<p>Önizleme yüklenemedi</p>');
                    setPreviewLoading(false);
                });
        }
    }, [previewTemplate]);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/dashboard/templates');
            const data = await res.json();
            if (data.templates && data.templates.length > 0) {
                setTemplates(data.templates);
            }
            // If no templates from DB, keep default ones
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            // Keep default templates on error
        }
    };

    const syncAndSeedTemplates = async () => {
        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");
        try {
            // First sync database to create tables
            const syncRes = await fetch('/api/dashboard/sync', { method: 'POST' });
            const syncData = await syncRes.json();

            if (!syncRes.ok) {
                setErrorMessage(syncData.error || syncData.details || 'Veritabanı senkronizasyonu başarısız');
                setTimeout(() => setErrorMessage(""), 5000);
                return;
            }

            // Then seed templates
            const seedRes = await fetch('/api/dashboard/templates/seed', { method: 'POST' });
            const seedData = await seedRes.json();

            if (seedRes.ok) {
                setSuccessMessage(seedData.message || 'Şablonlar yüklendi!');
                fetchTemplates();
            } else {
                setErrorMessage(seedData.error || 'Şablon yükleme başarısız');
            }
            setTimeout(() => { setSuccessMessage(""); setErrorMessage(""); }, 5000);
        } catch (error) {
            console.error('Failed to sync/seed templates:', error);
            setErrorMessage('Bağlantı hatası, lütfen tekrar deneyin');
            setTimeout(() => setErrorMessage(""), 5000);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!editingTemplate) return;
        setSaving(true);

        try {
            const res = await fetch('/api/dashboard/templates', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTemplate),
            });

            if (res.ok) {
                setSuccessMessage(t.saved);
                setEditingTemplate(null);
                fetchTemplates();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to save template:', error);
        } finally {
            setSaving(false);
        }
    };

    const getCategoryLabel = (category: string) => {
        if (category === 'general') return t.general;
        if (category === 'holiday') return t.holiday;
        if (category === 'promotion') return t.promotion;
        return category;
    };

    const getCategoryStyle = (category: string) => {
        if (category === 'general') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        if (category === 'holiday') return 'bg-red-500/10 text-red-400 border-red-500/20';
        if (category === 'promotion') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">{t.pageTitle}</h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">{t.pageDesc}</p>
                </div>
                <button onClick={syncAndSeedTemplates} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 disabled:opacity-50">
                    <span className="material-symbols-outlined text-sm">{saving ? 'sync' : 'download'}</span>
                    {saving ? 'Yükleniyor...' : t.seedTemplates}
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">error</span>
                    {errorMessage}
                </div>
            )}

            {/* Category Tabs */}
            <div className="mb-4 flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'all'
                        ? 'bg-[#137fec] text-white'
                        : 'bg-[#111418] text-gray-400 hover:text-white border border-[#3b4754]'
                        }`}
                >
                    Tümü
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.length}</span>
                </button>
                <button
                    onClick={() => setSelectedCategory('general')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'general'
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#111418] text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                        }`}
                >
                    {t.general}
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.filter(t => t.category === 'general').length}</span>
                </button>
                <button
                    onClick={() => setSelectedCategory('holiday')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'holiday'
                        ? 'bg-red-500 text-white'
                        : 'bg-[#111418] text-red-400 hover:bg-red-500/20 border border-red-500/30'
                        }`}
                >
                    {t.holiday}
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.filter(t => t.category === 'holiday').length}</span>
                </button>
                <button
                    onClick={() => setSelectedCategory('promotion')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${selectedCategory === 'promotion'
                        ? 'bg-orange-500 text-white'
                        : 'bg-[#111418] text-orange-400 hover:bg-orange-500/20 border border-orange-500/30'
                        }`}
                >
                    {t.promotion}
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{templates.filter(t => t.category === 'promotion').length}</span>
                </button>
            </div>

            {/* Templates Grid */}
            {sortedTemplates.length === 0 ? (
                <div className="bg-[#111418] rounded-xl p-12 text-center border border-[#3b4754]">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">mail</span>
                    <p className="text-lg font-medium text-gray-300">{t.noTemplates}</p>
                    <p className="text-sm text-gray-500 mb-4">{t.noTemplatesDesc}</p>
                    <button onClick={syncAndSeedTemplates} disabled={saving} className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50">
                        {t.seedTemplates}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {sortedTemplates.map((template) => (
                        <div key={template.id} className="bg-[#111418] rounded-lg border border-[#3b4754] overflow-hidden hover:border-[#137fec]/50 transition-colors group">
                            {/* Compact Preview Header */}
                            <div className="h-14 flex items-center justify-center px-2" style={{ background: template.headerBgColor }}>
                                <span className="text-xs font-semibold text-center leading-tight truncate" style={{ color: template.headerTextColor }}>
                                    {language === 'TR' ? template.nameTR : template.nameEN}
                                </span>
                            </div>

                            {/* Compact Info */}
                            <div className="p-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${getCategoryStyle(template.category)}`}>
                                        {getCategoryLabel(template.category)}
                                    </span>
                                    <span className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-400' : 'bg-gray-500'}`} title={template.isActive ? t.active : t.inactive}></span>
                                </div>

                                <p className="text-gray-500 text-[10px] mb-2 truncate">slug: {template.slug}</p>

                                {/* Action Buttons */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setPreviewTemplate(template)}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-amber-500/10 text-amber-400 rounded text-xs hover:bg-amber-500/20 transition-colors"
                                        title={t.preview}
                                    >
                                        <span className="material-symbols-outlined text-sm">visibility</span>
                                    </button>
                                    <button
                                        onClick={() => setEditingTemplate(template)}
                                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#137fec]/10 text-[#137fec] rounded text-xs hover:bg-[#137fec]/20 transition-colors"
                                        title={t.edit}
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingTemplate.nameTR}</h2>
                            <button onClick={() => setEditingTemplate(null)} className="text-gray-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Names */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.templateName}</label>
                                    <input
                                        type="text"
                                        value={editingTemplate.nameTR}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, nameTR: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.templateNameEN}</label>
                                    <input
                                        type="text"
                                        value={editingTemplate.nameEN}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, nameEN: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.headerBgColor}</label>
                                    <input
                                        type="text"
                                        value={editingTemplate.headerBgColor}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, headerBgColor: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.headerTextColor}</label>
                                    <input
                                        type="text"
                                        value={editingTemplate.headerTextColor}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, headerTextColor: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.buttonColor}</label>
                                    <input
                                        type="text"
                                        value={editingTemplate.buttonColor}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, buttonColor: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            {/* Banner Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Banner Görsel URL (Varsayılan)</label>
                                <input
                                    type="text"
                                    value={editingTemplate.bannerImage || ''}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, bannerImage: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Preview */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.preview}</label>
                                <div className="rounded-lg overflow-hidden border border-[#3b4754]">
                                    <div className="h-20 flex items-center justify-center" style={{ background: editingTemplate.headerBgColor }}>
                                        <span className="font-bold" style={{ color: editingTemplate.headerTextColor }}>
                                            {editingTemplate.nameTR}
                                        </span>
                                    </div>
                                    <div className="p-4 bg-white text-gray-800 text-sm">
                                        <p>Merhaba <strong>Müşteri Adı</strong>,</p>
                                        <p className="my-2">E-posta içeriği burada görünecek...</p>
                                        <div className="text-center my-4">
                                            <span className="inline-block px-6 py-2 text-white rounded" style={{ background: editingTemplate.buttonColor }}>
                                                Buton
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingTemplate.isActive}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, isActive: e.target.checked })}
                                    className="w-5 h-5 text-[#137fec] bg-[#111418] border-[#3b4754] rounded focus:ring-2 focus:ring-[#137fec]/20"
                                />
                                <span className="text-white">{editingTemplate.isActive ? t.active : t.inactive}</span>
                            </label>
                        </div>

                        <div className="p-6 border-t border-[#3b4754] flex justify-end gap-3">
                            <button onClick={() => setEditingTemplate(null)} className="px-6 py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600">
                                {t.cancel}
                            </button>
                            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50">
                                {saving ? t.saving : t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1c2127] rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#3b4754]">
                        {/* Header */}
                        <div className="p-4 border-b border-[#3b4754] flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{t.preview}: {language === 'TR' ? previewTemplate.nameTR : previewTemplate.nameEN}</h3>
                                <p className="text-xs text-gray-500">E-posta gönderildiğinde bu şekilde görünecek</p>
                            </div>
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto p-4 bg-gray-100">
                            {previewLoading ? (
                                <div className="flex items-center justify-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#137fec]"></div>
                                </div>
                            ) : (
                                <div
                                    className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
                                    style={{ maxWidth: '600px' }}
                                >
                                    <iframe
                                        srcDoc={previewHtml}
                                        className="w-full h-[500px] border-0"
                                        title="Email Preview"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-[#3b4754] flex justify-end">
                            <button
                                onClick={() => setPreviewTemplate(null)}
                                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
