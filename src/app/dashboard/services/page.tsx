"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { DASHBOARD_ICONS, ICON_COLORS } from "@/constants/dashboardIcons";
import { parseIcon, formatIcon } from "@/utils/iconUtils";

interface Service {
    id: number;
    slug: string;
    icon: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    subtitleTR: string;
    subtitleEN: string;
    image: string;
    detailsTitleTR: string;
    detailsTitleEN: string;
    detailsTR: string;
    detailsEN: string;
    listTitleTR: string;
    listTitleEN: string;
    listItemsTR: string;
    listItemsEN: string;
    featuresTitleTR: string;
    featuresTitleEN: string;
    featureItemsTR: string;
    featureItemsEN: string;
    ctaButtonTextTR: string;
    ctaButtonTextEN: string;
    ctaButtonLink: string;
    contentTR: string;
    contentEN: string;
    sortOrder: number;
    isActive: boolean;
}

const translations = {
    TR: {
        pageTitle: "Hizmet Yönetimi",
        pageDesc: "Web sitesindeki hizmetleri yönetin.",
        back: "Geri Dön",
        newService: "Yeni Hizmet",
        totalServices: "Toplam",
        services: "Hizmet",
        active: "Aktif",
        inactive: "Pasif",
        edit: "Düzenle",
        delete: "Sil",
        manage: "Yönet",
        noServices: "Henüz hizmet eklenmemiş.",
        noServicesDesc: "Yeni hizmet ekleyerek başlayabilirsiniz.",
        addNew: "Yeni Hizmet Ekle",
        editService: "Hizmeti Düzenle",
        tabs: {
            general: "Genel Bilgiler",
            header: "Detay Başlık & Görsel",
            content: "Detay İçerik",
            features: "Özellikler & Liste"
        },
        fields: {
            icon: "İkon (Material Symbols)",
            slug: "Slug (URL)",
            sortOrder: "Sıralama",
            isActive: "Aktif (Yayında)",
            titleTR: "Başlık (TR)",
            titleEN: "Başlık (EN)",
            descTR: "Kısa Açıklama (TR)",
            descEN: "Kısa Açıklama (EN)",
            subtitleTR: "Alt Başlık (TR)",
            subtitleEN: "Alt Başlık (EN)",
            image: "Görsel URL (Unsplash veya Local)",
            detailsTitleTR: "Detay Başlık (TR)",
            detailsTitleEN: "Detay Başlık (EN)",
            detailsTR: "Detay Metni (TR)",
            detailsEN: "Detay Metni (EN)",
            listTitleTR: "Liste Başlığı (TR)",
            listTitleEN: "Liste Başlığı (EN)",
            listItemsTR: "Liste Maddeleri (TR) - Her satıra bir madde",
            listItemsEN: "Liste Maddeleri (EN) - Her satıra bir madde",
            featuresTitleTR: "Özellikler Başlığı (TR)",
            featuresTitleEN: "Özellikler Başlığı (EN)",
            featureItemsTR: "Özellik Maddeleri (TR) - Her satıra bir madde",
            featureItemsEN: "Özellik Maddeleri (EN) - Her satıra bir madde",
            ctaButtonTextTR: "Buton Metni (TR)",
            ctaButtonTextEN: "Buton Metni (EN)",
            ctaButtonLink: "Buton Linki",
        },
        cancel: "İptal",
        save: "Kaydet",
        saving: "Kaydediliyor...",
        serviceAdded: "Hizmet eklendi!",
        serviceUpdated: "Hizmet güncellendi!",
        serviceDeleted: "Hizmet silindi!",
        confirmDelete: "Bu hizmeti silmek istediğinizden emin misiniz?",
        preview: "Ön İzleme",
        uploadImage: "Dosya Yükle",
        uploading: "Yükleniyor...",
        or: "veya",
    },
    EN: {
        pageTitle: "Service Management",
        pageDesc: "Manage the services displayed on the website.",
        back: "Go Back",
        newService: "New Service",
        totalServices: "Total",
        services: "Services",
        active: "Active",
        inactive: "Inactive",
        edit: "Edit",
        delete: "Delete",
        manage: "Manage",
        noServices: "No services added yet.",
        noServicesDesc: "You can start by adding a new service.",
        addNew: "Add New Service",
        editService: "Edit Service",
        tabs: {
            general: "General Info",
            header: "Detail Header & Image",
            content: "Detail Content",
            features: "Features & List"
        },
        fields: {
            icon: "Icon (Material Symbols)",
            slug: "Slug",
            sortOrder: "Sort Order",
            isActive: "Active (Published)",
            titleTR: "Title (TR)",
            titleEN: "Title (EN)",
            descTR: "Short Description (TR)",
            descEN: "Short Description (EN)",
            subtitleTR: "Subtitle (TR)",
            subtitleEN: "Subtitle (EN)",
            image: "Image URL (Unsplash or Local)",
            detailsTitleTR: "Detail Title (TR)",
            detailsTitleEN: "Detail Title (EN)",
            detailsTR: "Detail Text (TR)",
            detailsEN: "Detail Text (EN)",
            listTitleTR: "List Title (TR)",
            listTitleEN: "List Title (EN)",
            listItemsTR: "List Items (TR) - One per line",
            listItemsEN: "List Items (EN) - One per line",
            featuresTitleTR: "Features Title (TR)",
            featuresTitleEN: "Features Title (EN)",
            featureItemsTR: "Feature Items (TR) - One per line",
            featureItemsEN: "Feature Items (EN) - One per line",
            ctaButtonTextTR: "CTA Button Text (TR)",
            ctaButtonTextEN: "CTA Button Text (EN)",
            ctaButtonLink: "CTA Button Link",
        },
        cancel: "Cancel",
        save: "Save",
        saving: "Saving...",
        serviceAdded: "Service added!",
        serviceUpdated: "Service updated!",
        serviceDeleted: "Service deleted!",
        confirmDelete: "Are you sure you want to delete this service?",
        preview: "Preview",
        uploadImage: "Upload File",
        uploading: "Uploading...",
        or: "or",
    }
};

