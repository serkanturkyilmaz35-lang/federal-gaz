"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import SettingFieldWrapper from "@/components/dashboard/SettingFieldWrapper";
import DynamicFieldBuilder, { FormField } from "@/components/dashboard/DynamicFieldBuilder";

// Default settings structure
const defaultSettings = {
    // General
    site_name: "Federal Gaz",
    site_slogan: "Endüstriyel Gaz Çözümleri",
    logo_url: "/logo.jpg",
    favicon_url: "/icon.png",
    footer_copyright: "© 2025 Federal Gaz. Tüm hakları saklıdır.",

    // Contact
    contact_address: "İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara",
    contact_phone: "(0312) 395 35 95",
    contact_phone_1_label: "Merkez",
    contact_phone_2: "(+90) 543 455 45 63",
    contact_phone_2_label: "Ziya Türkyılmaz",
    contact_phone_3: "(+90) 532 422 45 15",
    contact_phone_3_label: "Bayram Tıraş",
    contact_email: "federal.gaz@hotmail.com",

    // Social Media
    instagram_url: "https://www.instagram.com/federal_gaz/",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",

    // SEO
    seo_title: "Federal Gaz - Endüstriyel Gaz Çözümleri | Oksijen, Argon, Azot",
    seo_description: "Federal Gaz - Ankara'nın güvenilir endüstriyel gaz tedarikçisi. Oksijen, argon, azot, CO2 ve tüm endüstriyel gazlar.",
    seo_keywords: "federal gaz, endüstriyel gaz, oksijen, argon, azot, tüp dolum, ankara gaz",

    // Homepage & Content
    homepage_marquee_text: "Önemli Duyuru: Federal Gaz sipariş ve destek talepleriniz için 7/24 iletişim e-posta adresimiz federal.gaz@hotmail.com",

    // Map Coordinates
    contact_map_lat: "39.9876",
    contact_map_lng: "32.7543",

    // Contact Form
    contact_form_title: "İletişim",
    contact_form_subtitle: "Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.",
    contact_form_name_label: "Ad Soyad",
    contact_form_name_placeholder: "Adınız Soyadınız",
    contact_form_email_label: "E-posta",
    contact_form_email_placeholder: "ornek@email.com",
    contact_form_phone_label: "Telefon",
    contact_form_phone_placeholder: "+90 (5XX) XXX XX XX",
    contact_form_message_label: "Mesajınız",
    contact_form_message_placeholder: "Mesajınızı buraya yazın...",
    contact_form_submit_btn: "Gönder",
    contact_form_submitting: "Gönderiliyor...",
    contact_form_success_title: "Mesajınız Gönderildi!",
    contact_form_success_message: "Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.",

    // Order Form
    order_form_title: "Sipariş Ver",
    order_form_subtitle: "Hızlı ve güvenli sipariş için formu doldurun.",
    order_form_name_label: "Ad Soyad *",
    order_form_company_label: "Firma *",
    order_form_email_label: "E-posta *",
    order_form_phone_label: "Telefon *",
    order_form_address_label: "Teslimat Adresi *",
    order_form_product_label: "Ürün Seçimi",
    order_form_select_product: "Ürün Seçiniz",
    order_form_products: JSON.stringify(["Oksijen", "Karışım", "Argon", "Lpg", "Azot", "Karbondioksit", "Asetilen", "Propan", "Diğer"]),
    order_form_amount_label: "Miktar",
    order_form_unit_label: "Birim",
    order_form_units: JSON.stringify(["Adet", "m³", "kg", "Litre"]),
    order_form_notes_label: "Ek Notlar",
    order_form_notes_placeholder: "Varsa ek taleplerinizi belirtin...",
    order_form_submit_btn: "Sipariş Ver",
    order_form_add_product_btn: "Ürün Ekle",
    order_form_basket_title: "Sipariş Sepeti",
    order_form_empty_basket: "Henüz ürün eklenmedi.",
    order_form_submitting: "Gönderiliyor...",
    order_form_success_title: "🎉 Siparişiniz Alındı!",
    order_form_success_message: "Siparişiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
    order_form_error_message: "Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
    order_form_max_items_error: "Tek siparişte en fazla 5 ürün ekleyebilirsiniz.",
    order_form_fill_product_error: "Lütfen ürün, miktar ve birim seçiniz.",
    order_form_other_note_required: "'Diğer' seçeneği için lütfen Ek Notlar alanına hangi ürünü istediğinizi detaylı olarak yazın.",
    order_form_other_not_added: "'Diğer' ürünü henüz sepete eklenmedi! Lütfen önce 'Ürün Ekle' butonuna tıklayın.",
    order_form_other_popup_title: "Ürün Detayı Gerekli",
    order_form_other_popup_subtitle: "'Diğer' seçeneği için detay giriniz",
    order_form_other_popup_label: "Hangi ürünü istiyorsunuz? *",
    order_form_other_popup_placeholder: "Örn: 10 adet 50 litrelik helyum tüpü, balon dolumu için...",

    // System & Dynamic Fields
    system_disabled_keys: "[]",
    contact_form_fields: "[]",
    order_form_fields: "[]",

    // Legal Settings
    legal_cookie_banner_enabled: "true",
    legal_privacy_page_enabled: "true",
    legal_kvkk_page_enabled: "true",
    legal_cookie_policy_page_enabled: "true",
};
type SettingsKey = keyof typeof defaultSettings;

