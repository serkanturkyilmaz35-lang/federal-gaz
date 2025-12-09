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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ürün Yönetimi</h1>
                    <p className="text-sm text-gray-500 mt-1">Web sitesindeki ürünleri yönetin</p>
                </div>
                <div className="flex gap-3">
                    {products.length === 0 && (
                        <button
                            onClick={seedProducts}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-xl">download</span>
                            Varsayılan Ürünleri Yükle
                        </button>
                    )}
                    <button
                        onClick={handleNew}
                        className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Yeni Ürün
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Görsel</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Başlık (TR/EN)</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Sıra</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Durum</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <img
                                        src={product.image}
                                        alt={product.titleTR}
                                        className="h-12 w-16 object-cover rounded-lg"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{product.titleTR}</p>
                                    <p className="text-sm text-gray-500">{product.titleEN}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{product.slug}</code>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-600">{product.sortOrder}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {product.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-primary hover:text-primary/80 p-2"
                                    >
                                        <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Henüz ürün eklenmemiş. Varsayılan ürünleri yükleyebilir veya yeni ürün ekleyebilirsiniz.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isNew ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Slugs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug (TR)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.slug}
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        placeholder="medikal-gazlar"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Slug (EN)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.slugEN}
                                        onChange={(e) => updateField('slugEN', e.target.value)}
                                        placeholder="medical-gases"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Titles */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Başlık (TR)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.titleTR}
                                        onChange={(e) => updateField('titleTR', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Başlık (EN)</label>
                                    <input
                                        type="text"
                                        value={editingProduct.titleEN}
                                        onChange={(e) => updateField('titleEN', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Descriptions */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Açıklama (TR)</label>
                                    <textarea
                                        value={editingProduct.descTR}
                                        onChange={(e) => updateField('descTR', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Açıklama (EN)</label>
                                    <textarea
                                        value={editingProduct.descEN}
                                        onChange={(e) => updateField('descEN', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Image & Sort */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL</label>
                                    <input
                                        type="text"
                                        value={editingProduct.image}
                                        onChange={(e) => updateField('image', e.target.value)}
                                        placeholder="/products/image.jpg veya https://..."
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
                                    <input
                                        type="number"
                                        value={editingProduct.sortOrder}
                                        onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingProduct.isActive}
                                    onChange={(e) => updateField('isActive', e.target.checked)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                                    Aktif (Web sitesinde görünsün)
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
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
