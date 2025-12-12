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
        holiday: "Özel Gün",
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

export default function TemplatesPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    // ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setEditingTemplate(null);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/dashboard/templates');
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setLoading(false);
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
                {templates.length === 0 && (
                    <button onClick={syncAndSeedTemplates} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 disabled:opacity-50">
                        <span className="material-symbols-outlined text-sm">download</span>
                        {t.seedTemplates}
                    </button>
                )}
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

            {/* Templates Grid */}
            {templates.length === 0 ? (
                <div className="bg-[#111418] rounded-xl p-12 text-center border border-[#3b4754]">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">mail</span>
                    <p className="text-lg font-medium text-gray-300">{t.noTemplates}</p>
                    <p className="text-sm text-gray-500 mb-4">{t.noTemplatesDesc}</p>
                    <button onClick={syncAndSeedTemplates} disabled={saving} className="px-6 py-2 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50">
                        {t.seedTemplates}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-[#111418] rounded-xl border border-[#3b4754] overflow-hidden hover:border-[#137fec]/50 transition-colors">
                            {/* Preview Header */}
                            <div className="h-24 flex items-center justify-center text-white font-bold text-lg" style={{ background: template.headerBgColor }}>
                                <span style={{ color: template.headerTextColor }}>{language === 'TR' ? template.nameTR : template.nameEN}</span>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryStyle(template.category)}`}>
                                        {getCategoryLabel(template.category)}
                                    </span>
                                    <span className={`text-xs ${template.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                        {template.isActive ? t.active : t.inactive}
                                    </span>
                                </div>

                                <p className="text-white font-medium mb-1">{language === 'TR' ? template.nameTR : template.nameEN}</p>
                                <p className="text-gray-500 text-xs mb-3">slug: {template.slug}</p>

                                <button
                                    onClick={() => setEditingTemplate(template)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#137fec]/10 text-[#137fec] rounded-lg hover:bg-[#137fec]/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    {t.edit}
                                </button>
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
        </div>
    );
}
