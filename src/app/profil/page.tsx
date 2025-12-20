"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

import { useEncryption } from "@/context/EncryptionContext";
import { useSettings } from "@/context/SettingsContext";
import { parseIcon } from "@/utils/iconUtils";

interface CMSContent {
    tabs?: { info?: string; addresses?: string; orders?: string };
    infoLabels?: { name?: string; email?: string; phone?: string; changeInfo?: string };
    addressLabels?: {
        addButton?: string;
        titlePlaceholder?: string;
        addressPlaceholder?: string;
        deleteButton?: string;
        defaultLabel?: string;
        setDefault?: string;
        editButton?: string;
        saveButton?: string;
        cancelButton?: string;
    };
    buttons?: { logout?: string };
}

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();
    const { language } = useLanguage();
    const { settings } = useSettings();
    const { secureFetch } = useEncryption();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders'>('info');
    const [cmsContent, setCmsContent] = useState<CMSContent>({});

    interface Address {
        id: number;
        title: string;
        address: string;
        isDefault: boolean;
    }

    interface Order {
        id: number;
        status: string;
        trackingNumber?: string;
        createdAt: string;
        details: any;
    }

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    // Form and UI States
    const [newAddress, setNewAddress] = useState({ title: '', address: '' });
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [orderForm, setOrderForm] = useState({ details: '' });
    const [msg, setMsg] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Derived State for Pagination
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const currentOrders = orders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchAddresses = async () => {
        try {
            const res = await secureFetch('/api/user/address');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
            }
        } catch (e) {
            console.error("Failed to fetch addresses", e);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await secureFetch('/api/orders/list');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (e) {
            console.error("Failed to fetch orders", e);
        }
    };

    // Fetch CMS content
    useEffect(() => {
        const fetchCMSContent = async () => {
            try {
                const res = await fetch(`/api/dashboard/page-content?slug=/profil&language=${language}`);
                if (res.ok) {
                    const data = await res.json();
                    const contentObj: CMSContent = {};
                    data.sections?.forEach((section: { key: string; content: object }) => {
                        contentObj[section.key as keyof CMSContent] = section.content as CMSContent[keyof CMSContent];
                    });
                    setCmsContent(contentObj);
                }
            } catch (err) {
                console.error('Error fetching CMS content:', err);
            }
        };
        fetchCMSContent();
    }, [language]);

    useEffect(() => {
        if (user) {
            fetchAddresses();
            fetchOrders();
        }
    }, [user]);

    // Auto-hide messages
    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await secureFetch('/api/user/address', {
            method: 'POST',
            body: JSON.stringify(newAddress)
        });
        if (res.ok) {
            setNewAddress({ title: '', address: '' });
            fetchAddresses();
            setMsg('Adres eklendi.');
        }
    };

    const handleDeleteAddress = async (id: number) => {
        // DELETE usually doesn't have body, so secureFetch will just pass it.
        // If we want to hide the ID, we should use POST with body, but REST uses DELETE.
        // secureFetch doesn't encrypt URL params.
        const res = await secureFetch(`/api/user/address?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchAddresses();
    };

    const handleEditAddress = async () => {
        if (!editingAddress) return;
        const res = await secureFetch('/api/user/address', {
            method: 'PUT',
            body: JSON.stringify(editingAddress)
        });
        if (res.ok) {
            setEditingAddress(null);
            fetchAddresses();
            setMsg('Adres güncellendi.');
        }
    };

    const handleSetDefaultAddress = async (id: number) => {
        const res = await secureFetch('/api/user/address', {
            method: 'PATCH',
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            fetchAddresses();
            setMsg('Varsayılan adres değiştirildi.');
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await secureFetch('/api/orders/create', {
            method: 'POST',
            body: JSON.stringify(orderForm)
        });
        if (res.ok) {
            setOrderForm({ details: '' });
            fetchOrders();
            setMsg('Siparişiniz alındı.');
        }
    };

    if (loading || !user) return <div className="p-10 text-center">Yükleniyor...</div>;

    // Merge CMS content with defaults
    const cms = cmsContent;
    const t = {
        logout: cms.buttons?.logout || (language === 'TR' ? 'Çıkış Yap' : 'Logout'),
        tabs: {
            info: cms.tabs?.info || (language === 'TR' ? 'Kişisel Bilgilerim' : 'My Personal Info'),
            addresses: cms.tabs?.addresses || (language === 'TR' ? 'Adreslerim' : 'My Addresses'),
            orders: cms.tabs?.orders || (language === 'TR' ? 'Siparişlerim' : 'My Orders')
        },
        info: {
            name: cms.infoLabels?.name || (language === 'TR' ? 'Ad Soyad' : 'Name'),
            email: cms.infoLabels?.email || (language === 'TR' ? 'E-posta' : 'Email'),
            phone: cms.infoLabels?.phone || (language === 'TR' ? 'Telefon' : 'Phone'),
            changeInfo: cms.infoLabels?.changeInfo || (language === 'TR' ? 'Bilgilerinizi değiştirmek için lütfen bizimle iletişime geçin.' : 'Please contact us to change your information.')
        },
        address: {
            add: cms.addressLabels?.addButton || (language === 'TR' ? 'Adres Ekle' : 'Add Address'),
            title: cms.addressLabels?.titlePlaceholder || (language === 'TR' ? 'Adres Başlığı (Ev, İş vb.)' : 'Address Title'),
            text: cms.addressLabels?.addressPlaceholder || (language === 'TR' ? 'Açık Adres' : 'Full Address'),
            delete: cms.addressLabels?.deleteButton || (language === 'TR' ? 'Sil' : 'Delete'),
            default: cms.addressLabels?.defaultLabel || (language === 'TR' ? 'Varsayılan' : 'Default'),
            setDefault: cms.addressLabels?.setDefault || (language === 'TR' ? '✓ Varsayılan Yap' : '✓ Set as Default'),
            edit: cms.addressLabels?.editButton || (language === 'TR' ? 'Düzenle' : 'Edit'),
            save: cms.addressLabels?.saveButton || (language === 'TR' ? 'Kaydet' : 'Save'),
            cancel: cms.addressLabels?.cancelButton || (language === 'TR' ? 'İptal' : 'Cancel')
        },
        order: {
            create: language === 'TR' ? 'Sipariş Ver' : 'Place Order',
            desc: language === 'TR' ? 'Sipariş detaylarını buraya yazınız (Ürün, Adet vb.)' : 'Enter order details here...',
            history: language === 'TR' ? 'Sipariş Geçmişi' : 'Order History',
            status: language === 'TR' ? 'Durum' : 'Status',
            date: language === 'TR' ? 'Tarih' : 'Date'
        }
    };

    return (
        <div className="container mx-auto max-w-5xl py-10 px-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-1/4">
                    <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-6">
                        <div className="text-center mb-6">
                            {settings?.auth_icon_profile ? (
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: parseIcon(settings.auth_icon_profile).color ? `${parseIcon(settings.auth_icon_profile).color}20` : undefined }}>
                                    <span className="material-symbols-outlined text-4xl text-primary" style={{ color: parseIcon(settings.auth_icon_profile).color }}>
                                        {parseIcon(settings.auth_icon_profile).name}
                                    </span>
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-primary">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            <h2 className="font-bold text-lg">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'info' ? 'bg-primary text-white' : 'text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {t.tabs.info}
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-primary text-white' : 'text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {t.tabs.addresses}
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {t.tabs.orders}
                            </button>
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                {t.logout}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="w-full md:w-3/4">
                    <div className="bg-white dark:bg-secondary rounded-lg shadow-lg p-8 min-h-[500px]">
                        {msg && <div className="mb-4 text-green-600 bg-green-100 p-3 rounded">{msg}</div>}

                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold border-b pb-4 text-secondary dark:text-white">
                                    {language === 'TR' ? 'Kişisel Bilgilerim' : 'My Personal Info'}
                                </h3>
                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                                            {t.info.name}
                                        </label>
                                        <input
                                            type="text"
                                            value={user.name}
                                            readOnly
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-secondary dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                                            {t.info.email}
                                        </label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-secondary dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                                            {t.info.phone}
                                        </label>
                                        <input
                                            type="tel"
                                            value={user.phone || '-'}
                                            readOnly
                                            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-secondary dark:text-white"
                                        />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                                    {language === 'TR'
                                        ? 'Bilgilerinizi değiştirmek için lütfen bizimle iletişime geçin.'
                                        : 'Please contact us to change your information.'}
                                </p>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold border-b pb-4 text-secondary dark:text-white">{t.tabs.addresses}</h3>

                                {/* Kayıtlı Adresler - ÜST TARAFTA */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-secondary dark:text-white text-lg">Kayıtlı Adreslerim</h4>
                                    {addresses.length === 0 ? (
                                        <p className="text-gray-500 dark:text-gray-400">Henüz kayıtlı adresiniz yok.</p>
                                    ) : (
                                        addresses.map((addr) => (
                                            <div key={addr.id} className="border border-gray-200 dark:border-gray-600 p-4 rounded-lg bg-white dark:bg-gray-700">
                                                {editingAddress?.id === addr.id ? (
                                                    // Düzenleme Modu
                                                    <div className="space-y-3">
                                                        <input
                                                            className="w-full p-2 rounded border border-gray-300 text-gray-900"
                                                            value={editingAddress?.title || ''}
                                                            onChange={e => editingAddress && setEditingAddress({ ...editingAddress, title: e.target.value })}
                                                            placeholder="Adres Başlığı"
                                                        />
                                                        <textarea
                                                            className="w-full p-2 rounded border border-gray-300 text-gray-900 min-h-[80px]"
                                                            value={editingAddress?.address || ''}
                                                            onChange={e => editingAddress && setEditingAddress({ ...editingAddress, address: e.target.value })}
                                                            placeholder="Açık Adres"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleEditAddress}
                                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                                                            >
                                                                Kaydet
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingAddress(null)}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium"
                                                            >
                                                                İptal
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Normal Görünüm
                                                    <div className="flex justify-between gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold flex items-center gap-2 text-secondary dark:text-white">
                                                                {addr.title}
                                                                {addr.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{t.address.default}</span>}
                                                            </div>
                                                            <p className="text-gray-600 dark:text-gray-300 mt-1 break-words">{addr.address}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-1 shrink-0 items-end">
                                                            {!addr.isDefault && (
                                                                <button
                                                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                                >
                                                                    ✓ Varsayılan Yap
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => setEditingAddress({ id: addr.id, title: addr.title, address: addr.address, isDefault: addr.isDefault })}
                                                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                                            >
                                                                Düzenle
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                            >
                                                                {t.address.delete}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Yeni Adres Ekle Formu - ALT TARAFTA */}
                                <form onSubmit={handleAddAddress} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4 mt-6">
                                    <h4 className="font-bold text-secondary dark:text-white text-lg">{t.address.add}</h4>
                                    <input
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white text-gray-900 placeholder-gray-400"
                                        placeholder={t.address.title}
                                        value={newAddress.title}
                                        onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white text-gray-900 placeholder-gray-400 min-h-[100px]"
                                        placeholder={t.address.text}
                                        value={newAddress.address}
                                        onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                        required
                                    />
                                    <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 font-bold">
                                        {t.address.add}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold border-b pb-4 text-secondary dark:text-white">{t.tabs.orders}</h3>

                                {orders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📦</div>
                                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                                            {language === 'TR' ? 'Henüz siparişiniz bulunmuyor.' : 'You have no orders yet.'}
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-3">
                                            {currentOrders.map((order) => {
                                                const getOrderInfo = (details: any) => {
                                                    // Pre-parsed object from API
                                                    if (details.customer) {
                                                        // JSON Format
                                                        return {
                                                            customer: details.customer.name,
                                                            company: details.customer.company,
                                                            email: details.customer.email,
                                                            phone: details.customer.phone,
                                                            address: details.customer.address,
                                                            items: details.items || [],
                                                            notes: details.notes
                                                        };
                                                    } else if (details.raw) {
                                                        // Legacy String
                                                        const lines = details.raw.split('\n');
                                                        const map: any = {};
                                                        lines.forEach((line: string) => {
                                                            const [key, ...valueParts] = line.split(':');
                                                            if (key) map[key.trim()] = valueParts.join(':').trim();
                                                        });
                                                        return {
                                                            customer: map['Müşteri'],
                                                            company: map['Firma'],
                                                            email: map['E-posta'],
                                                            phone: map['Telefon'],
                                                            address: map['Adres'],
                                                            items: [{ product: map['Ürün'], amount: map['Miktar'], unit: '' }], // Fake item structure
                                                            notes: map['Notlar']
                                                        };
                                                    }
                                                    return {};
                                                };
                                                const info: any = getOrderInfo(order.details);

                                                return (
                                                    <div key={order.id} className="border-2 border-primary rounded-lg bg-white dark:bg-gray-700 overflow-hidden shadow-sm">
                                                        <div className="flex justify-between items-center px-3 py-2 bg-primary/5 border-b border-primary/20">
                                                            <span className="font-bold text-secondary dark:text-white text-sm">🛒 Sipariş #{order.id}</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                                                                    order.status === 'SHIPPING' ? 'bg-purple-100 text-purple-800' :
                                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                                            'bg-red-100 text-red-800'
                                                                }`}>
                                                                {
                                                                    order.status === 'PENDING' ? 'Beklemede' :
                                                                        order.status === 'PREPARING' ? 'Hazırlanıyor' :
                                                                            order.status === 'SHIPPING' ? 'Yola Çıktı' :
                                                                                order.status === 'COMPLETED' ? 'Tamamlandı' :
                                                                                    'İptal Edildi'
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="p-3 text-sm text-secondary dark:text-gray-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                                <div><span className="text-gray-500">Müşteri:</span> <span className="font-medium">{info.customer || '-'}</span></div>
                                                                <div><span className="text-gray-500">Firma:</span> <span className="font-medium">{info.company || '-'}</span></div>
                                                                <div className="break-all md:col-span-2"><span className="text-gray-500">E-posta:</span> {info.email || '-'}</div>
                                                                <div><span className="text-gray-500">Tel:</span> {info.phone || '-'}</div>
                                                            </div>

                                                            <div className="bg-primary/10 px-3 py-2 rounded mb-2">
                                                                <div className="font-bold text-gray-700 mb-1 border-b border-gray-200 pb-1">Sipariş İçeriği:</div>
                                                                <ul className="list-disc list-inside">
                                                                    {info.items && info.items.map((item: any, idx: number) => (
                                                                        <li key={idx}>
                                                                            <span className="font-bold text-primary">{item.product}</span>
                                                                            {item.amount && <span className="text-gray-600"> - {item.amount} {item.unit}</span>}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            <div className="text-xs mb-1"><span className="text-gray-500">Adres:</span> {info.address}</div>
                                                            {info.notes && <div className="text-xs text-gray-500"><span>Not:</span> <span className="italic">{info.notes}</span></div>}
                                                        </div>
                                                        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-primary/20 text-xs text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center gap-2 mt-6">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-secondary"
                                                >
                                                    &lt;
                                                </button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-8 h-8 rounded flex items-center justify-center font-bold ${currentPage === page ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-secondary"
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
