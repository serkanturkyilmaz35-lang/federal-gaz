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
            // Convert settings object to array format
            const settingsArray = Object.entries(settings).map(([key, value]) => {
                let category: 'general' | 'contact' | 'social' | 'seo' = 'general';
                if (key.startsWith('contact_')) category = 'contact';
                else if (key.includes('_url') && !key.startsWith('seo_')) category = 'social';
                else if (key.startsWith('seo_')) category = 'seo';
                else if (['site_name', 'site_slogan', 'logo_url', 'favicon_url'].includes(key)) category = 'general';

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
        { id: 'general', label: 'Genel', icon: '⚙️' },
        { id: 'contact', label: 'İletişim', icon: '📞' },
        { id: 'social', label: 'Sosyal Medya', icon: '🌐' },
        { id: 'seo', label: 'SEO', icon: '🔍' },
    ];

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
                    <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
                    <p className="text-sm text-gray-500 mt-1">Site ayarlarını yönetin</p>
                </div>
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
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Kaydet
                        </>
                    )}
                </button>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100">
                    <nav className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6 space-y-6">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı</label>
                                <input
                                    type="text"
                                    value={settings.site_name}
                                    onChange={(e) => updateSetting('site_name', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                                <input
                                    type="text"
                                    value={settings.site_slogan}
                                    onChange={(e) => updateSetting('site_slogan', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                                    <input
                                        type="text"
                                        value={settings.logo_url}
                                        onChange={(e) => updateSetting('logo_url', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                                    <input
                                        type="text"
                                        value={settings.favicon_url}
                                        onChange={(e) => updateSetting('favicon_url', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Settings */}
                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                                <textarea
                                    value={settings.contact_address}
                                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon 1</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone}
                                        onChange={(e) => updateSetting('contact_phone', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon 2 (GSM)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_2}
                                        onChange={(e) => updateSetting('contact_phone_2', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefon 3 (GSM)</label>
                                    <input
                                        type="text"
                                        value={settings.contact_phone_3}
                                        onChange={(e) => updateSetting('contact_phone_3', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                                    <input
                                        type="email"
                                        value={settings.contact_email}
                                        onChange={(e) => updateSetting('contact_email', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Numarası</label>
                                    <input
                                        type="text"
                                        value={settings.contact_whatsapp}
                                        onChange={(e) => updateSetting('contact_whatsapp', e.target.value)}
                                        placeholder="+905xxxxxxxxx"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Media Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="mr-2">📸</span> Instagram
                                </label>
                                <input
                                    type="url"
                                    value={settings.instagram_url}
                                    onChange={(e) => updateSetting('instagram_url', e.target.value)}
                                    placeholder="https://instagram.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="mr-2">📘</span> Facebook
                                </label>
                                <input
                                    type="url"
                                    value={settings.facebook_url}
                                    onChange={(e) => updateSetting('facebook_url', e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="mr-2">🐦</span> Twitter / X
                                </label>
                                <input
                                    type="url"
                                    value={settings.twitter_url}
                                    onChange={(e) => updateSetting('twitter_url', e.target.value)}
                                    placeholder="https://twitter.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="mr-2">💼</span> LinkedIn
                                </label>
                                <input
                                    type="url"
                                    value={settings.linkedin_url}
                                    onChange={(e) => updateSetting('linkedin_url', e.target.value)}
                                    placeholder="https://linkedin.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="mr-2">🎬</span> YouTube
                                </label>
                                <input
                                    type="url"
                                    value={settings.youtube_url}
                                    onChange={(e) => updateSetting('youtube_url', e.target.value)}
                                    placeholder="https://youtube.com/..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                    )}

                    {/* SEO Settings */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                                <input
                                    type="text"
                                    value={settings.seo_title}
                                    onChange={(e) => updateSetting('seo_title', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {settings.seo_title.length}/60 karakter (önerilen)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                                <textarea
                                    value={settings.seo_description}
                                    onChange={(e) => updateSetting('seo_description', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    {settings.seo_description.length}/160 karakter (önerilen)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                                <textarea
                                    value={settings.seo_keywords}
                                    onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                                    rows={2}
                                    placeholder="keyword1, keyword2, keyword3"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Virgülle ayırarak yazın
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