const emptyService: Omit<Service, 'id'> = {
    slug: '',
    icon: 'build',
    titleTR: '', titleEN: '',
    descTR: '', descEN: '',
    subtitleTR: '', subtitleEN: '',
    image: '',
    detailsTitleTR: '', detailsTitleEN: '',
    detailsTR: '', detailsEN: '',
    listTitleTR: '', listTitleEN: '',
    listItemsTR: '', listItemsEN: '',
    featuresTitleTR: '', featuresTitleEN: '',
    featureItemsTR: '', featureItemsEN: '',
    ctaButtonTextTR: 'Sipariş Ver', ctaButtonTextEN: 'Order Now',
    ctaButtonLink: '/siparis',
    contentTR: '', contentEN: '',
    sortOrder: 0,
    isActive: true,
};



export default function ServicesPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [activeTab, setActiveTab] = useState<'general' | 'header' | 'content' | 'features'>('general');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchServices();
    }, []);

    // ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/dashboard/services');
            const data = await res.json();
            setServices(data.services || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService({ ...service });
        setIsNew(false);
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingService({ id: 0, ...emptyService });
        setIsNew(true);
        setActiveTab('general');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingService) return;
        setSaving(true);

        try {
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch('/api/dashboard/services', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingService),
            });

            if (res.ok) {
                setSuccessMessage(isNew ? t.serviceAdded : t.serviceUpdated);
                setIsModalOpen(false);
                fetchServices();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to save service:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t.confirmDelete)) return;

        try {
            const res = await fetch(`/api/dashboard/services?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage(t.serviceDeleted);
                fetchServices();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to delete service:', error);
        }
    };

    const updateField = (field: keyof Service, value: string | number | boolean) => {
        if (!editingService) return;
        setEditingService({ ...editingService, [field]: value });
    };

    const getPreviewUrl = (slug: string) => {
        if (typeof window === 'undefined') return '#';
        const cleanSlug = slug.replace(/^\//, '');
        const host = window.location.hostname;
        // Strip 'dashboard.' or 'dashboard-' prefix to get main domain
        const mainHost = host.replace(/^dashboard\./, '').replace(/^dashboard-/, '');
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';
        return `${protocol}//${mainHost}${port}/hizmetler/${cleanSlug}`;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/dashboard/media', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.mediaFile) {
                updateField('image', data.mediaFile.url);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    const renderInput = (label: string, field: keyof Service, type: 'text' | 'textarea' | 'number' = 'text', rows = 3) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={String(editingService![field] || '')}
                    onChange={(e) => updateField(field, e.target.value)}
                    rows={rows}
                    className="w-full px-4 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:outline-none focus:border-[#137fec] transition-colors"
                />
            ) : (
                <input
                    type={type}
                    value={String(editingService![field] || '')}
                    onChange={(e) => updateField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full px-4 py-2 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:outline-none focus:border-[#137fec] transition-colors"
                />
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex items-center gap-4">
                    {/* Back Button */}
                    <Link
                        href="/dashboard/content"
                        className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#283039] dark:hover:bg-[#3b4754]"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">{t.pageTitle}</h1>
                        <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">{t.pageDesc}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        {t.newService}
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Services Table */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden border border-[#3b4754]">
                <div className="flex justify-between items-center px-4 lg:px-5 py-3 border-b border-[#3b4754]">
                    <h2 className="text-xl font-bold text-white">{t.totalServices}: {services.length}</h2>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2127] border-b border-[#3b4754] sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">İkon</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Başlık (TR/EN)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Slug</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Sıra</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Durum</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">build</span>
                                            <p>{t.noServices}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3">
                                            {(() => {
                                                const { name, color } = parseIcon(service.icon);
                                                return (
                                                    <div className="w-10 h-10 bg-[#1c2127] border border-[#3b4754] rounded-lg flex items-center justify-center">
                                                        <span
                                                            className="material-symbols-outlined text-xl"
                                                            style={{ color: color || '#137fec' }}
                                                        >
                                                            {name}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-white">{language === 'TR' ? service.titleTR : service.titleEN}</p>
                                            <p className="text-xs text-gray-500">{language === 'TR' ? service.descTR.substring(0, 50) : service.descEN.substring(0, 50)}...</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="text-xs bg-[#1c2127] text-gray-300 px-2 py-1 rounded">{service.slug}</code>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-gray-300">{service.sortOrder}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${service.isActive
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                }`}>
                                                {service.isActive ? t.active : t.inactive}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={getPreviewUrl(service.slug)}
                                                target="_blank"
                                                className="text-green-400 hover:text-green-300 p-2 inline-block"
                                                title={t.preview}
                                            >
                                                <span className="material-symbols-outlined">visibility</span>
                                            </Link>
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="text-[#137fec] hover:text-[#137fec]/80 p-2"
                                                title={t.edit}
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="text-red-400 hover:text-red-300 p-2"
                                                title={t.delete}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingService && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    {/* Fixed Height Modal (h-[85vh]) to prevent layout jumping */}
                    <div className="bg-[#1c2127] rounded-xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col border border-[#3b4754] relative z-[101]">

                        {/* Modal Header - shrink-0 to prevent collapse */}
                        <div className="p-8 border-b border-[#3b4754] flex items-center justify-between bg-[#111418] rounded-t-xl shrink-0 z-[20]">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {isNew ? t.addNew : t.editService}
                                </h2>
                                <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                                    {language === 'TR' ? editingService.titleTR : editingService.titleEN}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-2xl">close</span>
                            </button>
                        </div>

                        {/* Tabs - shrink-0 to prevent collapse */}
                        <div className="flex border-b border-[#3b4754] px-8 gap-8 overflow-x-auto bg-[#1c2127] shrink-0 z-[10] scrollbar-hide">
                            {(['general', 'header', 'content', 'features'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-6 px-4 text-base font-semibold border-b-[3px] transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'border-[#137fec] text-[#137fec]'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
                                        }`}
                                >
                                    {t.tabs[tab]}
                                </button>
                            ))}
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">

                            {/* TAB: GENERAL */}
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div className="bg-[#111418] p-6 rounded-lg border border-[#3b4754]">
                                        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-white text-base">settings</span>
                                            Temel Ayarlar
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {renderInput(t.fields.slug, 'slug')}
                                            {renderInput(t.fields.sortOrder, 'sortOrder', 'number')}
                                        </div>
                                        <div className="flex items-center gap-3 mt-4">
                                            <input
                                                type="checkbox"
                                                id="isActive"
                                                checked={editingService.isActive}
                                                onChange={(e) => updateField('isActive', e.target.checked)}
                                                className="w-5 h-5 text-[#137fec] bg-[#111418] border-[#3b4754] rounded focus:ring-[#137fec] cursor-pointer"
                                            />
                                            <label htmlFor="isActive" className="text-base text-gray-300 cursor-pointer select-none">
                                                {t.fields.isActive}
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        {/* Color Picker */}
                                        <label className="block text-sm font-medium text-gray-400 mb-3">İkon Rengi</label>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {ICON_COLORS.map((c) => {
                                                const { name: currentName, color: currentColor } = parseIcon(editingService.icon);
                                                const isSelected = (c.value === "" && !currentColor) || (c.value === currentColor);
                                                return (
                                                    <button
                                                        key={c.name}
                                                        onClick={() => updateField('icon', formatIcon(currentName, c.value))}
                                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${isSelected ? 'border-white scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: c.value || '#137fec' }}
                                                        title={c.name}
                                                    >
                                                        {isSelected && <span className="material-symbols-outlined text-white text-sm shadow-sm font-bold">check</span>}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Icon Picker */}
                                        <label className="block text-sm font-medium text-gray-400 mb-3">{t.fields.icon}</label>
                                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-[#3b4754] rounded-lg bg-[#111418]">
                                            {DASHBOARD_ICONS.map((icon) => {
                                                const { name: currentName, color: currentColor } = parseIcon(editingService.icon);
                                                const isSelected = currentName === icon;
                                                return (
                                                    <button
                                                        key={icon}
                                                        onClick={() => updateField('icon', formatIcon(icon, currentColor))}
                                                        className={`p-2 rounded-md transition-all flex items-center justify-center ${isSelected
                                                            ? 'bg-[#283039] border border-white/20'
                                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                            }`}
                                                        title={icon}
                                                    >
                                                        <span
                                                            className="material-symbols-outlined text-xl"
                                                            style={{ color: isSelected ? (currentColor || '#137fec') : undefined }}
                                                        >
                                                            {icon}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {renderInput(t.fields.titleTR, 'titleTR')}
                                            {renderInput(t.fields.descTR, 'descTR', 'textarea', 4)}
                                        </div>
                                        <div className="space-y-6">
                                            {renderInput(t.fields.titleEN, 'titleEN')}
                                            {renderInput(t.fields.descEN, 'descEN', 'textarea', 4)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: HEADER */}
                            {activeTab === 'header' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        <div className="flex-1 space-y-6">
                                            {renderInput(t.fields.subtitleTR, 'subtitleTR', 'text')}
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            {renderInput(t.fields.subtitleEN, 'subtitleEN', 'text')}
                                        </div>
                                    </div>

                                    <div className="bg-[#111418] p-6 rounded-lg border border-[#3b4754]">
                                        <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#137fec] text-base">image</span>
                                            Kapak Görseli
                                        </h3>

                                        <div className="space-y-4">
                                            {/* URL Input */}
                                            {renderInput(t.fields.image, 'image')}

                                            {/* OR Separator */}
                                            <div className="flex items-center gap-4">
                                                <div className="h-px bg-[#3b4754] flex-1"></div>
                                                <span className="text-xs text-gray-500 uppercase">{t.or}</span>
                                                <div className="h-px bg-[#3b4754] flex-1"></div>
                                            </div>

                                            {/* File Upload Button */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="imageUpload"
                                                    ref={fileInputRef}
                                                />
                                                <label
                                                    htmlFor="imageUpload"
                                                    className={`flex items-center gap-2 px-4 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg cursor-pointer transition-colors border border-[#3b4754] ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {uploading ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    ) : (
                                                        <span className="material-symbols-outlined text-sm">upload_file</span>
                                                    )}
                                                    {uploading ? t.uploading : t.uploadImage}
                                                </label>
                                                <span className="text-xs text-gray-500">
                                                    Bilgisayarınızdan bir dosya seçin.
                                                </span>
                                            </div>


                                            {/* Helper text for image upload */}
                                            <p className="text-xs text-gray-500 bg-[#1c2127] p-3 rounded border border-[#3b4754] flex items-center gap-2 mt-2">
                                                <span className="material-symbols-outlined text-sm">info</span>
                                                <span>
                                                    <strong>Önerilen Format:</strong> JPG/PNG. <strong>Maks. Boyut:</strong> 5MB.<br />
                                                    <strong>Önerilen Boyutlar:</strong> 800x600px veya 16:9 yatay (örn. 1920x1080px).
                                                </span>
                                            </p>

                                            {editingService.image && (
                                                /* Smaller preview height (h-48/h-56) but keeping aspect ratio */
                                                <div className="mt-4 rounded-xl overflow-hidden border border-[#3b4754] w-full max-w-2xl bg-[#000] shadow-2xl relative aspect-video max-h-56 group">
                                                    <img
                                                        src={editingService.image}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/1c2127/FFF?text=Görsel+Yüklenemedi';
                                                        }}
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                                                        <h4 className="text-white font-bold text-lg drop-shadow-md">Görsel Önizlemesi</h4>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: CONTENT */}
                            {activeTab === 'content' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {renderInput(t.fields.detailsTitleTR, 'detailsTitleTR')}
                                            {/* Reduced rows to 8 */}
                                            {renderInput(t.fields.detailsTR, 'detailsTR', 'textarea', 8)}
                                        </div>
                                        <div className="space-y-6">
                                            {renderInput(t.fields.detailsTitleEN, 'detailsTitleEN')}
                                            {/* Reduced rows to 8 */}
                                            {renderInput(t.fields.detailsEN, 'detailsEN', 'textarea', 8)}
                                        </div>
                                    </div>
                                    <hr className="border-[#3b4754]" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {renderInput(t.fields.ctaButtonTextTR, 'ctaButtonTextTR')}
                                        </div>
                                        <div className="space-y-6">
                                            {renderInput(t.fields.ctaButtonTextEN, 'ctaButtonTextEN')}
                                        </div>
                                    </div>
                                    {renderInput(t.fields.ctaButtonLink, 'ctaButtonLink')}
                                </div>
                            )}

                            {/* TAB: FEATURES */}
                            {activeTab === 'features' && (
                                <div className="space-y-8">
                                    {/* List Section */}
                                    <div className="bg-[#111418] p-6 rounded-lg border border-[#3b4754]">
                                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#137fec] text-sm">format_list_bulleted</span>
                                            Listeleme Alanı (Sol Taraf)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                {renderInput(t.fields.listTitleTR, 'listTitleTR')}
                                                {renderInput(t.fields.listItemsTR, 'listItemsTR', 'textarea', 8)}
                                            </div>
                                            <div className="space-y-4">
                                                {renderInput(t.fields.listTitleEN, 'listTitleEN')}
                                                {renderInput(t.fields.listItemsEN, 'listItemsEN', 'textarea', 8)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features Section */}
                                    <div className="bg-[#111418] p-6 rounded-lg border border-[#3b4754]">
                                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#137fec] text-sm">verified</span>
                                            Özellikler Alanı (Sağ Taraf)
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                {renderInput(t.fields.featuresTitleTR, 'featuresTitleTR')}
                                                {renderInput(t.fields.featureItemsTR, 'featureItemsTR', 'textarea', 8)}
                                            </div>
                                            <div className="space-y-4">
                                                {renderInput(t.fields.featuresTitleEN, 'featuresTitleEN')}
                                                {renderInput(t.fields.featureItemsEN, 'featureItemsEN', 'textarea', 8)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-[#3b4754] flex justify-end gap-3 bg-[#111418] rounded-b-xl shrink-0 z-[20]">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 text-gray-300 font-medium hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
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
