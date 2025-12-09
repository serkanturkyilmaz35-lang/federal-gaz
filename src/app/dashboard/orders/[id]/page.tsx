'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import CancellationModal from '@/components/dashboard/CancellationModal';

type OrderItem = {
    product: string;
    amount: string;
    unit: string;
};

type OrderDetails = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    items?: OrderItem[];
    notes?: string;
    raw?: string; // Legacy support
    adminNotes?: string; // Admin/Customer notes (not printed)
};

type Order = {
    id: number;
    status: string;
    details: OrderDetails;
    createdAt: string;
    userId: number | null;
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Removed useAuth - Admin auth is handled via HttpOnly cookies and API 401 response
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [initialItems, setInitialItems] = useState<OrderItem[]>([]); // Track initial state for dirty check

    // Cancellation Modal State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Unwrapped params
    const resolvedParams = React.use(params);
    const orderId = resolvedParams.id;

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            // No Authorization header needed - Cookies are sent automatically
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
                const data = await res.json();
                setOrder(data.order);
                setInitialItems(data.order.details?.items || []);
            } else if (res.status === 401) {
                // API rejected -> Not logged in as Admin
                router.push('/login');
            } else {
                setError('Sipariş bulunamadı veya yetkiniz yok.');
            }
        } catch (err) {
            setError('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (index: number, val: string) => {
        if (!order || !order.details.items) return;
        const newItems = [...(order.details.items || [])];
        newItems[index].amount = val;
        setOrder({ ...order, details: { ...order.details, items: newItems } });
    };

    const handleDeleteItem = (index: number) => {
        if (!order || !order.details.items) return;
        const newItems = (order.details.items || []).filter((_, i) => i !== index);
        setOrder({ ...order, details: { ...order.details, items: newItems } });
    };

    const handleSave = async () => {
        if (!order) return;
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // No auth header needed
                },
                body: JSON.stringify({
                    details: order.details
                })
            });

            if (res.ok) {
                setMessage('Değişiklikler kaydedildi.');
            } else if (res.status === 401) {
                router.push('/login');
            } else {
                setMessage('Hata: Kaydedilemedi.');
            }
        } catch (err) {
            setMessage('Bağlantı hatası.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Yükleniyor...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!order) return null;

    const isLegacy = !!order.details.raw;
    const isCancelled = order.status === 'CANCELLED';
    // Data Mapping Helper: Support both new nested 'customer' object and flat fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details: any = order.details;
    const customer = details.customer || {};

    const customerName = customer.name || details.customerName || '-';
    const customerCompany = customer.company || details.company || '';
    const customerEmail = customer.email || details.customerEmail || '-';
    const customerPhone = customer.phone || details.customerPhone || '-';
    const customerAddress = customer.address || details.address || '-';
    const notes = details.notes || '-';
    const items = details.items || [];

    // Check if items have changed
    const isDirty = JSON.stringify(items) !== JSON.stringify(initialItems);

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;

        // Intercept CANCELLED status to show modal
        if (newStatus === 'CANCELLED') {
            setShowCancelModal(true);
            return;
        }

        setSaving(true);
        // Optimistic update
        setOrder({ ...order, status: newStatus });

        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setMessage('Durum güncellendi ve müşteriye e-posta gönderildi.');
            } else {
                setMessage('Hata: Durum güncellenemedi.');
                fetchOrder(); // Revert
            }
        } catch (err) {
            setMessage('Bağlantı hatası.');
            fetchOrder(); // Revert
        } finally {
            setSaving(false);
        }
    };

    const handleCancelOrder = async (reason: string, note: string) => {
        if (!order) return;

        setIsCancelling(true);
        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason, note }),
            });

            if (response.ok) {
                setOrder({ ...order, status: 'CANCELLED' });
                setShowCancelModal(false);
                setMessage('Sipariş iptal edildi ve müşteriye bildirim gönderildi.');
            } else {
                setMessage('Hata: Sipariş iptal edilemedi.');
            }
        } catch (error) {
            setMessage('Bağlantı hatası.');
        } finally {
            setIsCancelling(false);
        }
    };



    // Standardized Colors across the app:
    // PENDING: Yellow, PREPARING: Blue, SHIPPING: Purple, COMPLETED: Green, CANCELLED: Red
    const statusOptions = [
        { value: 'PENDING', label: 'Beklemede', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dotHex: '#eab308' },
        { value: 'PREPARING', label: 'Hazırlanıyor', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dotHex: '#3b82f6' },
        { value: 'SHIPPING', label: 'Yola Çıktı', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dotHex: '#a855f7' },
        { value: 'COMPLETED', label: 'Tamamlandı', color: 'bg-green-500/10 text-green-400 border-green-500/20', dotHex: '#22c55e' },
        { value: 'CANCELLED', label: 'İptal Edildi', color: 'bg-red-500/10 text-red-400 border-red-500/20', dotHex: '#ef4444' },
    ];

    const currentStatus = statusOptions.find(s => s.value === order.status) || statusOptions[0];

    return (
        <div className="p-6 w-full max-w-[1920px] mx-auto h-full overflow-auto">
            {/* Print Header - Only visible during printing */}
            <div className="print-header hidden">
                <img src="/dashboard-logo.png" alt="Federal Gaz" />
                <div className="print-brand">
                    <h2>Federal Gaz</h2>
                    <span style={{ fontSize: '8pt', color: '#666' }}>Teknik ve Tıbbi Gaz Tedarikçiniz</span>
                </div>
                <div className="print-title">
                    <h1>Sipariş Detayı - #{order.id}</h1>
                    <p>Yazdırma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-3xl font-bold dark:text-white text-white">Sipariş #{order.id}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${order.userId ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                        {order.userId ? 'ÜYE' : 'MİSAFİR'}
                    </span>

                    {/* Status Dropdown - Disabled for cancelled orders */}
                    <div className="relative">
                        <button
                            onClick={() => !isCancelled && setIsStatusOpen(!isStatusOpen)}
                            disabled={isCancelled}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border text-sm font-bold uppercase tracking-wider transition-all ${currentStatus.color} ${isCancelled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title={isCancelled ? 'İptal edilmiş siparişlerin durumu değiştirilemez' : ''}
                        >
                            {currentStatus.label}
                            {!isCancelled && <span className="material-symbols-outlined text-sm">expand_more</span>}
                        </button>

                        {isStatusOpen && !isCancelled && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)}></div>
                                <div className="absolute top-full left-0 mt-2 w-48 bg-[#161b22] border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                                    {statusOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => {
                                                handleStatusChange(opt.value);
                                                setIsStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 ${order.status === opt.value ? 'text-white bg-gray-800' : 'text-gray-400'}`}
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.dotHex }}></span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <span className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-gray-600 no-print"
                    >
                        <span className="material-symbols-outlined text-sm">print</span>
                        Yazdır
                    </button>
                    <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700 no-print">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Geri Dön
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column: Customer Info (4 cols) */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-[#111418] rounded-xl shadow-sm border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">person</span>
                                Müşteri Bilgileri
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">İsim / Firma</span>
                                <p className="font-medium text-white text-lg">{customerName}</p>
                                {customerCompany && <p className="text-sm text-gray-400">{customerCompany}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Telefon</span>
                                    <p className="font-medium text-white">{customerPhone}</p>
                                </div>
                                <div className="overflow-hidden">
                                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">E-posta</span>
                                    <a href={`mailto:${customerEmail}`} className="font-medium text-blue-400 hover:underline break-all block" title={customerEmail}>
                                        {customerEmail}
                                    </a>
                                </div>
                            </div>

                            <div>
                                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Teslimat Adresi</span>
                                <div className="p-3 rounded-lg bg-[#0d1014] border border-gray-800 text-gray-300 text-sm leading-relaxed">
                                    {customerAddress}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Card */}
                    <div className="bg-[#111418] rounded-xl shadow-sm border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">note</span>
                                Sipariş Notu
                            </h2>
                        </div>
                        <div className="p-6">
                            {notes !== '-' ? (
                                <p className="text-white bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-200">
                                    "{notes}"
                                </p>
                            ) : (
                                <p className="text-gray-500 italic text-sm">Not bulunmuyor.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Content (8 cols) */}
                <div className="xl:col-span-8">
                    <div className="bg-[#111418] rounded-xl shadow-sm border border-gray-800 h-full flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-400">shopping_cart</span>
                                Sipariş İçeriği
                            </h2>
                            {isCancelled ? (
                                <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">İptal Edilmiş - Düzenlenemez</span>
                            ) : !isLegacy && (
                                <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">Düzenlenebilir Mod</span>
                            )}
                        </div>

                        <div className="p-6 flex-1">
                            {message && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-bold flex items-center gap-2 ${message.includes('Hata') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                    <span className="material-symbols-outlined text-lg">{message.includes('Hata') ? 'error' : 'check_circle'}</span>
                                    {message}
                                </div>
                            )}

                            {isLegacy ? (
                                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                    {order.details.raw}
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-gray-800">
                                    <table className="w-full text-left text-sm text-white">
                                        <thead className="bg-gray-900/80 text-gray-400 uppercase text-xs font-semibold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Ürün Adı</th>
                                                <th className="px-6 py-4 text-center">Miktar</th>
                                                <th className="px-6 py-4 text-center">Birim</th>
                                                {!isCancelled && <th className="px-6 py-4 text-right">İşlemler</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800 bg-[#161b22]">
                                            {items.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-white text-base">{item.product}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        {/* Print-only quantity display */}
                                                        <span className="hidden print:inline-block font-bold text-black">{item.amount} {item.unit}</span>
                                                        {/* Interactive quantity controls (hidden in print and for cancelled) */}
                                                        {isCancelled ? (
                                                            <span className="font-bold text-white">{item.amount}</span>
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-2 bg-[#0d1014] rounded-lg p-1 w-fit mx-auto border border-gray-800 no-print">
                                                                <button
                                                                    onClick={() => {
                                                                        const val = parseInt(item.amount);
                                                                        if (!isNaN(val) && val > 1) handleAmountChange(idx, (val - 1).toString());
                                                                    }}
                                                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                                                >-</button>
                                                                <input
                                                                    type="text"
                                                                    value={item.amount}
                                                                    onChange={(e) => handleAmountChange(idx, e.target.value)}
                                                                    className="w-12 text-center bg-transparent text-white font-bold border-none focus:ring-0 p-0"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const val = parseInt(item.amount);
                                                                        if (!isNaN(val)) handleAmountChange(idx, (val + 1).toString());
                                                                    }}
                                                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                                                                >+</button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-gray-400 font-medium">{item.unit}</td>
                                                    {!isCancelled && (
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => handleDeleteItem(idx)}
                                                                className="text-red-400 hover:text-white p-2 hover:bg-red-500 rounded-lg transition-all"
                                                                title="Bu ürünü sil"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                                        Sepetinizde ürün bulunmamaktadır.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-900/30 border-t border-gray-800">
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={saving || items.length === 0 || isCancelled || !isDirty}
                                                        className="bg-[#137fec] text-white px-6 py-2.5 rounded-lg font-bold shadow-lg hover:bg-[#137fec]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all inline-flex items-center gap-2"
                                                    >
                                                        {saving ? (
                                                            <>
                                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                                Kaydediliyor...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="material-symbols-outlined text-lg">save</span>
                                                                Değişiklikleri Kaydet
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Modal */}
            <CancellationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelOrder}
                orderNumber={`#${order.id}`}
                loading={isCancelling}
            />

            {/* Print Footer - Only visible during printing */}
            <div className="print-footer hidden">
                www.federalgaz.com | federal.gaz@hotmail.com | Tel: (0312) 395 35 95
            </div>
        </div>
    );
}
