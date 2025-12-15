'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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

            {/* Main Banner */}
            <div className={`fixed ${showDetails ? 'inset-0 flex items-center justify-center z-[9999] p-4' : 'bottom-0 left-0 right-0 z-[9999]'}`}>
                <div className={`bg-white dark:bg-gray-900 shadow-2xl ${showDetails ? 'rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto' : 'border-t border-gray-200 dark:border-gray-700'}`}>
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <span className="material-symbols-outlined text-primary">cookie</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.title}</h3>
                            {showDetails && (
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="ml-auto text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {t.description}{' '}
                            <Link href="/cerez-politikasi" className="text-primary hover:underline">
                                {t.learnMore}
                            </Link>
                        </p>

                        {/* Cookie Categories (only in details view) */}
                        {showDetails && (
                            <div className="space-y-4 mb-6">
                                {/* Necessary - Always on */}
                                <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{t.necessary}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.necessaryDesc}</p>
                                    </div>
                                    <div className="relative">
                                        <input type="checkbox" checked disabled className="sr-only" />
                                        <div className="w-11 h-6 bg-primary rounded-full cursor-not-allowed opacity-50">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics */}
                                <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{t.analytics}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.analyticsDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.analytics ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {/* Marketing */}
                                <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{t.marketing}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.marketingDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.marketing ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>

                                {/* Functional */}
                                <div className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{t.functional}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.functionalDesc}</p>
                                    </div>
                                    <button
                                        onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${preferences.functional ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${preferences.functional ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className={`flex gap-3 ${showDetails ? 'flex-col' : 'flex-wrap justify-center sm:justify-end'}`}>
                            {showDetails ? (
                                <button
                                    onClick={handleSavePreferences}
                                    className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {t.save}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleRejectAll}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {t.rejectAll}
                                    </button>
                                    <button
                                        onClick={() => setShowDetails(true)}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {t.customize}
                                    </button>
                                    <button
                                        onClick={handleAcceptAll}
                                        className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        {t.acceptAll}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
