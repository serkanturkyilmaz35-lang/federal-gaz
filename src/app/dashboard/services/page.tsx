"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Service {
    id: number;
    slug: string;
    icon: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    contentTR: string;
    contentEN: string;
    sortOrder: number;
    isActive: boolean;
}

const translations = {
    TR: {
        pageTitle: "Hizmet Yönetimi",
        pageDesc: "Web sitesindeki hizmetleri yönetin.",
        newService: "Yeni Hizmet",
        loadDefaults: "Varsayılan Hizmetleri Yükle",
        totalServices: "Toplam",
        services: "Hizmet",
        active: "Aktif",
        inactive: "Pasif",
        edit: "Düzenle",
        delete: "Sil",
        manage: "Yönet",
        noServices: "Henüz hizmet eklenmemiş.",
        noServicesDesc: "Varsayılan hizmetleri yükleyebilir veya yeni hizmet ekleyebilirsiniz.",
        addNew: "Yeni Hizmet Ekle",
        editService: "Hizmeti Düzenle",
        icon: "İkon",
        titleTR: "Başlık (TR)",
        titleEN: "Başlık (EN)",
        descTR: "Açıklama (TR)",
        descEN: "Açıklama (EN)",
        slug: "Slug",
        sortOrder: "Sıralama",
        isActive: "Aktif (Web sitesinde görünsün)",
        cancel: "İptal",
        save: "Kaydet",
        saving: "Kaydediliyor...",
        serviceAdded: "Hizmet eklendi!",
        serviceUpdated: "Hizmet güncellendi!",
        serviceDeleted: "Hizmet silindi!",
        confirmDelete: "Bu hizmeti silmek istediğinizden emin misiniz?",
    },
    EN: {
        pageTitle: "Service Management",
        pageDesc: "Manage the services displayed on the website.",
        newService: "New Service",
        loadDefaults: "Load Default Services",
        totalServices: "Total",
        services: "Services",
        active: "Active",
        inactive: "Inactive",
        edit: "Edit",
        delete: "Delete",
        manage: "Manage",
        noServices: "No services added yet.",
        noServicesDesc: "You can load default services or add a new service.",
        addNew: "Add New Service",
        editService: "Edit Service",
        icon: "Icon",
        titleTR: "Title (TR)",
        titleEN: "Title (EN)",
        descTR: "Description (TR)",
        descEN: "Description (EN)",
        slug: "Slug",
        sortOrder: "Sort Order",
        isActive: "Active (Display on website)",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving...",
        serviceAdded: "Service added!",
        serviceUpdated: "Service updated!",
        serviceDeleted: "Service deleted!",
        confirmDelete: "Are you sure you want to delete this service?",
    }
};

const emptyService: Omit<Service, 'id'> = {
    slug: '',
    icon: 'build',
    titleTR: '',
    titleEN: '',
    descTR: '',
    descEN: '',
    contentTR: '',
    contentEN: '',
    sortOrder: 0,
    isActive: true,
};

const iconOptions = [
    "medical_services", "propane_tank", "construction", "restaurant", "science",
    "local_shipping", "engineering", "precision_manufacturing", "factory", "warehouse",
    "build", "settings", "support", "verified", "eco"
];

export default function ServicesPage() {
    const { language } = useLanguage();
    const t = translations[language];

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchServices();
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

    const seedServices = async () => {
        try {
            const res = await fetch('/api/dashboard/services/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(data.message);
                fetchServices();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to seed services:', error);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService({ ...service });
        setIsNew(false);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingService({ id: 0, ...emptyService });
        setIsNew(true);
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
                <div className="flex gap-3">
                    {services.length === 0 && (
                        <button
                            onClick={seedServices}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            {t.loadDefaults}
                        </button>
                    )}
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
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Services Grid */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-4 lg:px-5 py-3 border-b border-[#3b4754]">
                    <h2 className="text-xl font-bold text-white">{t.totalServices} {services.length} {t.services}</h2>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {services.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <span className="material-symbols-outlined text-6xl mb-4">build</span>
                            <p className="text-lg font-medium text-gray-300">{t.noServices}</p>
                            <p className="text-sm">{t.noServicesDesc}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-[#1c2127] rounded-xl p-6 border border-[#3b4754] hover:border-[#137fec]/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-[#137fec]/10 rounded-lg">
                                            <span className="material-symbols-outlined text-[#137fec] text-2xl">{service.icon}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="text-gray-400 hover:text-[#137fec] p-1"
                                                title={t.edit}
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="text-gray-400 hover:text-red-400 p-1"
                                                title={t.delete}
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">
                                        {language === 'TR' ? service.titleTR : service.titleEN}
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-3">
                                        {language === 'TR' ? service.titleEN : service.titleTR}
                                    </p>
                                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                                        {language === 'TR' ? service.descTR : service.descEN}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <code className="text-xs bg-[#111418] text-gray-400 px-2 py-1 rounded">{service.slug}</code>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${service.isActive
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {service.isActive ? t.active : t.inactive}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {isNew ? t.addNew : t.editService}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Icon Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.icon}</label>
                                <div className="flex flex-wrap gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => updateField('icon', icon)}
                                            className={`p-3 rounded-lg border ${editingService.icon === icon
                                                ? 'bg-[#137fec]/10 border-[#137fec] text-[#137fec]'
                                                : 'bg-[#111418] border-[#3b4754] text-gray-400 hover:border-gray-500'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined">{icon}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.titleTR}</label>
                                    <input
                                        type="text"
                                        value={editingService.titleTR}
                                        onChange={(e) => updateField('titleTR', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.titleEN}</label>
                                    <input
                                        type="text"
                                        value={editingService.titleEN}
                                        onChange={(e) => updateField('titleEN', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.descTR}</label>
                                <textarea
                                    value={editingService.descTR}
                                    onChange={(e) => updateField('descTR', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{t.descEN}</label>
                                <textarea
                                    value={editingService.descEN}
                                    onChange={(e) => updateField('descEN', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.slug}</label>
                                    <input
                                        type="text"
                                        value={editingService.slug}
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        placeholder="medikal-gazlar"
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">{t.sortOrder}</label>
                                    <input
                                        type="number"
                                        value={editingService.sortOrder}
                                        onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingService.isActive}
                                    onChange={(e) => updateField('isActive', e.target.checked)}
                                    className="w-4 h-4 text-[#137fec] bg-[#111418] border-[#3b4754] rounded focus:ring-[#137fec]"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                                    {t.isActive}
                                </label>
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
