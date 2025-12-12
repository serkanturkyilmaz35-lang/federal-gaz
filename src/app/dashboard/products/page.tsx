"use client";

import { useState, useEffect } from "react";

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
    sortOrder: number;
    isActive: boolean;
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
    sortOrder: 0,
    isActive: true,
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

    const seedProducts = async () => {
        try {
            const res = await fetch('/api/dashboard/products/seed', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setSuccessMessage(data.message);
                fetchProducts();
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to seed products:', error);
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
                        Ürün Yönetimi
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Web sitesindeki ürünleri yönetin.
                    </p>
                </div>
                <div className="flex gap-3">
                    {products.length === 0 && (
                        <button
                            onClick={seedProducts}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Varsayılan Ürünleri Yükle
                        </button>
                    )}
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
                                        <img
                                            src={product.image}
                                            alt={product.titleTR}
                                            className="h-12 w-16 object-cover rounded-lg"
                                        />
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
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-[#137fec] hover:text-[#137fec]/80 p-2"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="text-red-400 hover:text-red-300 p-2"
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

            {/* Edit Modal */}
            {isModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-[#1c2127] rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 border border-[#3b4754]">
                        <div className="p-6 border-b border-[#3b4754] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {isNew ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Slug (TR)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.slug}
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        placeholder="medikal-gazlar"
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Slug (EN)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.slugEN}
                                        onChange={(e) => updateField('slugEN', e.target.value)}
                                        placeholder="medical-gases"
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Başlık (TR)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.titleTR}
                                        onChange={(e) => updateField('titleTR', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Başlık (EN)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.titleEN}
                                        onChange={(e) => updateField('titleEN', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Kısa Açıklama (TR)</label>
                                    <textarea
                                        value={editingProduct.descTR}
                                        onChange={(e) => updateField('descTR', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Kısa Açıklama (EN)</label>
                                    <textarea
                                        value={editingProduct.descEN}
                                        onChange={(e) => updateField('descEN', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Görsel URL</label>
                                    <input
                                        type="text"
                                        value={editingProduct.image}
                                        onChange={(e) => updateField('image', e.target.value)}
                                        placeholder="/products/image.jpg veya https://..."
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sıralama</label>
                                    <input
                                        type="number"
                                        value={editingProduct.sortOrder}
                                        onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 bg-[#111418] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingProduct.isActive}
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
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#137fec] text-white font-medium rounded-lg hover:bg-[#137fec]/90 disabled:opacity-50 transition-colors"
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
