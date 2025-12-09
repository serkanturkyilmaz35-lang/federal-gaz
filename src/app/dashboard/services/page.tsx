"use client";

import { useState, useEffect } from "react";

interface Service {
    id: number;
    icon: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
}

const defaultServices: Omit<Service, 'id'>[] = [
    { icon: "medical_services", titleTR: "Medikal Gazlar", titleEN: "Medical Gases", descTR: "Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki.", descEN: "High-purity medical gas supply for the sensitive needs of the healthcare sector.", slug: "medikal-gazlar", sortOrder: 1, isActive: true },
    { icon: "propane_tank", titleTR: "Endüstriyel Gaz Dolumu", titleEN: "Industrial Gas Filling", descTR: "Oksijen, azot, argon ve diğer endüstriyel gazların güvenli ve hızlı dolum hizmetleri.", descEN: "Safe and fast filling services for oxygen, nitrogen, argon, and other industrial gases.", slug: "endustriyel-gaz-dolumu", sortOrder: 2, isActive: true },
    { icon: "construction", titleTR: "Kaynak Gazları", titleEN: "Welding Gases", descTR: "Kaynak işlemleriniz için özel karışım gazlar ve ekipman tedariki.", descEN: "Special mixture gases and equipment supply for your welding operations.", slug: "kaynak-gazlari", sortOrder: 3, isActive: true },
    { icon: "restaurant", titleTR: "Gıda Gazları", titleEN: "Food Gases", descTR: "Gıda endüstrisi için güvenli ve onaylı gaz çözümleri.", descEN: "Safe and approved gas solutions for the food industry.", slug: "gida-gazlari", sortOrder: 4, isActive: true },
    { icon: "science", titleTR: "Özel Gaz Karışımları", titleEN: "Special Gas Mixtures", descTR: "İhtiyaçlarınıza özel hazırlanan gaz karışımları ve danışmanlık.", descEN: "Custom prepared gas mixtures and consultancy for your needs.", slug: "ozel-gaz-karisimlari", sortOrder: 5, isActive: true },
];

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        // Load default services for display (API not yet implemented)
        const loadedServices = defaultServices.map((s, i) => ({ ...s, id: i + 1 }));
        setServices(loadedServices);
        setLoading(false);
    }, []);

    const handleEdit = (service: Service) => {
        setEditingService({ ...service });
        setIsNew(false);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingService({
            id: 0,
            icon: "build",
            titleTR: "",
            titleEN: "",
            descTR: "",
            descEN: "",
            slug: "",
            sortOrder: 0,
            isActive: true,
        });
        setIsNew(true);
        setIsModalOpen(true);
    };

    const updateField = (field: keyof Service, value: string | number | boolean) => {
        if (!editingService) return;
        setEditingService({ ...editingService, [field]: value });
    };

    const iconOptions = [
        "medical_services", "propane_tank", "construction", "restaurant", "science",
        "local_shipping", "engineering", "precision_manufacturing", "factory", "warehouse"
    ];

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
                        Hizmet Yönetimi
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Web sitesindeki hizmetleri yönetin.
                    </p>
                </div>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Yeni Hizmet
                </button>
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
                    <h2 className="text-xl font-bold text-white">Toplam {services.length} Hizmet</h2>
                </div>

                <div className="flex-1 overflow-auto p-4">
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
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button className="text-gray-400 hover:text-red-400 p-1">
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{service.titleTR}</h3>
                                <p className="text-sm text-gray-400 mb-3">{service.titleEN}</p>
                                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{service.descTR}</p>
                                <div className="flex items-center justify-between">
                                    <code className="text-xs bg-[#111418] text-gray-400 px-2 py-1 rounded">{service.slug}</code>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${service.isActive
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {service.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {isNew ? 'Yeni Hizmet Ekle' : 'Hizmeti Düzenle'}
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">İkon</label>
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
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Başlık (TR)</label>
                                    <input
                                        type="text"
                                        value={editingService.titleTR}
                                        onChange={(e) => updateField('titleTR', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Başlık (EN)</label>
                                    <input
                                        type="text"
                                        value={editingService.titleEN}
                                        onChange={(e) => updateField('titleEN', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama (TR)</label>
                                <textarea
                                    value={editingService.descTR}
                                    onChange={(e) => updateField('descTR', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Açıklama (EN)</label>
                                <textarea
                                    value={editingService.descEN}
                                    onChange={(e) => updateField('descEN', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                                    <input
                                        type="text"
                                        value={editingService.slug}
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        placeholder="medikal-gazlar"
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sıralama</label>
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
                                    Aktif (Web sitesinde görünsün)
                                </label>
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
                                onClick={() => {
                                    setSuccessMessage("Hizmet kaydedildi!");
                                    setIsModalOpen(false);
                                    setTimeout(() => setSuccessMessage(""), 3000);
                                }}
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
