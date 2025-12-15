'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

declare global {
    interface Window {
        grecaptcha: {
            ready: (callback: () => void) => void;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
        };
    }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

export function useRecaptcha() {
    const { language } = useLanguage();
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if already loaded
        if (window.grecaptcha) {
            setIsLoaded(true);
            return;
        }

        // If no site key configured, skip loading
        if (!RECAPTCHA_SITE_KEY) {
            console.warn('reCAPTCHA site key not configured');
            setIsLoaded(true); // Mark as loaded to not block forms
            return;
        }

        // Load reCAPTCHA script dynamically
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}&hl=${language.toLowerCase()}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            window.grecaptcha.ready(() => {
                setIsLoaded(true);
            });
        };

        script.onerror = () => {
            setError('reCAPTCHA yüklenemedi');
            setIsLoaded(true); // Still mark as loaded to not block forms
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, [language]);

    const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
        // If no site key, return null (allow form submission)
        if (!RECAPTCHA_SITE_KEY) {
            return null;
        }

        if (!window.grecaptcha) {
            console.warn('reCAPTCHA not loaded');
            return null;
        }

        try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
            return token;
        } catch (err) {
            console.error('reCAPTCHA execution failed:', err);
            return null;
        }
    }, []);

    return {
        isLoaded,
        error,
        executeRecaptcha,
        isConfigured: !!RECAPTCHA_SITE_KEY
    };
}
