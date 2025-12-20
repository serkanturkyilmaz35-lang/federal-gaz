"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DASHBOARD_ICONS, ICON_COLORS } from "@/constants/dashboardIcons";
import { parseIcon, formatIcon } from "@/utils/iconUtils";

interface Product {
    id: number;
    slug: string;
    slugEN: string;
    titleTR: string;
    titleEN: string;
    descTR: string;
    descEN: string;
    contentTR: string;
    contentEN: string;
    image: string;
    heroImage: string;
    featuresTR: string;
    featuresEN: string;
    specsTR: string;
    specsEN: string;
    sortOrder: number;
    isActive: boolean;
    listIcon: string;
    ctaIcon: string;
}

const emptyProduct: Omit<Product, 'id'> = {
    slug: '',
    slugEN: '',
    titleTR: '',
    titleEN: '',
    descTR: '',
    descEN: '',
    contentTR: '',
    contentEN: '',
    image: '',
    heroImage: '',
    featuresTR: '',
    featuresEN: '',
    specsTR: '[]',
    specsEN: '[]',
    sortOrder: 0,
    isActive: true,
    listIcon: 'check',
    ctaIcon: 'contact_support',
};

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return url;
    };

    // ESC key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/dashboard/products');
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };





    const handleEdit = (product: Product) => {
        setEditingProduct({ ...product });
        setIsNew(false);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingProduct({ id: 0, ...emptyProduct });
        setIsNew(true);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingProduct) return;
        setSaving(true);

        try {
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch('/api/dashboard/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProduct),
            });

            if (res.ok) {
                setSuccessMessage(isNew ? "Ürün eklendi!" : "Ürün güncellendi!");
                setIsModalOpen(false);
                fetchProducts();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to save product:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;

        try {
            const res = await fetch(`/api/dashboard/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccessMessage("Ürün silindi!");
                fetchProducts();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const updateField = (field: keyof Product, value: string | number | boolean) => {
        if (!editingProduct) return;
        setEditingProduct({ ...editingProduct, [field]: value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'heroImage') => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const btnId = `upload-btn-${field}`;
        const btnLabel = document.getElementById(btnId);
        if (btnLabel) {
            btnLabel.innerText = "Yükleniyor...";
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/dashboard/media', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.mediaFile) {
                if (editingProduct) {
                    setEditingProduct({ ...editingProduct, [field]: data.mediaFile.url });
                }
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            if (btnLabel) btnLabel.innerText = "Yükle";
            e.target.value = '';
        }
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
                <div className="flex items-center gap-4">
                    {/* Back Button - same as pages editor */}
                    <Link
                        href="/dashboard/content"
                        className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#283039] dark:hover:bg-[#3b4754]"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                            Ürün Yönetimi
                        </h1>
                        <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                            Web sitesindeki ürünleri yönetin.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">

                    <button
                        onClick={handleNew}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Yeni Ürün
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

            {/* Products Table */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center px-4 lg:px-5 py-3 border-b border-[#3b4754]">
                    <h2 className="text-xl font-bold text-white">Toplam {products.length} Ürün</h2>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-[#1c2127] border-b border-[#3b4754] sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Görsel</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Başlık (TR/EN)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Slug</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Sıra</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Durum</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#3b4754]">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="h-16 w-20 rounded-lg overflow-hidden bg-[#1c2127] flex items-center justify-center">
                                            <img
                                                src={getImageUrl(product.image)}
                                                alt={product.titleTR}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="material-symbols-outlined text-gray-500 text-2xl">image</span>';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-white">{product.titleTR}</p>
                                        <p className="text-sm text-gray-400">{product.titleEN}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <code className="text-xs bg-[#1c2127] text-gray-300 px-2 py-1 rounded">{product.slug}</code>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-gray-300">{product.sortOrder}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.isActive
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                            }`}>
                                            {product.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <a
                                            href={(() => {
                                                if (typeof window === 'undefined') return `/urunler/${product.slug}`;
                                                const host = window.location.hostname;
                                                // If on dashboard subdomain (local or prod), open on main site
                                                if (host.startsWith('dashboard.')) {
                                                    const mainHost = host.replace('dashboard.', '');
                                                    const protocol = window.location.protocol;
                                                    const port = window.location.port ? `:${window.location.port}` : '';
                                                    return `${protocol}//${mainHost}${port}/urunler/${product.slug}`;
                                                }
                                                return `/urunler/${product.slug}`;
                                            })()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-400 hover:text-green-300 p-2 inline-block"
                                            title="Ön İzleme"
                                        >
                                            <span className="material-symbols-outlined">visibility</span>
                                        </a>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-[#137fec] hover:text-[#137fec]/80 p-2"
                                            title="Düzenle"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
                                            title="Sil"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                        Henüz ürün eklenmemiş. Varsayılan ürünleri yükleyebilir veya yeni ürün ekleyebilirsiniz.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal - Reorganized with Sections */}
            {isModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4 border border-[#3b4754] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[#3b4754] flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#137fec]">inventory_2</span>
                                {isNew ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Section 1: Temel Bilgiler */}
                            <div className="bg-[#111418] rounded-lg p-4 border border-[#3b4754]">
                                <h3 className="text-sm font-bold text-[#137fec] mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    TEMEL BİLGİLER
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">URL Adresi (TR)</label>
                                            <input
                                                type="text"
                                                value={editingProduct.slug}
                                                onChange={(e) => updateField('slug', e.target.value)}
                                                placeholder="medikal-gazlar"
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">URL Adresi (EN)</label>
                                            <input
                                                type="text"
                                                value={editingProduct.slugEN}
                                                onChange={(e) => updateField('slugEN', e.target.value)}
                                                placeholder="medical-gases"
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Başlık (TR)</label>
                                            <input
                                                type="text"
                                                value={editingProduct.titleTR}
                                                onChange={(e) => updateField('titleTR', e.target.value)}
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Başlık (EN)</label>
                                            <input
                                                type="text"
                                                value={editingProduct.titleEN}
                                                onChange={(e) => updateField('titleEN', e.target.value)}
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Kısa Açıklama (TR) - Kart üzerinde görünür</label>
                                            <textarea
                                                value={editingProduct.descTR}
                                                onChange={(e) => updateField('descTR', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Kısa Açıklama (EN)</label>
                                            <textarea
                                                value={editingProduct.descEN}
                                                onChange={(e) => updateField('descEN', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Sıralama</label>
                                            <input
                                                type="number"
                                                value={editingProduct.sortOrder}
                                                onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-end">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editingProduct.isActive}
                                                    onChange={(e) => updateField('isActive', e.target.checked)}
                                                    className="w-4 h-4 text-[#137fec] bg-[#111418] border-[#3b4754] rounded focus:ring-[#137fec]"
                                                />
                                                <span className="text-sm text-gray-300">Aktif (Web sitesinde görünsün)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Görsel */}
                            <div className="bg-[#111418] rounded-lg p-4 border border-[#3b4754]">
                                <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">image</span>
                                    ÜRÜN GÖRSELLERİ
                                </h3>

                                {/* List Image */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-medium text-gray-400">Görsel URL (Liste & Kart)</label>
                                        <span className="text-[10px] text-gray-500">Önerilen: 800x800px or 600x600px (Kare)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingProduct.image}
                                            onChange={(e) => updateField('image', e.target.value)}
                                            placeholder="Görsel URL'i girin veya yükleyin"
                                            className="flex-1 px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'image')}
                                            className="hidden"
                                            id="upload-image-product"
                                        />
                                        <label
                                            id="upload-btn-image"
                                            htmlFor="upload-image-product"
                                            className="flex items-center gap-1 px-3 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg cursor-pointer transition-colors border border-[#3b4754] text-xs whitespace-nowrap"
                                        >
                                            <span className="material-symbols-outlined text-sm">upload_file</span>
                                            Yükle
                                        </label>
                                    </div>
                                    {editingProduct.image && (
                                        <div className="mt-2 h-20 w-20 relative rounded border border-gray-600 bg-black overflow-hidden group">
                                            <img src={getImageUrl(editingProduct.image)} alt="Önizleme" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                        </div>
                                    )}
                                </div>

                                {/* Hero Image */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-medium text-gray-400">Kapak Görseli (Hero)</label>
                                        <span className="text-[10px] text-gray-500">Önerilen: 1920x1080px (16:9)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editingProduct.heroImage || ''}
                                            onChange={(e) => updateField('heroImage', e.target.value)}
                                            placeholder="Görsel URL'i girin veya yükleyin"
                                            className="flex-1 px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'heroImage')}
                                            className="hidden"
                                            id="upload-hero-product"
                                        />
                                        <label
                                            id="upload-btn-heroImage"
                                            htmlFor="upload-hero-product"
                                            className="flex items-center gap-1 px-3 py-2 bg-[#283039] hover:bg-[#3b4754] text-white rounded-lg cursor-pointer transition-colors border border-[#3b4754] text-xs whitespace-nowrap"
                                        >
                                            <span className="material-symbols-outlined text-sm">upload_file</span>
                                            Yükle
                                        </label>
                                    </div>
                                    {editingProduct.heroImage && (
                                        <div className="mt-2 h-24 w-full max-w-[200px] relative rounded border border-gray-600 bg-black overflow-hidden group">
                                            <img src={getImageUrl(editingProduct.heroImage)} alt="Önizleme" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2.5: İkonlar */}
                            <div className="bg-[#111418] rounded-lg p-4 border border-[#3b4754]">
                                <h3 className="text-sm font-bold text-yellow-500 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">stars</span>
                                    İKON AYARLARI
                                </h3>

                                {/* List Icon */}
                                <div className="mb-6">
                                    <label className="block text-xs font-medium text-gray-400 mb-2">Liste İkonu</label>

                                    {/* Color Picker */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {ICON_COLORS.map((c) => {
                                            const { name: currentName, color: currentColor } = parseIcon(editingProduct.listIcon);
                                            const isSelected = (c.value === "" && !currentColor) || (c.value === currentColor);
                                            return (
                                                <button
                                                    key={c.name}
                                                    onClick={() => updateField('listIcon', formatIcon(currentName, c.value))}
                                                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${isSelected ? 'border-white scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c.value || '#ffffff' }}
                                                    title={c.name}
                                                >
                                                    {isSelected && <span className="material-symbols-outlined text-black text-[10px] font-bold">check</span>}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Icon Grid */}
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-[#3b4754] rounded-lg bg-[#1c2127]">
                                        {DASHBOARD_ICONS.map((icon) => {
                                            const { name: currentName, color: currentColor } = parseIcon(editingProduct.listIcon);
                                            const isSelected = currentName === icon;
                                            return (
                                                <button
                                                    key={icon}
                                                    onClick={() => updateField('listIcon', formatIcon(icon, currentColor))}
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isSelected
                                                        ? 'bg-[#283039] border border-white/20'
                                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                        }`}
                                                    title={icon}
                                                >
                                                    <span
                                                        className="material-symbols-outlined text-xl"
                                                        style={{ color: isSelected ? (currentColor || undefined) : undefined }}
                                                    >
                                                        {icon}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">Seçilen: {editingProduct.listIcon}</p>
                                </div>

                                {/* CTA Icon */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-2">CTA (Buton) İkonu</label>

                                    {/* Color Picker */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {ICON_COLORS.map((c) => {
                                            const { name: currentName, color: currentColor } = parseIcon(editingProduct.ctaIcon);
                                            const isSelected = (c.value === "" && !currentColor) || (c.value === currentColor);
                                            return (
                                                <button
                                                    key={c.name}
                                                    onClick={() => updateField('ctaIcon', formatIcon(currentName, c.value))}
                                                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${isSelected ? 'border-white scale-110' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c.value || '#ffffff' }}
                                                    title={c.name}
                                                >
                                                    {isSelected && <span className="material-symbols-outlined text-black text-[10px] font-bold">check</span>}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Icon Grid */}
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-[#3b4754] rounded-lg bg-[#1c2127]">
                                        {DASHBOARD_ICONS.map((icon) => {
                                            const { name: currentName, color: currentColor } = parseIcon(editingProduct.ctaIcon);
                                            const isSelected = currentName === icon;
                                            return (
                                                <button
                                                    key={icon}
                                                    onClick={() => updateField('ctaIcon', formatIcon(icon, currentColor))}
                                                    className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isSelected
                                                        ? 'bg-[#283039] border border-white/20'
                                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                                        }`}
                                                    title={icon}
                                                >
                                                    <span
                                                        className="material-symbols-outlined text-xl"
                                                        style={{ color: isSelected ? (currentColor || undefined) : undefined }}
                                                    >
                                                        {icon}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1">Seçilen: {editingProduct.ctaIcon}</p>
                                </div>
                            </div>

                            {/* Section 3: Detay Sayfası İçeriği */}
                            <div className="bg-[#111418] rounded-lg p-4 border border-[#3b4754]">
                                <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">description</span>
                                    DETAY SAYFASI İÇERİĞİ
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Uzun Açıklama (TR)</label>
                                            <textarea
                                                value={editingProduct.contentTR || ''}
                                                onChange={(e) => updateField('contentTR', e.target.value)}
                                                rows={4}
                                                placeholder="Ürün hakkında detaylı açıklama yazısı..."
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Uzun Açıklama (EN)</label>
                                            <textarea
                                                value={editingProduct.contentEN || ''}
                                                onChange={(e) => updateField('contentEN', e.target.value)}
                                                rows={4}
                                                placeholder="Detailed product description..."
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Özellikler (TR) - Her satıra bir özellik</label>
                                            <textarea
                                                value={editingProduct.featuresTR || ''}
                                                onChange={(e) => updateField('featuresTR', e.target.value)}
                                                rows={4}
                                                placeholder="%99.5+ Saflık&#10;7/24 Destek&#10;Hızlı Teslimat"
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Özellikler (EN) - One per line</label>
                                            <textarea
                                                value={editingProduct.featuresEN || ''}
                                                onChange={(e) => updateField('featuresEN', e.target.value)}
                                                rows={4}
                                                placeholder="99.5%+ Purity&#10;24/7 Support&#10;Fast Delivery"
                                                className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white text-sm focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Teknik Özellikler */}
                            <div className="bg-[#111418] rounded-lg p-4 border border-[#3b4754]">
                                <h3 className="text-sm font-bold text-orange-400 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">settings</span>
                                    TEKNİK ÖZELLİKLER (JSON)
                                </h3>
                                <p className="text-xs text-gray-500 mb-3">Format: [{"{"}&quot;label&quot;:&quot;Etiket&quot;, &quot;value&quot;:&quot;Değer&quot;{"}"}]</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Teknik Bilgiler (TR)</label>
                                        <textarea
                                            value={editingProduct.specsTR || '[]'}
                                            onChange={(e) => updateField('specsTR', e.target.value)}
                                            rows={3}
                                            placeholder='[{"label":"Saflık","value":"99.5%"}]'
                                            className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Teknik Bilgiler (EN)</label>
                                        <textarea
                                            value={editingProduct.specsEN || '[]'}
                                            onChange={(e) => updateField('specsEN', e.target.value)}
                                            rows={3}
                                            placeholder='[{"label":"Purity","value":"99.5%"}]'
                                            className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white font-mono text-xs focus:ring-1 focus:ring-[#137fec] focus:border-[#137fec]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#3b4754] flex justify-end gap-3 shrink-0 bg-[#111418]">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50 transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">save</span>
                                        Kaydet
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