// ... existing code ...

// ... imports
import { useSettings } from "@/context/SettingsContext";

export default function SettingsPage() {
    const { settings: contextSettings, isLoading: contextLoading } = useSettings();
    const router = useRouter();

    // Initialize with context settings if available, otherwise defaults
    // We use a ref to track if we've initialized from context to avoid overwriting user edits
    const initializedRef = useRef(false);

    const [settings, setSettings] = useState(defaultSettings);
    const [originalSettings, setOriginalSettings] = useState(defaultSettings);
    const [disabledKeys, setDisabledKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'content' | 'contactForm' | 'orderForm' | 'social' | 'seo' | 'legal'>('general');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // toggle handler
    const handleToggle = (key: string, enabled: boolean) => {
        setDisabledKeys(prev => {
            if (enabled) {
                return prev.filter(k => k !== key); // Enable = remove from disabled list
            } else {
                return [...prev, key]; // Disable = add to list
            }
        });
        // We mark save status as idle so user can save
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    // Effect: Sync with context settings only once or when they become available
    useEffect(() => {
        if (!contextLoading && contextSettings && !initializedRef.current) {
            const newSettings = { ...defaultSettings, ...contextSettings };

            // Re-parse disabled keys from the raw context setting if possible
            // Note: SettingsContext filters values, so system_disabled_keys might be empty string there.
            // However, we need the Raw keys to manage the toggles. 
            // Since SettingsContext 'hides' disabled keys by setting them to empty string, 
            // we ironically need the RAW data to manage the settings page itself.
            // IF SettingsContext modifies the values, we might need to fetch RAW data strictly for the admin panel.
            // BUT for now, let's try to trust the context or do a "background" fetch if context is filtered.

            // Correction: SettingsContext DOES modify values. It sets disabled ones to "".
            // Useing contextSettings directly for managing the "Settings Page" is risky because we won't see the real values of disabled fields.
            // strategy: Render immediately with what we have, AND fetch fresh RAW data in background.

            setSettings(newSettings);
            // We don't set originalSettings yet because we want the raw data for that
            setLoading(false); // Show UI immediately (maybe with empty disabled fields)
        }
    }, [contextSettings, contextLoading]);


    // Fetch RAW settings for admin management (Background)
    useEffect(() => {
        const fetchRawSettings = async () => {
            try {
                // If we already have content from context, we aren't "loading" visually
                // But we need the raw values for editing.
                const res = await fetch('/api/dashboard/settings');
                const data = await res.json();

                if (data.settings) {
                    const mergedSettings = { ...defaultSettings, ...data.settings };

                    // Parse system_disabled_keys
                    let keys: string[] = [];
                    try {
                        keys = JSON.parse(mergedSettings.system_disabled_keys || "[]");
                    } catch {
                        keys = [];
                    }

                    setDisabledKeys(Array.isArray(keys) ? keys : []);
                    setSettings(mergedSettings);
                    setOriginalSettings(mergedSettings);
                    initializedRef.current = true;
                }
            } catch (error) {
                console.error('Failed to fetch raw settings:', error);
            } finally {
                setLoading(false); // Ensure loading is off even if fetch fails
            }
        };

        fetchRawSettings();
    }, []);

    const handleSave = useCallback(async () => {
        // Sync disabledKeys to settings object before saving
        const currentSettings = {
            ...settings,
            system_disabled_keys: JSON.stringify(disabledKeys)
        };

        // Find changed settings (compare against originalSettings, but simpler to just save keys modified)
        // ... (rest of save logic needs update to use currentSettings)

        // Simpler approach: Just save everything that might have changed + disabled keys
        setSaving(true);
        setSaveStatus('idle');

        try {
            // Prepare array using currentSettings (which includes updated system_disabled_keys)
            const settingsArray = Object.entries(currentSettings).map(([key, value]) => {
                let category: 'general' | 'contact' | 'social' | 'seo' = 'general';
                if (key.startsWith('contact_') || key.startsWith('order_form_') || key === 'contact_form_fields' || key === 'order_form_fields') category = 'contact';
                else if (key.startsWith('seo_')) category = 'seo';
                else if (['instagram_url', 'facebook_url', 'twitter_url', 'linkedin_url', 'youtube_url'].includes(key)) category = 'social';
                else category = 'general';

                return { key, value: String(value ?? ""), category };
            });

            const res = await fetch('/api/dashboard/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: settingsArray }),
            });

            // ... handling response
            if (res.ok) {
                setSaveStatus('success');
                setOriginalSettings(currentSettings); // Update baseline
                setTimeout(() => setSaveStatus('idle'), 3000);
                router.refresh();
            } else {
                setSaveStatus('error');
            }

        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    }, [settings, disabledKeys, router]);

    // Helper to check compatibility with legacy defaultSettings usage
    // ...


    const updateSetting = (key: SettingsKey, value: string) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        // Clear any success/error message when user makes changes
        if (saveStatus !== 'idle') setSaveStatus('idle');
    };

    const tabs = [
        { id: 'general', label: 'Genel', icon: 'settings' },
        { id: 'contact', label: 'İletişim Bilgileri', icon: 'phone' },
        { id: 'content', label: 'Sayfa İçerikleri', icon: 'edit_note' },
        { id: 'contactForm', label: 'İletişim Formu', icon: 'contact_mail' },
        { id: 'orderForm', label: 'Sipariş Formu', icon: 'shopping_cart' },
        { id: 'social', label: 'Sosyal Medya', icon: 'public' },
        { id: 'seo', label: 'SEO', icon: 'search' },
        { id: 'legal', label: 'Yasal', icon: 'gavel' },
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
                        Ayarlar
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Site ayarlarını yönetin.
                    </p>
                </div>

                {/* Centered Status Message */}
                <div className="flex-1 flex justify-center">
                    {saving && (
                        <span className="flex items-center gap-1.5 text-blue-400 text-sm font-medium animate-pulse">
                            <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                            Kaydediliyor...
                        </span>
                    )}
                    {!saving && saveStatus === 'success' && (
                        <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium animate-fade-in">
                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                            Güncellendi
                        </span>
                    )}
                    {!saving && saveStatus === 'error' && (
                        <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium animate-fade-in">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            Kaydetme Hatası
                        </span>
                    )}
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#137fec] hover:bg-[#0e6bc7] text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>

            {/* Main Card */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden border border-[#3b4754]">
                {/* Tabs */}
                <div className="border-b border-[#3b4754]">
                    <nav className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 min-w-[120px] px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 border-b-2 ${activeTab === tab.id
                                    ? 'text-[#137fec] border-[#137fec] bg-[#137fec]/5'
                                    : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
                                <SettingFieldWrapper
                                    settingKey="site_name"
                                    label="Site Adı"
                                    enabled={!disabledKeys.includes('site_name')}
                                    onToggle={handleToggle}
                                >
                                    <input
                                        type="text"
                                        value={settings.site_name}
                                        onChange={(e) => updateSetting('site_name', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="site_slogan"
                                    label="Slogan"
                                    enabled={!disabledKeys.includes('site_slogan')}
                                    onToggle={handleToggle}
                                >
                                    <input
                                        type="text"
                                        value={settings.site_slogan}
                                        onChange={(e) => updateSetting('site_slogan', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <SettingFieldWrapper
                                        settingKey="logo_url"
                                        label="Logo URL"
                                        enabled={!disabledKeys.includes('logo_url')}
                                        onToggle={handleToggle}
                                    >
                                        <input
                                            type="text"
                                            value={settings.logo_url}
                                            onChange={(e) => updateSetting('logo_url', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                        />
                                    </SettingFieldWrapper>
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        Önerilen: 512x512px, PNG veya WebP formatı. Medya kütüphanesinden URL kopyalayabilirsiniz.
                                    </p>
                                </div>
                                <div>
                                    <SettingFieldWrapper
                                        settingKey="favicon_url"
                                        label="Favicon URL"
                                        enabled={!disabledKeys.includes('favicon_url')}
                                        onToggle={handleToggle}
                                    >
                                        <input
                                            type="text"
                                            value={settings.favicon_url}
                                            onChange={(e) => updateSetting('favicon_url', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                        />
                                    </SettingFieldWrapper>
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        Önerilen: 32x32px veya 16x16px, .ico veya .png formatı.
                                    </p>
                                </div>
                            </div>

                            {/* Footer Copyright Text */}
                            <div>
                                <SettingFieldWrapper
                                    settingKey="footer_copyright"
                                    label="Footer Copyright Metni"
                                    enabled={!disabledKeys.includes('footer_copyright')}
                                    onToggle={handleToggle}
                                >
                                    <input
                                        type="text"
                                        value={settings.footer_copyright || ''}
                                        onChange={(e) => updateSetting('footer_copyright', e.target.value)}
                                        placeholder="© 2025 Federal Gaz. Tüm hakları saklıdır."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                        </div>
                    )}

                    {/* Contact Settings */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
                                <SettingFieldWrapper
                                    settingKey="contact_address"
                                    label="Adres"
                                    enabled={!disabledKeys.includes('contact_address')}
                                    onToggle={handleToggle}
                                >
                                    <textarea
                                        value={settings.contact_address}
                                        onChange={(e) => updateSetting('contact_address', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                                <p className="text-xs text-gray-500 mt-1.5">Footer ve İletişim sayfasında görünür.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <SettingFieldWrapper
                                        settingKey="contact_phone_1_label"
                                        enabled={!disabledKeys.includes('contact_phone_1_label')}
                                        onToggle={handleToggle}
                                        className="mb-3"
                                    >
                                        <label className="block text-xs text-gray-400 mb-1">Telefon 1 Etiket (Örn: Merkez)</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone_1_label || ''}
                                            onChange={(e) => updateSetting('contact_phone_1_label', e.target.value)}
                                            className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white"
                                            placeholder="Etiket (Opsiyonel)"
                                        />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper
                                        settingKey="contact_phone"
                                        enabled={!disabledKeys.includes('contact_phone')}
                                        onToggle={handleToggle}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 1</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone}
                                            onChange={(e) => updateSetting('contact_phone', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </SettingFieldWrapper>
                                </div>
                                <div className="self-center hidden md:block">
                                    <p className="text-xs text-gray-500">Footer ve İletişim sayfasında görünür.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <SettingFieldWrapper
                                        settingKey="contact_phone_2_label"
                                        enabled={!disabledKeys.includes('contact_phone_2_label')}
                                        onToggle={handleToggle}
                                        className="mb-3"
                                    >
                                        <label className="block text-xs text-gray-400 mb-1">Telefon 2 Etiket (Örn: Satış)</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone_2_label || ''}
                                            onChange={(e) => updateSetting('contact_phone_2_label', e.target.value)}
                                            className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white"
                                            placeholder="Etiket (Opsiyonel)"
                                        />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper
                                        settingKey="contact_phone_2"
                                        enabled={!disabledKeys.includes('contact_phone_2')}
                                        onToggle={handleToggle}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 2 (GSM)</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone_2}
                                            onChange={(e) => updateSetting('contact_phone_2', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </SettingFieldWrapper>
                                </div>
                                <div className="self-center hidden md:block">
                                    <p className="text-xs text-gray-500">Footer ve İletişim sayfasında görünür.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <SettingFieldWrapper
                                        settingKey="contact_phone_3_label"
                                        enabled={!disabledKeys.includes('contact_phone_3_label')}
                                        onToggle={handleToggle}
                                        className="mb-3"
                                    >
                                        <label className="block text-xs text-gray-400 mb-1">Telefon 3 Etiket (Örn: Muhasebe)</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone_3_label || ''}
                                            onChange={(e) => updateSetting('contact_phone_3_label', e.target.value)}
                                            className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white"
                                            placeholder="Etiket (Opsiyonel)"
                                        />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper
                                        settingKey="contact_phone_3"
                                        enabled={!disabledKeys.includes('contact_phone_3')}
                                        onToggle={handleToggle}
                                    >
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 3 (GSM)</label>
                                        <input
                                            type="text"
                                            value={settings.contact_phone_3}
                                            onChange={(e) => updateSetting('contact_phone_3', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </SettingFieldWrapper>
                                </div>
                                <div className="self-center hidden md:block">
                                    <p className="text-xs text-gray-500">Footer ve İletişim sayfasında görünür.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <SettingFieldWrapper
                                    settingKey="contact_email"
                                    enabled={!disabledKeys.includes('contact_email')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        value={settings.contact_email}
                                        onChange={(e) => updateSetting('contact_email', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                                <p className="text-xs text-gray-500 mt-1.5">Footer ve İletişim sayfasında görünür.</p>
                            </div>
                        </div>
                    )}

                    {/* Social Media Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
                                <SettingFieldWrapper
                                    settingKey="instagram_url"
                                    enabled={!disabledKeys.includes('instagram_url')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-pink-500">photo_camera</span> Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.instagram_url}
                                        onChange={(e) => updateSetting('instagram_url', e.target.value)}
                                        placeholder="https://instagram.com/..."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="facebook_url"
                                    enabled={!disabledKeys.includes('facebook_url')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">facebook</span> Facebook
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.facebook_url}
                                        onChange={(e) => updateSetting('facebook_url', e.target.value)}
                                        placeholder="https://facebook.com/..."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="twitter_url"
                                    enabled={!disabledKeys.includes('twitter_url')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sky-400">tag</span> Twitter / X
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.twitter_url}
                                        onChange={(e) => updateSetting('twitter_url', e.target.value)}
                                        placeholder="https://twitter.com/..."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="linkedin_url"
                                    enabled={!disabledKeys.includes('linkedin_url')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">work</span> LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.linkedin_url}
                                        onChange={(e) => updateSetting('linkedin_url', e.target.value)}
                                        placeholder="https://linkedin.com/..."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="youtube_url"
                                    enabled={!disabledKeys.includes('youtube_url')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-500">play_circle</span> YouTube
                                    </label>
                                    <input
                                        type="url"
                                        value={settings.youtube_url}
                                        onChange={(e) => updateSetting('youtube_url', e.target.value)}
                                        placeholder="https://youtube.com/..."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                            </div>
                        </div>
                    )}

                    {/* Content Settings */}
                    {activeTab === 'content' && (
                        <div className="space-y-6 max-w-4xl">
                            {/* Marquee / Kayan Yazı */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <SettingFieldWrapper
                                    settingKey="homepage_marquee_text"
                                    enabled={!disabledKeys.includes('homepage_marquee_text')}
                                    onToggle={handleToggle}
                                >
                                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-500">text_rotation_none</span>
                                        Kayan Yazı (Duyuru Bandı)
                                    </label>
                                    <textarea
                                        value={settings.homepage_marquee_text}
                                        onChange={(e) => updateSetting('homepage_marquee_text', e.target.value)}
                                        rows={2}
                                        placeholder="Ana sayfada görünen kayan duyuru metni..."
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Ana sayfanın en üstünde kayan sarı bant üzerinde görünür.
                                </p>
                            </div>

                            {/* Map Location Settings */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-400">location_on</span>
                                    Harita Konumu
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <SettingFieldWrapper
                                            settingKey="contact_map_lat"
                                            enabled={!disabledKeys.includes('contact_map_lat')}
                                            onToggle={handleToggle}
                                        >
                                            <label className="block text-xs text-gray-400 mb-1">Enlem (Latitude)</label>
                                            <input
                                                type="text"
                                                value={settings.contact_map_lat}
                                                onChange={(e) => updateSetting('contact_map_lat', e.target.value)}
                                                placeholder="39.9876"
                                                className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                            />
                                        </SettingFieldWrapper>
                                    </div>
                                    <div>
                                        <SettingFieldWrapper
                                            settingKey="contact_map_lng"
                                            enabled={!disabledKeys.includes('contact_map_lng')}
                                            onToggle={handleToggle}
                                        >
                                            <label className="block text-xs text-gray-400 mb-1">Boylam (Longitude)</label>
                                            <input
                                                type="text"
                                                value={settings.contact_map_lng}
                                                onChange={(e) => updateSetting('contact_map_lng', e.target.value)}
                                                placeholder="32.7543"
                                                className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                            />
                                        </SettingFieldWrapper>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Google Maps'ten koordinatları kopyalayın. Örn: 39.9876, 32.7543
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Contact Form Settings Tab */}
                    {activeTab === 'contactForm' && (
                        <div className="space-y-6 max-w-4xl">
                            {/* Page Titles */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">title</span>
                                    Sayfa Başlıkları
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <SettingFieldWrapper settingKey="contact_form_title" enabled={!disabledKeys.includes('contact_form_title')} onToggle={handleToggle}>
                                            <label className="block text-xs text-gray-400 mb-1">Sayfa Başlığı</label>
                                            <input type="text" value={settings.contact_form_title} onChange={(e) => updateSetting('contact_form_title', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                        </SettingFieldWrapper>
                                    </div>
                                    <div>
                                        <SettingFieldWrapper settingKey="contact_form_subtitle" enabled={!disabledKeys.includes('contact_form_subtitle')} onToggle={handleToggle}>
                                            <label className="block text-xs text-gray-400 mb-1">Alt Başlık</label>
                                            <input type="text" value={settings.contact_form_subtitle} onChange={(e) => updateSetting('contact_form_subtitle', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                        </SettingFieldWrapper>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Dynamic Fields */}
                            <DynamicFieldBuilder
                                title="İletişim Formu Alanları"
                                initialFields={settings.contact_form_fields || "[]"}
                                onChange={(newFields) => updateSetting('contact_form_fields', JSON.stringify(newFields))}
                            />

                            {/* Standard Fields Config (Labels only) */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-400">input</span>
                                    Sabit Form Alanları ve Etiketleri
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingFieldWrapper settingKey="contact_form_name_label" enabled={!disabledKeys.includes('contact_form_name_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ad Soyad Etiketi</label>
                                        <input type="text" value={settings.contact_form_name_label} onChange={(e) => updateSetting('contact_form_name_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_name_placeholder" enabled={!disabledKeys.includes('contact_form_name_placeholder')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ad Soyad Placeholder</label>
                                        <input type="text" value={settings.contact_form_name_placeholder} onChange={(e) => updateSetting('contact_form_name_placeholder', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_email_label" enabled={!disabledKeys.includes('contact_form_email_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">E-posta Etiketi</label>
                                        <input type="text" value={settings.contact_form_email_label} onChange={(e) => updateSetting('contact_form_email_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_email_placeholder" enabled={!disabledKeys.includes('contact_form_email_placeholder')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">E-posta Placeholder</label>
                                        <input type="text" value={settings.contact_form_email_placeholder} onChange={(e) => updateSetting('contact_form_email_placeholder', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_phone_label" enabled={!disabledKeys.includes('contact_form_phone_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Telefon Etiketi</label>
                                        <input type="text" value={settings.contact_form_phone_label} onChange={(e) => updateSetting('contact_form_phone_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_phone_placeholder" enabled={!disabledKeys.includes('contact_form_phone_placeholder')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Telefon Placeholder</label>
                                        <input type="text" value={settings.contact_form_phone_placeholder} onChange={(e) => updateSetting('contact_form_phone_placeholder', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_message_label" enabled={!disabledKeys.includes('contact_form_message_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Mesaj Etiketi</label>
                                        <input type="text" value={settings.contact_form_message_label} onChange={(e) => updateSetting('contact_form_message_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_message_placeholder" enabled={!disabledKeys.includes('contact_form_message_placeholder')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Mesaj Placeholder</label>
                                        <input type="text" value={settings.contact_form_message_placeholder} onChange={(e) => updateSetting('contact_form_message_placeholder', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>
                                </div>
                            </div>

                            {/* Buttons & Messages */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-400">notifications</span>
                                    Butonlar ve Mesajlar
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingFieldWrapper settingKey="contact_form_submit_btn" enabled={!disabledKeys.includes('contact_form_submit_btn')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Gönder Butonu</label>
                                        <input type="text" value={settings.contact_form_submit_btn} onChange={(e) => updateSetting('contact_form_submit_btn', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_submitting" enabled={!disabledKeys.includes('contact_form_submitting')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Gönderiliyor Mesajı</label>
                                        <input type="text" value={settings.contact_form_submitting} onChange={(e) => updateSetting('contact_form_submitting', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_success_title" enabled={!disabledKeys.includes('contact_form_success_title')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Başarı Başlığı</label>
                                        <input type="text" value={settings.contact_form_success_title} onChange={(e) => updateSetting('contact_form_success_title', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="contact_form_success_message" enabled={!disabledKeys.includes('contact_form_success_message')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Başarı Mesajı</label>
                                        <input type="text" value={settings.contact_form_success_message} onChange={(e) => updateSetting('contact_form_success_message', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Form Settings Tab */}
                    {activeTab === 'orderForm' && (
                        <div className="space-y-6 max-w-4xl">
                            {/* Page Titles */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">title</span>
                                    Sayfa Başlıkları
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingFieldWrapper settingKey="order_form_title" enabled={!disabledKeys.includes('order_form_title')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Sayfa Başlığı</label>
                                        <input type="text" value={settings.order_form_title} onChange={(e) => updateSetting('order_form_title', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_subtitle" enabled={!disabledKeys.includes('order_form_subtitle')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Alt Başlık</label>
                                        <input type="text" value={settings.order_form_subtitle} onChange={(e) => updateSetting('order_form_subtitle', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>
                                </div>
                            </div>

                            {/* Dynamic Fields */}
                            <DynamicFieldBuilder
                                title="Sipariş Formu Alanları"
                                initialFields={settings.order_form_fields || "[]"}
                                onChange={(newFields) => updateSetting('order_form_fields', JSON.stringify(newFields))}
                            />

                            {/* Product & Unit Definitions (Lists) */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-400">list</span>
                                    Ürün ve Birim Listeleri
                                </h3>
                                <div>
                                    <SettingFieldWrapper settingKey="order_form_products" enabled={!disabledKeys.includes('order_form_products')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ürünler (virgülle ayırın)</label>
                                        <input
                                            type="text"
                                            value={(() => { try { return JSON.parse(settings.order_form_products).join(', '); } catch { return settings.order_form_products; } })()}
                                            onChange={(e) => updateSetting('order_form_products', JSON.stringify(e.target.value.split(',').map(s => s.trim()).filter(Boolean)))}
                                            placeholder="Oksijen, Argon, Azot"
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </SettingFieldWrapper>
                                    <p className="text-xs text-gray-500 mt-1">Örn: Oksijen, Karışım, Argon, ...</p>
                                </div>
                                <div className="mt-4">
                                    <SettingFieldWrapper settingKey="order_form_units" enabled={!disabledKeys.includes('order_form_units')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Birimler (virgülle ayırın)</label>
                                        <input
                                            type="text"
                                            value={(() => { try { return JSON.parse(settings.order_form_units).join(', '); } catch { return settings.order_form_units; } })()}
                                            onChange={(e) => updateSetting('order_form_units', JSON.stringify(e.target.value.split(',').map(s => s.trim()).filter(Boolean)))}
                                            placeholder="Adet, m³, kg, Litre"
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </SettingFieldWrapper>
                                </div>
                            </div>

                            {/* Form Field Labels */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-400">input</span>
                                    Form Alan Etiketleri
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingFieldWrapper settingKey="order_form_name_label" enabled={!disabledKeys.includes('order_form_name_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ad Soyad</label>
                                        <input type="text" value={settings.order_form_name_label} onChange={(e) => updateSetting('order_form_name_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_company_label" enabled={!disabledKeys.includes('order_form_company_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Firma</label>
                                        <input type="text" value={settings.order_form_company_label} onChange={(e) => updateSetting('order_form_company_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_email_label" enabled={!disabledKeys.includes('order_form_email_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">E-posta</label>
                                        <input type="text" value={settings.order_form_email_label} onChange={(e) => updateSetting('order_form_email_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_phone_label" enabled={!disabledKeys.includes('order_form_phone_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Telefon</label>
                                        <input type="text" value={settings.order_form_phone_label} onChange={(e) => updateSetting('order_form_phone_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_address_label" enabled={!disabledKeys.includes('order_form_address_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Teslimat Adresi</label>
                                        <input type="text" value={settings.order_form_address_label} onChange={(e) => updateSetting('order_form_address_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_product_label" enabled={!disabledKeys.includes('order_form_product_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ürün Seçimi</label>
                                        <input type="text" value={settings.order_form_product_label} onChange={(e) => updateSetting('order_form_product_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_select_product" enabled={!disabledKeys.includes('order_form_select_product')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ürün Seçiniz (placeholder)</label>
                                        <input type="text" value={settings.order_form_select_product} onChange={(e) => updateSetting('order_form_select_product', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_amount_label" enabled={!disabledKeys.includes('order_form_amount_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Miktar</label>
                                        <input type="text" value={settings.order_form_amount_label} onChange={(e) => updateSetting('order_form_amount_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_unit_label" enabled={!disabledKeys.includes('order_form_unit_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Birim</label>
                                        <input type="text" value={settings.order_form_unit_label} onChange={(e) => updateSetting('order_form_unit_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_notes_label" enabled={!disabledKeys.includes('order_form_notes_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ek Notlar</label>
                                        <input type="text" value={settings.order_form_notes_label} onChange={(e) => updateSetting('order_form_notes_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <div className="col-span-2">
                                        <SettingFieldWrapper settingKey="order_form_notes_placeholder" enabled={!disabledKeys.includes('order_form_notes_placeholder')} onToggle={handleToggle}>
                                            <label className="block text-xs text-gray-400 mb-1">Ek Notlar Placeholder</label>
                                            <input type="text" value={settings.order_form_notes_placeholder} onChange={(e) => updateSetting('order_form_notes_placeholder', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                        </SettingFieldWrapper>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-400">smart_button</span>
                                    Butonlar
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <SettingFieldWrapper settingKey="order_form_basket_title" enabled={!disabledKeys.includes('order_form_basket_title')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Sepet Başlığı</label>
                                        <input type="text" value={settings.order_form_basket_title} onChange={(e) => updateSetting('order_form_basket_title', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_add_product_btn" enabled={!disabledKeys.includes('order_form_add_product_btn')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Ürün Ekle Butonu</label>
                                        <input type="text" value={settings.order_form_add_product_btn} onChange={(e) => updateSetting('order_form_add_product_btn', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_submit_btn" enabled={!disabledKeys.includes('order_form_submit_btn')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Sipariş Ver Butonu</label>
                                        <input type="text" value={settings.order_form_submit_btn} onChange={(e) => updateSetting('order_form_submit_btn', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_empty_basket" enabled={!disabledKeys.includes('order_form_empty_basket')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Boş Sepet Mesajı</label>
                                        <input type="text" value={settings.order_form_empty_basket} onChange={(e) => updateSetting('order_form_empty_basket', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_submitting" enabled={!disabledKeys.includes('order_form_submitting')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Gönderiliyor Mesajı</label>
                                        <input type="text" value={settings.order_form_submitting} onChange={(e) => updateSetting('order_form_submitting', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>
                                </div>
                            </div>

                            {/* Success & Error Messages */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-400">notifications</span>
                                    Başarı ve Hata Mesajları
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingFieldWrapper settingKey="order_form_success_title" enabled={!disabledKeys.includes('order_form_success_title')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Başarı Başlığı</label>
                                        <input type="text" value={settings.order_form_success_title} onChange={(e) => updateSetting('order_form_success_title', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_success_message" enabled={!disabledKeys.includes('order_form_success_message')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Başarı Mesajı</label>
                                        <input type="text" value={settings.order_form_success_message} onChange={(e) => updateSetting('order_form_success_message', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_error_message" enabled={!disabledKeys.includes('order_form_error_message')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Hata Mesajı</label>
                                        <input type="text" value={settings.order_form_error_message} onChange={(e) => updateSetting('order_form_error_message', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_max_items_error" enabled={!disabledKeys.includes('order_form_max_items_error')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Max Ürün Hatası</label>
                                        <input type="text" value={settings.order_form_max_items_error} onChange={(e) => updateSetting('order_form_max_items_error', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <div className="col-span-2">
                                        <SettingFieldWrapper settingKey="order_form_fill_product_error" enabled={!disabledKeys.includes('order_form_fill_product_error')} onToggle={handleToggle}>
                                            <label className="block text-xs text-gray-400 mb-1">Ürün Seçim Hatası</label>
                                            <input type="text" value={settings.order_form_fill_product_error} onChange={(e) => updateSetting('order_form_fill_product_error', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                        </SettingFieldWrapper>
                                    </div>
                                </div>
                            </div>

                            {/* "Diğer" Product Popup */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-400">edit_note</span>
                                    "Diğer" Ürün Popup Metinleri
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <SettingFieldWrapper settingKey="order_form_other_popup_title" enabled={!disabledKeys.includes('order_form_other_popup_title')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Popup Başlığı</label>
                                        <input type="text" value={settings.order_form_other_popup_title} onChange={(e) => updateSetting('order_form_other_popup_title', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_other_popup_subtitle" enabled={!disabledKeys.includes('order_form_other_popup_subtitle')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Popup Alt Başlık</label>
                                        <input type="text" value={settings.order_form_other_popup_subtitle} onChange={(e) => updateSetting('order_form_other_popup_subtitle', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_other_popup_label" enabled={!disabledKeys.includes('order_form_other_popup_label')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Popup Etiket</label>
                                        <input type="text" value={settings.order_form_other_popup_label} onChange={(e) => updateSetting('order_form_other_popup_label', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <SettingFieldWrapper settingKey="order_form_other_popup_placeholder" enabled={!disabledKeys.includes('order_form_other_popup_placeholder')} onToggle={handleToggle}>
                                        <label className="block text-xs text-gray-400 mb-1">Popup Placeholder</label>
                                        <input type="text" value={settings.order_form_other_popup_placeholder} onChange={(e) => updateSetting('order_form_other_popup_placeholder', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                    </SettingFieldWrapper>

                                    <div className="col-span-2">
                                        <SettingFieldWrapper settingKey="order_form_other_note_required" enabled={!disabledKeys.includes('order_form_other_note_required')} onToggle={handleToggle}>
                                            <label className="block text-xs text-gray-400 mb-1">"Diğer" Not Gerekli Hatası</label>
                                            <input type="text" value={settings.order_form_other_note_required} onChange={(e) => updateSetting('order_form_other_note_required', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                        </SettingFieldWrapper>
                                    </div>
                                    <div className="col-span-2">
                                        <SettingFieldWrapper settingKey="order_form_other_not_added" enabled={!disabledKeys.includes('order_form_other_not_added')} onToggle={handleToggle}>
                                            <label className="block text-xs text-gray-400 mb-1">"Diğer" Eklenmedi Hatası</label>
                                            <input type="text" value={settings.order_form_other_not_added} onChange={(e) => updateSetting('order_form_other_not_added', e.target.value)} className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]" />
                                        </SettingFieldWrapper>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO Settings */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
                                <SettingFieldWrapper
                                    settingKey="seo_title"
                                    label="Meta Title"
                                    enabled={!disabledKeys.includes('seo_title')}
                                    onToggle={handleToggle}
                                >
                                    <input
                                        type="text"
                                        value={settings.seo_title}
                                        onChange={(e) => updateSetting('seo_title', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                                <p className="text-xs text-gray-500 mt-1">
                                    {settings.seo_title.length}/60 karakter (önerilen)
                                </p>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="seo_description"
                                    label="Meta Description"
                                    enabled={!disabledKeys.includes('seo_description')}
                                    onToggle={handleToggle}
                                >
                                    <textarea
                                        value={settings.seo_description}
                                        onChange={(e) => updateSetting('seo_description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                                <p className="text-xs text-gray-500 mt-1">
                                    {settings.seo_description.length}/160 karakter (önerilen)
                                </p>
                            </div>
                            <div>
                                <SettingFieldWrapper
                                    settingKey="seo_keywords"
                                    label="Keywords"
                                    enabled={!disabledKeys.includes('seo_keywords')}
                                    onToggle={handleToggle}
                                >
                                    <textarea
                                        value={settings.seo_keywords}
                                        onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                                        rows={2}
                                        placeholder="keyword1, keyword2, keyword3"
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                </SettingFieldWrapper>
                                <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak yazın</p>
                            </div>
                        </div>
                    )}

                    {/* Legal Settings */}
                    {activeTab === 'legal' && (
                        <div className="space-y-6 max-w-4xl">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-400">gavel</span>
                                    Yasal Sayfalar ve Çerez Yönetimi
                                </h3>
                                <p className="text-sm text-gray-400 mb-6">KVKK ve gizlilik uyumu için gerekli sayfa ve bileşenlerin görünürlüğünü buradan yönetebilirsiniz.</p>

                                {/* Cookie Banner Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#1c2127] rounded-lg mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-yellow-500">cookie</span>
                                        <div>
                                            <p className="text-white font-medium">Çerez İzin Bildirimi</p>
                                            <p className="text-xs text-gray-500">Ziyaretçilere çerez onayı banner&apos;ı göster</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('legal_cookie_banner_enabled', settings.legal_cookie_banner_enabled === 'true' ? 'false' : 'true')}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.legal_cookie_banner_enabled === 'true' ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.legal_cookie_banner_enabled === 'true' ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {/* Cookie Policy Page Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#1c2127] rounded-lg mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-400">description</span>
                                        <div>
                                            <p className="text-white font-medium">Çerez Politikası Sayfası</p>
                                            <p className="text-xs text-gray-500">/cerez-politikasi sayfasını aktif et</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('legal_cookie_policy_page_enabled', settings.legal_cookie_policy_page_enabled === 'true' ? 'false' : 'true')}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.legal_cookie_policy_page_enabled === 'true' ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.legal_cookie_policy_page_enabled === 'true' ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {/* Privacy Policy Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#1c2127] rounded-lg mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-green-400">shield</span>
                                        <div>
                                            <p className="text-white font-medium">Gizlilik Politikası Sayfası</p>
                                            <p className="text-xs text-gray-500">/gizlilik-politikasi sayfasını aktif et</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('legal_privacy_page_enabled', settings.legal_privacy_page_enabled === 'true' ? 'false' : 'true')}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.legal_privacy_page_enabled === 'true' ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.legal_privacy_page_enabled === 'true' ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {/* KVKK Page Toggle */}
                                <div className="flex items-center justify-between p-4 bg-[#1c2127] rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-red-400">policy</span>
                                        <div>
                                            <p className="text-white font-medium">KVKK Aydınlatma Metni Sayfası</p>
                                            <p className="text-xs text-gray-500">/kvkk sayfasını aktif et</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSetting('legal_kvkk_page_enabled', settings.legal_kvkk_page_enabled === 'true' ? 'false' : 'true')}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${settings.legal_kvkk_page_enabled === 'true' ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.legal_kvkk_page_enabled === 'true' ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-400 mt-0.5">info</span>
                                    <div>
                                        <p className="text-blue-400 font-medium text-sm">KVKK Uyumu Hakkında</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            6698 sayılı Kişisel Verilerin Korunması Kanunu gereği, kişisel veri toplayan web sitelerinin kullanıcıları bilgilendirmesi gerekmektedir.
                                            Çerez banner&apos;ı ve yasal sayfalar bu yükümlülüğü yerine getirmenize yardımcı olur.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
