"use client";

import { useState, useEffect } from "react";

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
    contact_phone_2: "(+90) 543 455 45 63",
    contact_phone_3: "(+90) 532 422 45 15",
    contact_email: "federal.gaz@hotmail.com",
    contact_whatsapp: "+905434554563",

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
};

type SettingsKey = keyof typeof defaultSettings;

export default function SettingsPage() {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'seo'>('general');
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/dashboard/settings');
            const data = await res.json();
            if (data.settings) {
                setSettings({ ...defaultSettings, ...data.settings });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccessMessage("");

        try {
            const settingsArray = Object.entries(settings).map(([key, value]) => {
                let category: 'general' | 'contact' | 'social' | 'seo' = 'general';
                if (key.startsWith('contact_')) category = 'contact';
                else if (key.includes('_url') && !key.startsWith('seo_')) category = 'social';
                else if (key.startsWith('seo_')) category = 'seo';

                return { key, value, category };
            });

            const res = await fetch('/api/dashboard/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: settingsArray }),
            });

            if (res.ok) {
                setSuccessMessage("Ayarlar başarıyla kaydedildi!");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateSetting = (key: SettingsKey, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const tabs = [
        { id: 'general', label: 'Genel', icon: 'settings' },
        { id: 'contact', label: 'İletişim', icon: 'phone' },
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
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#137fec] text-white hover:bg-[#137fec]/90 disabled:opacity-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">
                        {saving ? "hourglass_empty" : "save"}
                    </span>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {successMessage}
                </div>
            )}

            {/* Main Card */}
            <div className="bg-[#111418] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-[#3b4754]">
                    <nav className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === tab.id
                                        ? 'text-[#137fec] border-b-2 border-[#137fec] bg-[#137fec]/5'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Site Adı</label>
                                <input
                                    type="text"
                                    value={settings.site_name}
                                    onChange={(e) => updateSetting('site_name', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Slogan</label>
                                <input
                                    type="text"
                                    value={settings.site_slogan}
                                    onChange={(e) => updateSetting('site_slogan', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
                                    <input
                                        type="text"
                                        value={settings.logo_url}
                                        onChange={(e) => updateSetting('logo_url', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Favicon URL</label>
                                    <input
                                        type="text"
                                        value={settings.favicon_url}
                                        onChange={(e) => updateSetting('favicon_url', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Settings */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Adres</label>
                                <textarea
                                    value={settings.contact_address}
                                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 1</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone}
                                        onChange={(e) => updateSetting('contact_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 2 (GSM)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_2}
                                        onChange={(e) => updateSetting('contact_phone_2', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Telefon 3 (GSM)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_3}
                                        onChange={(e) => updateSetting('contact_phone_3', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        value={settings.contact_email}
                                        onChange={(e) => updateSetting('contact_email', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Numarası</label>
                                    <input
                                        type="text"
                                        value={settings.contact_whatsapp}
                                        onChange={(e) => updateSetting('contact_whatsapp', e.target.value)}
                                        placeholder="+905xxxxxxxxx"
                                        className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Media Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-pink-500">photo_camera</span> Instagram
                                </label>
                                <input
                                    type="url"
                                    value={settings.instagram_url}
                                    onChange={(e) => updateSetting('instagram_url', e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                />
                            </div>
                        </div>
                    )}

                    {/* SEO Settings */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
                                <input
                                    type="text"
                                    value={settings.seo_title}
                                    onChange={(e) => updateSetting('seo_title', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
                                    className="w-full px-4 py-2.5 bg-[#1c2127] border border-[#3b4754] rounded-lg text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
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
