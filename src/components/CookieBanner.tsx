'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import Link from 'next/link';

// Generate UUID for visitor identification
const generateVisitorId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// Get or create visitor ID from cookie
const getVisitorId = (): string => {
    if (typeof document === 'undefined') return '';

    const cookies = document.cookie.split(';');
    const visitorCookie = cookies.find(c => c.trim().startsWith('fg_visitor_id='));

    if (visitorCookie) {
        return visitorCookie.split('=')[1];
    }

    const newId = generateVisitorId();
    document.cookie = `fg_visitor_id=${newId}; path=/; max-age=31536000; SameSite=Lax`;
    return newId;
};

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
}

const translations = {
    TR: {
        title: 'Çerez Tercihleriniz',
        description: 'Web sitemiz, deneyiminizi geliştirmek ve site trafiğini analiz etmek için çerezler kullanmaktadır.',
        acceptAll: 'Tümünü Kabul Et',
        rejectAll: 'Tümünü Reddet',
        customize: 'Tercihleri Yönet',
        save: 'Tercihleri Kaydet',
        necessary: 'Zorunlu Çerezler',
        necessaryDesc: 'Sitenin çalışması için gereklidir. Kapatılamaz.',
        analytics: 'Analitik Çerezler',
        analyticsDesc: 'Site kullanımını anlamamıza yardımcı olur.',
        marketing: 'Pazarlama Çerezleri',
        marketingDesc: 'Kişiselleştirilmiş reklamlar için kullanılır.',
        functional: 'Fonksiyonel Çerezler',
        functionalDesc: 'Gelişmiş özellikler ve tercihleri hatırlar.',
        learnMore: 'Çerez Politikası',
        close: 'Kapat'
    },
    EN: {
        title: 'Cookie Preferences',
        description: 'Our website uses cookies to enhance your experience and analyze site traffic.',
        acceptAll: 'Accept All',
        rejectAll: 'Reject All',
        customize: 'Manage Preferences',
        save: 'Save Preferences',
        necessary: 'Necessary Cookies',
        necessaryDesc: 'Required for the site to function. Cannot be disabled.',
        analytics: 'Analytics Cookies',
        analyticsDesc: 'Helps us understand site usage.',
        marketing: 'Marketing Cookies',
        marketingDesc: 'Used for personalized advertising.',
        functional: 'Functional Cookies',
        functionalDesc: 'Remembers advanced features and preferences.',
        learnMore: 'Cookie Policy',
        close: 'Close'
    }
};

export default function CookieBanner() {
    const { language } = useLanguage();
    const { settings } = useSettings();
    const t = translations[language];

    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        marketing: false,
        functional: false
    });

    useEffect(() => {
        // Check if banner is disabled in settings
        const settingsAny = settings as unknown as Record<string, string>;
        if (settingsAny['legal_cookie_banner_enabled'] === 'false') {
            return;
        }

        // Check if consent already given
        const consentCookie = document.cookie
            .split(';')
            .find(c => c.trim().startsWith('fg_cookie_consent='));

        if (!consentCookie) {
            // Show banner after a short delay
            setTimeout(() => setShowBanner(true), 1000);
        } else {
            // Parse existing preferences
            try {
                const savedPrefs = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
                setPreferences(savedPrefs);
            } catch (e) {
                setShowBanner(true);
            }
        }
    }, []);

    const saveConsent = async (prefs: CookiePreferences) => {
        const visitorId = getVisitorId();

        // Save to cookie
        document.cookie = `fg_cookie_consent=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=31536000; SameSite=Lax`;

        // Save to database
        try {
            await fetch('/api/cookies/consent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId, ...prefs })
            });
        } catch (e) {
            console.error('Failed to save cookie consent:', e);
        }

        setShowBanner(false);
        setShowDetails(false);

        // Reload if analytics preference changed (to apply/remove GA)
        if (prefs.analytics !== preferences.analytics) {
            window.location.reload();
        }
    };

    const handleAcceptAll = () => {
        const allPrefs = { necessary: true, analytics: true, marketing: true, functional: true };
        setPreferences(allPrefs);
        saveConsent(allPrefs);
    };

    const handleRejectAll = () => {
        const minPrefs = { necessary: true, analytics: false, marketing: false, functional: false };
        setPreferences(minPrefs);
        saveConsent(minPrefs);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
    };

    if (!showBanner) return null;

    return (
        <>
            {/* Backdrop for details modal */}
            {showDetails && (
                <div
                    className="fixed inset-0 bg-black/50 z-[9998]"
                    onClick={() => setShowDetails(false)}
                />
            )}

            {/* Details Modal */}
            {showDetails && (
                <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.title}</h3>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Cookie Categories */}
                            <div className="space-y-3 mb-6">
                                {/* Necessary */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{t.necessary}</h4>
                                        <p className="text-xs text-gray-500">{t.necessaryDesc}</p>
                                    </div>
                                    <div className="w-11 h-6 bg-primary rounded-full opacity-50 relative">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                {/* Analytics */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{t.analytics}</h4>
                                        <p className="text-xs text-gray-500">{t.analyticsDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.analytics ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                {/* Marketing */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{t.marketing}</h4>
                                        <p className="text-xs text-gray-500">{t.marketingDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.marketing ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                {/* Functional */}
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{t.functional}</h4>
                                        <p className="text-xs text-gray-500">{t.functionalDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${preferences.functional ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.functional ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleSavePreferences}
                                className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Banner Strip */}
            {!showDetails && (
                <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                    <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3">
                        {/* Mobile: centered text + centered buttons below */}
                        {/* Desktop: flex row with text left, buttons right */}
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            {/* Text */}
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left flex-1">
                                <span className="hidden sm:inline">🍪 {t.description} </span>
                                <span className="sm:hidden">Bu site çerez kullanmaktadır. </span>
                                <Link href="/cerez-politikasi" className="text-primary hover:underline font-medium">
                                    {t.learnMore}
                                </Link>
                            </p>

                            {/* Buttons - centered on mobile */}
                            <div className="flex items-center justify-center gap-1.5 sm:justify-end sm:gap-2 flex-shrink-0">
                                <button
                                    onClick={handleRejectAll}
                                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="hidden sm:inline">{t.rejectAll}</span>
                                    <span className="sm:hidden">Reddet</span>
                                </button>
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="hidden sm:inline">{t.customize}</span>
                                    <span className="sm:hidden">Ayarla</span>
                                </button>
                                <button
                                    onClick={handleAcceptAll}
                                    className="px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm bg-primary text-white font-semibold rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    <span className="hidden sm:inline">{t.acceptAll}</span>
                                    <span className="sm:hidden">Kabul Et</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
