"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
    const { user, logout, loading, refreshUser } = useAuth();
    const { language } = useLanguage();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'info' | 'addresses' | 'orders'>('info');

    // Additional States
    const [addresses, setAddresses] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [newAddress, setNewAddress] = useState({ title: '', address: '' });
    const [editingAddress, setEditingAddress] = useState<{ id: number; title: string; address: string } | null>(null);
    const [orderForm, setOrderForm] = useState({ details: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/giris');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchAddresses();
            fetchOrders();
        }
    }, [user]);

    const fetchAddresses = async () => {
        const res = await fetch('/api/user/address');
        if (res.ok) {
            const data = await res.json();
            setAddresses(data.addresses);
        }
    };

    const fetchOrders = async () => {
        const res = await fetch('/api/orders/list');
        if (res.ok) {
            const data = await res.json();
            setOrders(data.orders);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/user/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAddress)
        });
        if (res.ok) {
            setNewAddress({ title: '', address: '' });
            fetchAddresses();
            setMsg('Adres eklendi.');
        }
    };

    const handleDeleteAddress = async (id: number) => {
        const res = await fetch(`/api/user/address?id=${id}`, { method: 'DELETE' });
        if (res.ok) fetchAddresses();
    };

    const handleEditAddress = async () => {
        if (!editingAddress) return;
        const res = await fetch('/api/user/address', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingAddress)
        });
        if (res.ok) {
            setEditingAddress(null);
            fetchAddresses();
            setMsg('Adres güncellendi.');
        }
    };

    const handleSetDefaultAddress = async (id: number) => {
        const res = await fetch('/api/user/address', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            fetchAddresses();
            setMsg('Varsayılan adres değiştirildi.');
        }
    };

    const handleCreateOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderForm)
        });
        if (res.ok) {
            setOrderForm({ details: '' });
            fetchOrders();
            setMsg('Siparişiniz alındı.');
        }
    };

    if (loading || !user) return <div className="p-10 text-center">Yükleniyor...</div>;

    const t = {
        logout: language === 'TR' ? 'Çıkış Yap' : 'Logout',
        tabs: {
            info: language === 'TR' ? 'Kişisel Bilgilerim' : 'My Personal Info',
            addresses: language === 'TR' ? 'Adreslerim' : 'My Addresses',
            orders: language === 'TR' ? 'Siparişlerim' : 'My Orders'
        },
        info: {
            name: language === 'TR' ? 'Ad Soyad' : 'Name',
            email: language === 'TR' ? 'E-posta' : 'Email',
            phone: language === 'TR' ? 'Telefon' : 'Phone'
        },
        address: {
            add: language === 'TR' ? 'Adres Ekle' : 'Add Address',
            title: language === 'TR' ? 'Adres Başlığı (Ev, İş vb.)' : 'Address Title',
            text: language === 'TR' ? 'Açık Adres' : 'Full Address',
            delete: language === 'TR' ? 'Sil' : 'Delete',
            default: language === 'TR' ? 'Varsayılan' : 'Default'
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
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-primary">
                                {user.name.charAt(0)}
                            </div>
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
                                                                onClick={() => setEditingAddress({ id: addr.id, title: addr.title, address: addr.address })}
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
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                        {orders.map((order) => {
                                            const parseOrderDetails = (details: string) => {
                                                const lines = details.split('\n');
                                                const parsed: Record<string, string> = {};
                                                lines.forEach(line => {
                                                    const [key, ...valueParts] = line.split(':');
                                                    if (key && valueParts.length > 0) {
                                                        parsed[key.trim()] = valueParts.join(':').trim();
                                                    }
                                                });
                                                return parsed;
                                            };
                                            const info = parseOrderDetails(order.details);

                                            return (
                                                <div key={order.id} className="border-2 border-primary rounded-lg bg-white dark:bg-gray-700 overflow-hidden shadow-sm">
                                                    <div className="flex justify-between items-center px-3 py-2 bg-primary/5 border-b border-primary/20">
                                                        <span className="font-bold text-secondary dark:text-white text-sm">🛒 Sipariş #{order.id}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {order.status === 'PENDING' ? 'Beklemede' : order.status === 'COMPLETED' ? 'Tamamlandı' : 'İptal'}
                                                        </span>
                                                    </div>
                                                    <div className="p-3 text-sm text-secondary dark:text-gray-200">
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            {info['Müşteri'] && <div><span className="text-gray-500">Müşteri:</span> <span className="font-medium">{info['Müşteri']}</span></div>}
                                                            {info['Firma'] && <div><span className="text-gray-500">Firma:</span> <span className="font-medium">{info['Firma']}</span></div>}
                                                            {info['E-posta'] && <div className="break-all"><span className="text-gray-500">E-posta:</span> {info['E-posta']}</div>}
                                                            {info['Telefon'] && <div><span className="text-gray-500">Tel:</span> {info['Telefon']}</div>}
                                                        </div>
                                                        <div className="bg-primary/10 px-3 py-2 rounded mb-2">
                                                            <div className="flex flex-wrap gap-x-6">
                                                                <div><span className="text-gray-600">Ürün:</span> <span className="font-bold text-primary">{info['Ürün'] || '-'}</span></div>
                                                                <div><span className="text-gray-600">Miktar:</span> <span className="font-bold text-primary">{info['Miktar'] || '-'}</span></div>
                                                            </div>
                                                        </div>
                                                        {info['Adres'] && <div className="text-xs mb-1"><span className="text-gray-500">Adres:</span> {info['Adres']}</div>}
                                                        {info['Notlar'] && <div className="text-xs text-gray-500"><span>Not:</span> <span className="italic">{info['Notlar']}</span></div>}
                                                    </div>
                                                    <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-primary/20 text-xs text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
