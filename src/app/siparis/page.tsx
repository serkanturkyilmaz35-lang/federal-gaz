"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import WarningModal from "@/components/WarningModal";
import AuthChoiceModal from "@/components/AuthChoiceModal";
import OrderSummaryModal from "@/components/OrderSummaryModal";
import { parseIcon } from "@/utils/iconUtils";

const translations = {
    TR: {
        title: "Sipariş Ver",
        subtitle: "Hızlı ve güvenli sipariş için formu doldurun.",
        name: "Ad Soyad *",
        company: "Firma *",
        email: "E-posta *",
        phone: "Telefon *",
        product: "Ürün Seçimi",
        selectProduct: "Ürün Seçiniz",
        products: ["Oksijen", "Karışım", "Argon", "Lpg", "Azot", "Karbondioksit", "Asetilen", "Propan", "Diğer"],
        amount: "Miktar",
        unit: "Birim",
        units: ["Adet", "m³", "kg", "Litre"],
        address: "Teslimat Adresi *",
        addressPlaceholder: "Adres giriniz...",
        notes: "Ek Notlar",
        notesPlaceholder: "Varsa ek taleplerinizi belirtin...",
        submitBtn: "Sipariş Ver",
        addProductBtn: "Ürün Ekle",
        basketTitle: "Sipariş Sepeti",
        emptyBasket: "Henüz ürün eklenmedi.",
        submitting: "Gönderiliyor...",
        successTitle: "🎉 Siparişiniz Alındı!",
        successMessage: "Siparişiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
        errorMessage: "Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        maxItemsError: "Tek siparişte en fazla 5 ürün ekleyebilirsiniz.",
        fillProductError: "Lütfen ürün, miktar ve birim seçiniz.",
        otherProductNoteRequired: "'Diğer' seçeneği için lütfen Ek Notlar alanına hangi ürünü istediğinizi detaylı olarak yazın.",
        otherProductNotAdded: "'Diğer' ürünü henüz sepete eklenmedi! Lütfen önce 'Ürün Ekle' butonuna tıklayın.",
        savedAddresses: "Kayıtlı Adreslerim",
        newAddress: "Yeni Adres Gir",
        contactInfo: "İletişim Bilgileri",
        clearSelection: "Seçimi Temizle",
        productLabel: "Ürün",
        quantityLabel: "Miktar",
        actionLabel: "İşlem",
        industrialGas: "Endüstriyel Gaz",
        delete: "Sil",
        additionalInfo: "Ek Bilgiler",
        selectOption: "Seçiniz"
    },
    EN: {
        title: "Order Now",
        subtitle: "Fill out the form for quick and secure ordering.",
        name: "Full Name *",
        company: "Company *",
        email: "Email *",
        phone: "Phone *",
        product: "Product Selection",
        selectProduct: "Select Product",
        products: ["Oxygen", "Mixture", "Argon", "Lpg", "Nitrogen", "Carbon Dioxide", "Acetylene", "Propane", "Other"],
        amount: "Amount",
        unit: "Unit",
        units: ["Piece", "m³", "kg", "Liter"],
        address: "Delivery Address *",
        addressPlaceholder: "Enter address...",
        notes: "Additional Notes",
        notesPlaceholder: "Specify additional requests if any...",
        submitBtn: "Order Now",
        addProductBtn: "Add Product",
        basketTitle: "Order Basket",
        emptyBasket: "No items added yet.",
        submitting: "Submitting...",
        successTitle: "🎉 Order Received!",
        successMessage: "Your order has been received successfully. We will contact you shortly.",
        errorMessage: "An error occurred while submitting your order. Please try again.",
        maxItemsError: "You can add maximum 5 items per order.",
        fillProductError: "Please select product, amount and unit.",
        otherProductNoteRequired: "For 'Other' option, please describe in detail which product you need in the Additional Notes section.",
        otherProductNotAdded: "'Other' product has not been added to the basket yet! Please click 'Add Product' button first.",
        savedAddresses: "Saved Addresses",
        newAddress: "Enter New Address",
        contactInfo: "Contact Information",
        clearSelection: "Clear Selection",
        productLabel: "Product",
        quantityLabel: "Quantity",
        actionLabel: "Action",
        industrialGas: "Industrial Gas",
        delete: "Delete",
        additionalInfo: "Additional Information",
        selectOption: "Select"
    }
};

