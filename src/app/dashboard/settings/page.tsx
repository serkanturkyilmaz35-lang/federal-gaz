"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// Default settings structure
const defaultSettings = {
    // General
    site_name: "Federal Gaz",
    site_slogan: "Endüstriyel Gaz Çözümleri",
    logo_url: "/logo.jpg",
    favicon_url: "/icon.png",

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

    // Form Titles
    contact_form_title: "İletişim",
    contact_form_subtitle: "Bizimle iletişime geçin, size yardımcı olmaktan mutluluk duyarız.",
    order_form_title: "Sipariş Ver",
    order_form_subtitle: "Hızlı ve güvenli sipariş için formu doldurun.",

    // Map
    contact_map_query: "Ivedik OSB, 1550. Cad. No:1, Yenimahalle, Ankara",
};

type SettingsKey = keyof typeof defaultSettings;

export default function SettingsPage() {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'content' | 'social' | 'seo'>('general');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/dashboard/settings');
            const data = await res.json();
            if (data.settings) {
                setSettings(prev => {
                    const newSettings = { ...prev, ...data.settings };
                    // If values are empty, use defaults to show what's actually being used on the site
                    if (!newSettings.logo_url) newSettings.logo_url = defaultSettings.logo_url;
                    if (!newSettings.favicon_url) newSettings.favicon_url = defaultSettings.favicon_url;
                    // Phone labels
                    if (!newSettings.contact_phone_1_label) newSettings.contact_phone_1_label = defaultSettings.contact_phone_1_label;
                    if (!newSettings.contact_phone_2_label) newSettings.contact_phone_2_label = defaultSettings.contact_phone_2_label;
                    if (!newSettings.contact_phone_3_label) newSettings.contact_phone_3_label = defaultSettings.contact_phone_3_label;
                    // Content defaults
                    if (!newSettings.homepage_marquee_text) newSettings.homepage_marquee_text = defaultSettings.homepage_marquee_text;
                    if (!newSettings.contact_form_title) newSettings.contact_form_title = defaultSettings.contact_form_title;
                    if (!newSettings.contact_form_subtitle) newSettings.contact_form_subtitle = defaultSettings.contact_form_subtitle;
                    if (!newSettings.order_form_title) newSettings.order_form_title = defaultSettings.order_form_title;
                    if (!newSettings.order_form_subtitle) newSettings.order_form_subtitle = defaultSettings.order_form_subtitle;
                    if (!newSettings.contact_map_query) newSettings.contact_map_query = defaultSettings.contact_map_query;
                    return newSettings;
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce ref for auto-save
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-save function
    const autoSave = useCallback(async (newSettings: typeof defaultSettings) => {
        setSaving(true);
        setSaveStatus('idle');

        try {
            const settingsArray = Object.entries(newSettings).map(([key, value]) => {
                let category: 'general' | 'contact' | 'social' | 'seo' = 'general';
                if (key.startsWith('contact_')) category = 'contact';
                else if (key.startsWith('seo_')) category = 'seo';
                else if (key === 'instagram_url' || key === 'facebook_url' || key === 'twitter_url' || key === 'linkedin_url' || key === 'youtube_url') category = 'social';
                else category = 'general';
                return { key, value: String(value ?? ""), category };
            });

            const res = await fetch('/api/dashboard/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: settingsArray }),
            });

            if (res.ok) {
                setSaveStatus('success');
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
    }, [router]);

    const updateSetting = (key: SettingsKey, value: string) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        if (saveStatus !== 'idle') setSaveStatus('idle');

        // Debounced auto-save (waits 800ms after last change)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            autoSave(newSettings);
        }, 800);
    };

    const tabs = [
        { id: 'general', label: 'Genel', icon: 'settings' },
        { id: 'contact', label: 'İletişim', icon: 'phone' },
        { id: 'content', label: 'İçerik', icon: 'edit_note' },
        { id: 'social', label: 'Sosyal Medya', icon: 'public' },
        { id: 'seo', label: 'SEO', icon: 'search' },
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

                {/* Empty div for spacing balance */}
                <div className="hidden lg:block w-24"></div>
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
                                <label className="block text-sm font-medium text-gray-300 mb-2">Site Adı</label>
                                <input
                                    type="text"
                                    value={settings.site_name}
                                    onChange={(e) => updateSetting('site_name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Slogan</label>
                                <input
                                    type="text"
                                    value={settings.site_slogan}
                                    onChange={(e) => updateSetting('site_slogan', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
                                    <input
                                        type="text"
                                        value={settings.logo_url}
                                        onChange={(e) => updateSetting('logo_url', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        Önerilen: 512x512px, PNG veya WebP formatı. Medya kütüphanesinden URL kopyalayabilirsiniz.
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
                                    <input
                                        type="text"
                                        value={settings.favicon_url}
                                        onChange={(e) => updateSetting('favicon_url', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        Önerilen: 32x32px veya 16x16px, .ico veya .png formatı.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Settings */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Adres</label>
                                <textarea
                                    value={settings.contact_address}
                                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1.5">Footer ve İletişim sayfasında görünür.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Telefon 1 Etiket (Örn: Merkez)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_1_label || ''}
                                        onChange={(e) => updateSetting('contact_phone_1_label', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white mb-3"
                                        placeholder="Etiket (Opsiyonel)"
                                    />
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 1</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone}
                                        onChange={(e) => updateSetting('contact_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                    />
                                </div>
                                <div className="self-center hidden md:block">
                                    <p className="text-xs text-gray-500">Footer ve İletişim sayfasında görünür.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Telefon 2 Etiket (Örn: Satış)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_2_label || ''}
                                        onChange={(e) => updateSetting('contact_phone_2_label', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white mb-3"
                                        placeholder="Etiket (Opsiyonel)"
                                    />
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 2 (GSM)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_2}
                                        onChange={(e) => updateSetting('contact_phone_2', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                    />
                                </div>
                                <div className="self-center hidden md:block">
                                    <p className="text-xs text-gray-500">Footer ve İletişim sayfasında görünür.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Telefon 3 Etiket (Örn: Muhasebe)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_3_label || ''}
                                        onChange={(e) => updateSetting('contact_phone_3_label', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#1c2127] border border-[#3b4754] rounded-lg text-sm text-white mb-3"
                                        placeholder="Etiket (Opsiyonel)"
                                    />
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 3 (GSM)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_3}
                                        onChange={(e) => updateSetting('contact_phone_3', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                    />
                                </div>
                                <div className="self-center hidden md:block">
                                    <p className="text-xs text-gray-500">Footer ve İletişim sayfasında görünür.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                                <input
                                    type="email"
                                    value={settings.contact_email}
                                    onChange={(e) => updateSetting('contact_email', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1.5">Footer ve İletişim sayfasında görünür.</p>
                            </div>
                        </div>
                    )}

                    {/* Social Media Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
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
                            </div>
                            <div>
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
                            </div>
                            <div>
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
                            </div>
                            <div>
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
                            </div>
                            <div>
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
                            </div>
                        </div>
                    )}

                    {/* Content Settings */}
                    {activeTab === 'content' && (
                        <div className="space-y-6 max-w-4xl">
                            {/* Marquee / Kayan Yazı */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
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
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Ana sayfanın en üstünde kayan sarı bant üzerinde görünür.
                                </p>
                            </div>

                            {/* Contact Form Settings */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-400">contact_mail</span>
                                    İletişim Formu
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Sayfa Başlığı</label>
                                        <input
                                            type="text"
                                            value={settings.contact_form_title}
                                            onChange={(e) => updateSetting('contact_form_title', e.target.value)}
                                            placeholder="İletişim"
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Alt Başlık</label>
                                        <input
                                            type="text"
                                            value={settings.contact_form_subtitle}
                                            onChange={(e) => updateSetting('contact_form_subtitle', e.target.value)}
                                            placeholder="Bizimle iletişime geçin..."
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Order Form Settings */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-400">shopping_cart</span>
                                    Sipariş Formu
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Sayfa Başlığı</label>
                                        <input
                                            type="text"
                                            value={settings.order_form_title}
                                            onChange={(e) => updateSetting('order_form_title', e.target.value)}
                                            placeholder="Sipariş Ver"
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Alt Başlık</label>
                                        <input
                                            type="text"
                                            value={settings.order_form_subtitle}
                                            onChange={(e) => updateSetting('order_form_subtitle', e.target.value)}
                                            placeholder="Hızlı ve güvenli sipariş için..."
                                            className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Map Location Settings */}
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-400">location_on</span>
                                    Harita Konumu
                                </h3>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Google Maps Konum Sorgusu</label>
                                    <input
                                        type="text"
                                        value={settings.contact_map_query}
                                        onChange={(e) => updateSetting('contact_map_query', e.target.value)}
                                        placeholder="Ivedik OSB, 1550. Cad. No:1, Yenimahalle, Ankara"
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:border-[#137fec]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">info</span>
                                        İletişim sayfasındaki harita ve "Yol Tarifi Al" butonu bu adresi kullanır.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO Settings */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6 max-w-4xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
                                <input
                                    type="text"
                                    value={settings.seo_title}
                                    onChange={(e) => updateSetting('seo_title', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {settings.seo_title.length}/60 karakter (önerilen)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
                                <textarea
                                    value={settings.seo_description}
                                    onChange={(e) => updateSetting('seo_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {settings.seo_description.length}/160 karakter (önerilen)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                                <textarea
                                    value={settings.seo_keywords}
                                    onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                                    rows={2}
                                    placeholder="keyword1, keyword2, keyword3"
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Virgülle ayırarak yazın</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
