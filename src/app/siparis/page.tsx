"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

const translations = {
    TR: {
        title: "Sipariş Ver",
        subtitle: "Hızlı ve güvenli sipariş için formu doldurun.",
        name: "Ad Soyad *",
        company: "Firma *",
        email: "E-posta *",
        phone: "Telefon *",
        product: "Ürün *",
        selectProduct: "Ürün Seçiniz",
        products: ["Oksijen", "Azot", "Argon", "Karbondioksit", "Asetilen", "Propan", "Medikal Oksijen", "Diğer"],
        amount: "Miktar *",
        unit: "Birim",
        units: ["Adet", "m³", "kg", "Litre"],
        address: "Teslimat Adresi *",
        notes: "Ek Notlar",
        notesPlaceholder: "Varsa ek taleplerinizi belirtin...",
        submitBtn: "Sipariş Ver",
        submitting: "Gönderiliyor...",
        successTitle: "🎉 Siparişiniz Alındı!",
        successMessage: "Siparişiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
        errorMessage: "Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
    },
    EN: {
        title: "Order Now",
        subtitle: "Fill out the form for quick and secure ordering.",
        name: "Full Name *",
        company: "Company *",
        email: "Email *",
        phone: "Phone *",
        product: "Product *",
        selectProduct: "Select Product",
        products: ["Oxygen", "Nitrogen", "Argon", "Carbon Dioxide", "Acetylene", "Propane", "Medical Oxygen", "Other"],
        amount: "Amount *",
        unit: "Unit",
        units: ["Piece", "m³", "kg", "Liter"],
        address: "Delivery Address *",
        notes: "Additional Notes",
        notesPlaceholder: "Specify additional requests if any...",
        submitBtn: "Order Now",
        submitting: "Submitting...",
        successTitle: "🎉 Order Received!",
        successMessage: "Your order has been received successfully. We will contact you shortly.",
        errorMessage: "An error occurred while submitting your order. Please try again."
    }
};

// Confetti celebration function - FULL SCREEN explosion!
const fireConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    // Continuous confetti explosion
    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Random bursts from different positions
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);

    // Initial big burst from center
    confetti({
        particleCount: 200,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        zIndex: 9999
    });
};

interface SavedAddress {
    id: number;
    title: string;
    address: string;
    isDefault: boolean;
}

export default function SiparisPage() {
    const { language } = useLanguage();
    const { user } = useAuth();
    const t = translations[language];

    const [formData, setFormData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        product: "",
        amount: "",
        unit: t.units[0],
        address: "",
        notes: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | "custom">("custom");

    // Fetch saved addresses if user is logged in
    useEffect(() => {
        if (user) {
            fetch('/api/user/address')
                .then(res => res.json())
                .then(data => {
                    if (data.addresses && data.addresses.length > 0) {
                        setSavedAddresses(data.addresses);
                        // Auto-select default address
                        const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
                        if (defaultAddr) {
                            setSelectedAddressId(defaultAddr.id);
                            setFormData(prev => ({ ...prev, address: defaultAddr.address }));
                        }
                    }
                })
                .catch(() => { });
        }
    }, [user]);

    // Pre-fill form with user data if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "custom") {
            setSelectedAddressId("custom");
            setFormData(prev => ({ ...prev, address: "" }));
        } else {
            const addrId = parseInt(value);
            setSelectedAddressId(addrId);
            const addr = savedAddresses.find(a => a.id === addrId);
            if (addr) {
                setFormData(prev => ({ ...prev, address: addr.address }));
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Client-side validation for required fields
        const requiredFields = [
            { key: 'name', label: 'Ad Soyad' },
            { key: 'company', label: 'Firma' },
            { key: 'email', label: 'E-posta' },
            { key: 'phone', label: 'Telefon' },
            { key: 'product', label: 'Ürün' },
            { key: 'amount', label: 'Miktar' },
            { key: 'address', label: 'Teslimat Adresi' }
        ];

        for (const field of requiredFields) {
            if (!formData[field.key as keyof typeof formData]?.trim()) {
                setError(`${field.label} alanı zorunludur.`);
                return;
            }
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                // Fire confetti celebration! 🎉
                fireConfetti();

                setShowSuccess(true);
                setFormData({
                    name: user?.name || "",
                    company: "",
                    email: user?.email || "",
                    phone: user?.phone || "",
                    product: "",
                    amount: "",
                    unit: t.units[0],
                    address: "",
                    notes: ""
                });

                // Hide success after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                setError(data.error || t.errorMessage);
            }
        } catch (err) {
            console.error(err);
            setError(t.errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className="bg-secondary py-16 text-white">
                <div className="mx-auto max-w-7xl px-4">
                    <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl">{t.title}</h1>
                    <p className="mt-4 text-lg text-white/80">{t.subtitle}</p>
                </div>
            </section>

            <section className="bg-background-light py-16 dark:bg-background-dark sm:py-24">
                <div className="mx-auto max-w-3xl px-4">
                    <div className="rounded-xl bg-white p-8 shadow-md dark:bg-background-dark">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.name}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.company}</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.email}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.phone}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-secondary dark:text-white">{t.product}</label>
                                <select
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                >
                                    <option value="">{t.selectProduct}</option>
                                    {t.products.map((h, i) => (
                                        <option key={i} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.amount}</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-secondary dark:text-white">{t.unit}</label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    >
                                        {t.units.map((u, i) => (
                                            <option key={i} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-secondary dark:text-white">{t.address}</label>

                                {/* Saved Addresses Dropdown */}
                                {savedAddresses.length > 0 && (
                                    <div className="mt-1 mb-2">
                                        <select
                                            value={selectedAddressId}
                                            onChange={handleAddressChange}
                                            className="w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                        >
                                            {savedAddresses.map((addr) => (
                                                <option key={addr.id} value={addr.id}>
                                                    📍 {addr.title} - {addr.address.substring(0, 50)}...
                                                </option>
                                            ))}
                                            <option value="custom">✏️ Yeni adres gir...</option>
                                        </select>
                                    </div>
                                )}

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setSelectedAddressId("custom");
                                    }}
                                    required
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    placeholder={savedAddresses.length > 0 ? "Seçili adres veya yeni adres girin..." : "Teslimat adresinizi girin..."}
                                ></textarea>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-secondary dark:text-white">{t.notes}</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1 w-full rounded-lg border border-secondary/20 bg-background-light px-4 py-2 text-secondary dark:bg-background-dark dark:text-white"
                                    placeholder={t.notesPlaceholder}
                                ></textarea>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || showSuccess}
                                className="w-full rounded-lg bg-primary px-6 py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90 disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isLoading ? t.submitting : t.submitBtn}
                            </button>
                        </form>

                        {/* Success Message */}
                        {showSuccess && (
                            <div className="mt-6 bg-green-100 border-2 border-green-500 rounded-xl p-6 text-center animate-pulse">
                                <div className="text-5xl mb-3">🎉</div>
                                <h3 className="text-2xl font-bold text-green-700 mb-2">{t.successTitle}</h3>
                                <p className="text-green-600">{t.successMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