const fireConfetti = async () => {
    const confetti = (await import('canvas-confetti')).default;
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    function randomInRange(min: number, max: number) { return Math.random() * (max - min) + min; }
    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
    confetti({ particleCount: 200, spread: 100, origin: { x: 0.5, y: 0.5 }, zIndex: 9999 });
};

interface SavedAddress {
    id: number;
    title: string;
    address: string;
    isDefault: boolean;
}

interface BasketItem {
    id: number;
    product: string;
    amount: string;
    unit: string;
}

export default function SiparisPage() {
    const { language } = useLanguage();
    const { user } = useAuth();
    const { settings } = useSettings();
    const { executeRecaptcha } = useRecaptcha();
    const router = useRouter();
    const t = translations[language];
    const notesRef = useRef<HTMLTextAreaElement>(null);

    // Parse products and units from settings (JSON strings)
    const products: string[] = (() => {
        // When EN, always use translations. When TR, use settings or fallback.
        if (language === 'EN') return t.products;
        try {
            const parsed = JSON.parse(settings.order_form_products || '[]');
            return parsed.length > 0 ? parsed : t.products;
        } catch {
            return t.products;
        }
    })();

    const units: string[] = (() => {
        // When EN, always use translations. When TR, use settings or fallback.
        if (language === 'EN') return t.units;
        try {
            const parsed = JSON.parse(settings.order_form_units || '[]');
            return parsed.length > 0 ? parsed : t.units;
        } catch {
            return t.units;
        }
    })();

    // Modal States
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [showAuthChoice, setShowAuthChoice] = useState(false);
    const [showOtherNoteModal, setShowOtherNoteModal] = useState(false);
    const [tempOtherNote, setTempOtherNote] = useState("");

    // Form inputs
    const [contactData, setContactData] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        notes: ""
    });

    // Product Helper State
    const [currentProduct, setCurrentProduct] = useState({
        product: "",
        amount: "1",
        unit: units[0] || t.units[0]
    });

    // Basket State
    const [basket, setBasket] = useState<BasketItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [completedOrderId, setCompletedOrderId] = useState<number | null>(null);
    const [completedOrderDetails, setCompletedOrderDetails] = useState<any>(null);
    const [error, setError] = useState("");
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | "custom">("custom");

    // Fetch saved addresses
    useEffect(() => {
        if (user) {
            fetch('/api/user/address').then(res => res.json()).then(data => {
                if (data.addresses && data.addresses.length > 0) {
                    setSavedAddresses(data.addresses);
                    const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id);
                        setContactData(prev => ({ ...prev, address: defaultAddr.address }));
                    }
                }
            }).catch(() => { });

            setContactData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setContactData({ ...contactData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "custom") {
            setSelectedAddressId("custom");
            setContactData(prev => ({ ...prev, address: "" }));
        } else {
            const addrId = parseInt(value);
            setSelectedAddressId(addrId);
            const addr = savedAddresses.find(a => a.id === addrId);
            if (addr) setContactData(prev => ({ ...prev, address: addr.address }));
        }
    };

    // Handle Current Product Inputs
    const handleProductInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newData = { ...currentProduct, [name]: value };

        // Check if "Diğer" (Other) is selected - open modal
        if (name === "product" && (value === "Diğer" || value === "Other")) {
            setTempOtherNote("");
            setShowOtherNoteModal(true);
            // Set product to "Diğer" but will only finalize if note is saved
            setCurrentProduct({ ...currentProduct, product: value, amount: "1" });
            return;
        }

        // Check if changing from "Diğer" with notes written but not added
        if (name === "product") {
            const wasOther = currentProduct.product === "Diğer" || currentProduct.product === "Other";
            const isChangingToAnother = value !== "Diğer" && value !== "Other" && value !== "";
            const hasOtherInBasket = basket.some(item => item.product === "Diğer" || item.product === "Other");
            if (wasOther && isChangingToAnother && contactData.notes.trim() && !hasOtherInBasket) {
                setError(t.otherProductNotAdded);
                return; // Don't allow changing product
            }
        }

        // Auto-set amount to 1 when product is selected
        if (name === "product" && value) {
            newData.amount = "1";
        }

        setCurrentProduct(newData);
        setError("");
    };

    // Handle "Other" note modal save
    const handleOtherNoteSave = () => {
        if (!tempOtherNote.trim()) {
            return; // Don't save empty note
        }
        setContactData(prev => ({ ...prev, notes: tempOtherNote }));
        setShowOtherNoteModal(false);
        setError("");
    };

    // Handle "Other" note modal cancel
    const handleOtherNoteCancel = () => {
        setShowOtherNoteModal(false);
        setCurrentProduct({ product: "", amount: "1", unit: t.units[0] });
    };

    // Add to Basket
    const addToBasket = () => {
        if (!currentProduct.product || !currentProduct.amount || !currentProduct.unit) {
            setError(t.fillProductError);
            return;
        }

        // Check if "Diğer" (Other) is selected and notes are empty
        const isOther = currentProduct.product === "Diğer" || currentProduct.product === "Other";
        if (isOther && !contactData.notes.trim()) {
            setError(t.otherProductNoteRequired);
            // Scroll to notes and focus
            notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => notesRef.current?.focus(), 300);
            return;
        }

        // Check Unique Limit (Max 5)
        const isUnique = !basket.some(item => item.product === currentProduct.product);
        if (isUnique && basket.length >= 5) {
            setShowWarningModal(true);
            return;
        }

        // Merge Logic
        const existingItemIndex = basket.findIndex(
            item => item.product === currentProduct.product && item.unit === currentProduct.unit
        );

        if (existingItemIndex > -1) {
            // Update existing
            const newBasket = [...basket];
            const currentAmount = parseInt(newBasket[existingItemIndex].amount) || 0;
            const addedAmount = parseInt(currentProduct.amount) || 0;
            newBasket[existingItemIndex].amount = (currentAmount + addedAmount).toString();
            setBasket(newBasket);
        } else {
            // Add new
            setBasket([...basket, { ...currentProduct, id: Date.now() }]);
        }

        // Reset inputs
        setCurrentProduct({ product: "", amount: "1", unit: t.units[0] });
        setError("");
    };

    const removeFromBasket = (id: number) => {
        const itemToRemove = basket.find(item => item.id === id);
        // If removing "Diğer" product, clear the notes
        if (itemToRemove && (itemToRemove.product === "Diğer" || itemToRemove.product === "Other")) {
            setContactData(prev => ({ ...prev, notes: "" }));
        }
        setBasket(basket.filter(item => item.id !== id));
    };

    const updateBasketAmount = (id: number, newAmount: string) => {
        setBasket(basket.map(item => item.id === id ? { ...item, amount: newAmount } : item));
    };

    // Handle Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!contactData.name || !contactData.phone || !contactData.address) {
            setError(t.errorMessage);
            return;
        }

        if (basket.length === 0) {
            // If basket is empty and no product is currently selected, show empty basket error
            if (!currentProduct.product || !currentProduct.amount) {
                setError(t.emptyBasket);
                return;
            }
            // If there's a product selected but not added, remind user to add it first
            setError(language === "TR"
                ? "Lütfen önce ürünü sepete ekleyin veya sepetiniz boş."
                : "Please add the product to basket first or your basket is empty.");
            return;
        }

        // Check if "Diğer" is selected with notes but not added to basket
        const isOtherSelected = currentProduct.product === "Diğer" || currentProduct.product === "Other";
        if (isOtherSelected && contactData.notes.trim()) {
            setError(t.otherProductNotAdded);
            return;
        }

        // Check if user logged in
        if (!user) {
            setShowAuthChoice(true);
            return;
        }

        submitOrder();
    };

    const handleGuestCheckout = () => {
        setShowAuthChoice(false);
        submitOrder();
    };

    const [customValues, setCustomValues] = useState<Record<string, string>>({});

    const submitOrder = async () => {
        setIsLoading(true);
        setError("");

        // Prepare order items
        const orderItems = basket.length > 0 ? basket : [{
            product: currentProduct.product,
            amount: currentProduct.amount,
            unit: currentProduct.unit
        }];

        try {
            let finalNotes = contactData.notes;
            if (Object.keys(customValues).length > 0) {
                finalNotes += "\n\n--- Ek Bilgiler ---\n";
                Object.entries(customValues).forEach(([key, val]) => {
                    finalNotes += `${key}: ${val}\n`;
                });
            }

            // Get reCAPTCHA token
            const recaptchaToken = await executeRecaptcha('order_form');

            const orderData = {
                name: contactData.name,
                company: contactData.company,
                email: contactData.email,
                phone: contactData.phone,
                address: contactData.address,
                notes: finalNotes,
                items: orderItems,
                language,
                recaptchaToken
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            // Handle non-JSON response gracefully
            const contentType = res.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON Response:", text);
                throw new Error("Sunucu hatası oluştu (Geçersiz yanıt).");
            }

            if (!res.ok) {
                throw new Error(data.error || t.errorMessage);
            }

            // Save order details for summary modal
            setCompletedOrderId(data.orderId);
            setCompletedOrderDetails({
                name: contactData.name,
                company: contactData.company,
                email: contactData.email,
                phone: contactData.phone,
                address: contactData.address,
                notes: contactData.notes,
                items: orderItems
            });
            setShowOrderSummary(true);
            setBasket([]);

        } catch (err: any) {
            console.error(err);
            setError(err.message || t.errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <WarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                title="Limit Uyarısı"
                message={t.maxItemsError + " Sipariş verdikten sonra tekrar sipariş ver ekranına gelip yeniden sipariş verebilirsiniz."}
            />

            <AuthChoiceModal
                isOpen={showAuthChoice}
                onClose={() => setShowAuthChoice(false)}
                onGuestContinue={handleGuestCheckout}
            />

            {/* Other Product Note Modal */}
            {showOtherNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleOtherNoteCancel} />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                {(() => {
                                    const { name, color } = parseIcon(settings.order_form_icon_note || 'edit_note');
                                    return <span className="material-symbols-outlined text-2xl" style={{ color: color || undefined }}>{name}</span>
                                })()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    {language === "TR" ? "Ürün Detayı Gerekli" : "Product Details Required"}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {language === "TR" ? "'Diğer' seçeneği için detay giriniz" : "Please provide details for 'Other' option"}
                                </p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                {language === "TR" ? "Hangi ürünü istiyorsunuz? *" : "Which product do you need? *"}
                            </label>
                            <textarea
                                value={tempOtherNote}
                                onChange={(e) => setTempOtherNote(e.target.value)}
                                placeholder={language === "TR" ? "Örn: 10 adet 50 litrelik helyum tüpü, balon dolumu için..." : "E.g: 10 x 50 liter helium cylinders for balloon filling..."}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-white text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleOtherNoteCancel}
                                className="flex-1 rounded-xl border border-gray-300 py-3 font-bold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {language === "TR" ? "İptal" : "Cancel"}
                            </button>
                            <button
                                type="button"
                                onClick={handleOtherNoteSave}
                                disabled={!tempOtherNote.trim()}
                                className="flex-1 rounded-xl bg-primary py-3 font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {language === "TR" ? "Kaydet" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Summary Modal */}
            {showOrderSummary && completedOrderId && completedOrderDetails && (
                <OrderSummaryModal
                    isOpen={showOrderSummary}
                    orderId={completedOrderId}
                    orderDetails={completedOrderDetails}
                    language={language}
                />
            )}

            <div className="mx-auto max-w-4xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                        {language === 'EN' ? t.title : (settings.order_form_title || t.title)}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {language === 'EN' ? t.subtitle : (settings.order_form_subtitle || t.subtitle)}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800 md:p-8">
                    {/* Saved Addresses Logic */}
                    {savedAddresses.length > 0 && user && (
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">{t.savedAddresses}</label>
                            <select
                                value={selectedAddressId}
                                onChange={handleAddressChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base"
                            >
                                <option value="custom">{t.newAddress}</option>
                                {savedAddresses.map(addr => (
                                    <option key={addr.id} value={addr.id}>{addr.title} - {addr.address.substring(0, 30)}...</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-secondary dark:text-white border-b pb-2">{t.contactInfo}</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <input type="text" name="name" value={contactData.name} onChange={handleContactChange} placeholder={language === 'EN' ? t.name : (settings.order_form_name_label || t.name)} required className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base" />
                                <input type="text" name="company" value={contactData.company} onChange={handleContactChange} placeholder={language === 'EN' ? t.company : (settings.order_form_company_label || t.company)} required className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base" />
                                <input type="email" name="email" value={contactData.email} onChange={handleContactChange} placeholder={language === 'EN' ? t.email : (settings.order_form_email_label || t.email)} required className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base" />
                                <input type="tel" name="phone" value={contactData.phone} onChange={handleContactChange} placeholder={language === 'EN' ? t.phone : (settings.order_form_phone_label || t.phone)} required className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base" />
                                <div className="md:col-span-2">
                                    <label className="mb-1 block text-sm font-bold text-secondary dark:text-white">{language === 'EN' ? t.address : (settings.order_form_address_label || t.address)}</label>
                                    <textarea name="address" value={contactData.address} onChange={e => { handleContactChange(e); setSelectedAddressId("custom"); }} required rows={2} className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base" placeholder={t.addressPlaceholder} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Products Basket */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-xl font-bold text-secondary dark:text-white">{language === 'EN' ? t.basketTitle : (settings.order_form_basket_title || t.basketTitle)}</h3>
                            </div>

                            {/* Add Product Area */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-white/5 dark:border-gray-700">
                                <div className="grid gap-4 md:grid-cols-12 items-end">
                                    <div className="md:col-span-5">
                                        <label className="text-sm font-bold text-secondary dark:text-white">{language === 'EN' ? t.product : (settings.order_form_product_label || t.product)}</label>
                                        <select name="product" value={currentProduct.product} onChange={handleProductInput} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-base bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                            <option value="">{language === 'EN' ? t.selectProduct : (settings.order_form_select_product || t.selectProduct)}</option>
                                            {products.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-sm font-bold text-secondary dark:text-white">{language === 'EN' ? t.amount : (settings.order_form_amount_label || t.amount)}</label>
                                        <div className="mt-1 flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden h-[50px] dark:bg-gray-800 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = parseInt(currentProduct.amount) || 1;
                                                    if (val > 1) setCurrentProduct({ ...currentProduct, amount: (val - 1).toString() });
                                                }}
                                                className="px-4 h-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors border-r border-gray-200 dark:border-gray-700 text-xl font-bold"
                                            >
                                                −
                                            </button>
                                            <div className="flex-1 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-lg font-bold text-secondary dark:text-white min-w-[3rem]">
                                                {currentProduct.amount || "1"}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const val = parseInt(currentProduct.amount) || 1;
                                                    setCurrentProduct({ ...currentProduct, amount: (val + 1).toString() });
                                                }}
                                                className="px-4 h-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors border-l border-gray-200 dark:border-gray-700 text-xl font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-secondary dark:text-white">{language === 'EN' ? t.unit : (settings.order_form_unit_label || t.unit)}</label>
                                        <select name="unit" value={currentProduct.unit} onChange={handleProductInput} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-base bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                                            {units.map((u, i) => <option key={i} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <button
                                            type="button"
                                            onClick={addToBasket}
                                            className="w-full rounded-lg bg-primary h-[50px] font-bold text-white transition-transform hover:scale-105 hover:bg-primary/90 flex items-center justify-center gap-1"
                                        >
                                            {(() => {
                                                const { name, color } = parseIcon(settings.order_form_icon_add || 'add');
                                                return <span className="material-symbols-outlined text-sm" style={{ color: color || undefined }}>{name}</span>
                                            })()}
                                            {language === 'EN' ? t.addProductBtn : (settings.order_form_add_product_btn || t.addProductBtn)}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {basket.length > 0 && (
                                <div className="mt-4 text-right">
                                    <button
                                        type="button"
                                        onClick={() => setBasket([])}
                                        className="text-sm text-red-500 hover:text-red-700 font-bold hover:underline transition-colors"
                                    >
                                        {t.clearSelection}
                                    </button>
                                </div>
                            )}

                            {/* Basket List (Mobile Responsive) */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden dark:bg-white/5 dark:border-gray-700">
                                    {basket.length > 0 && (
                                        <div className="hidden sm:grid grid-cols-12 gap-4 p-3 bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                                            <div className="col-span-1 text-center">#</div>
                                            <div className="col-span-5">{t.productLabel}</div>
                                            <div className="col-span-4 text-center">{t.quantityLabel}</div>
                                            <div className="col-span-2 text-right">{t.actionLabel}</div>
                                        </div>
                                    )}

                                    {basket.length === 0 ? (
                                        <p className="text-center text-gray-400 italic py-8">{language === 'EN' ? t.emptyBasket : (settings.order_form_empty_basket || t.emptyBasket)}</p>
                                    ) : (
                                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {basket.map((item, index) => (
                                                <div key={item.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:gap-4 items-start sm:items-center p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">

                                                    {/* Mobile Top Row: Index + Name */}
                                                    <div className="w-full sm:col-span-6 flex items-center gap-3">
                                                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-lg sm:text-base text-secondary dark:text-white">{item.product}</h4>
                                                            <span className="text-xs text-gray-500 hidden sm:inline-block">{t.industrialGas}</span>
                                                        </div>
                                                    </div>

                                                    {/* Mobile Bottom Row: Controls */}
                                                    <div className="w-full sm:col-span-6 flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden h-10 sm:h-9 shadow-sm dark:bg-gray-800 dark:border-gray-600">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const val = parseInt(item.amount);
                                                                    if (val > 1) updateBasketAmount(item.id, (val - 1).toString());
                                                                }}
                                                                className="px-4 sm:px-3 h-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors border-r border-gray-200 dark:border-gray-700"
                                                            >
                                                                -
                                                            </button>
                                                            <div className="px-4 h-full flex items-center justify-center min-w-[3rem] bg-gray-50 dark:bg-gray-900 text-base font-bold text-secondary dark:text-white">
                                                                {item.amount} <span className="text-xs font-normal text-gray-500 ml-1">{item.unit}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const val = parseInt(item.amount);
                                                                    updateBasketAmount(item.id, (val + 1).toString());
                                                                }}
                                                                className="px-4 sm:px-3 h-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors border-l border-gray-200 dark:border-gray-700"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        {/* Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromBasket(item.id)}
                                                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                                                            title={t.delete}
                                                        >
                                                            {(() => {
                                                                const { name, color } = parseIcon(settings.order_form_icon_delete || 'delete');
                                                                return <span className="material-symbols-outlined text-xl" style={{ color: color || undefined }}>{name}</span>
                                                            })()}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>



                        {/* 4. Dynamic Fields */}
                        <div className="space-y-4">
                            {(() => {
                                try {
                                    const fields: any[] = JSON.parse(settings.order_form_fields || "[]");
                                    if (fields.length === 0) return null;

                                    return (
                                        <>
                                            <h3 className="text-xl font-bold text-secondary dark:text-white border-b pb-2">Ek Bilgiler</h3>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {fields.map((field) => {
                                                    if (!field.enabled) return null;
                                                    return (
                                                        <div key={field.id} className={`${field.width === 'half' ? 'md:col-span-1' : 'md:col-span-2'}`}>
                                                            <label className="mb-1 block text-sm font-bold text-secondary dark:text-white">
                                                                {field.label} {field.required && '*'}
                                                            </label>
                                                            {field.type === 'textarea' ? (
                                                                <textarea
                                                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base"
                                                                    placeholder={field.placeholder}
                                                                    required={field.required}
                                                                    onChange={(e) => setCustomValues(prev => ({ ...prev, [field.label]: e.target.value }))}
                                                                />
                                                            ) : field.type === 'select' ? (
                                                                <select
                                                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base"
                                                                    required={field.required}
                                                                    onChange={(e) => setCustomValues(prev => ({ ...prev, [field.label]: e.target.value }))}
                                                                >
                                                                    <option value="">{t.selectOption}</option>
                                                                    {field.options?.map((opt: string, i: number) => (
                                                                        <option key={i} value={opt}>{opt}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <input
                                                                    type={field.type}
                                                                    className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base"
                                                                    placeholder={field.placeholder}
                                                                    required={field.required}
                                                                    onChange={(e) => setCustomValues(prev => ({ ...prev, [field.label]: e.target.value }))}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div >
                                        </>
                                    );
                                } catch { return null; }
                            })()}
                        </div>

                        {/* 5. Notes */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-secondary dark:text-white border-b pb-2">{language === 'EN' ? t.notes : (settings.order_form_notes_label || t.notes)}</h3>
                            <textarea ref={notesRef} name="notes" value={contactData.notes} onChange={handleContactChange} placeholder={language === 'EN' ? t.notesPlaceholder : (settings.order_form_notes_placeholder || t.notesPlaceholder)} rows={3} className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white text-base" />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-100 p-4 text-center text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full transform rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isLoading
                                ? (language === 'EN' ? t.submitting : (settings.order_form_submitting || t.submitting))
                                : (language === 'EN' ? t.submitBtn : (settings.order_form_submit_btn || t.submitBtn))}
                        </button>
                    </form>
                </div>
            </div >
        </div >
    );
}
