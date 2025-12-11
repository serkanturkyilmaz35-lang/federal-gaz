"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of our settings
export interface SiteSettingsData {
    // General
    site_name: string;
    site_slogan: string;
    logo_url: string;
    favicon_url: string;

    // Contact
    contact_address: string;
    contact_phone: string;
    contact_phone_1_label?: string; // Label for phone 1
    contact_phone_2: string;
    contact_phone_2_label?: string; // Label for phone 2
    contact_phone_3: string;
    contact_phone_3_label?: string; // Label for phone 3
    contact_email: string;

    // Social
    instagram_url: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    youtube_url: string;
}

// Default fallback settings (safe to use if API fails)
const defaultSettings: SiteSettingsData = {
    site_name: "Federal Gaz",
    site_slogan: "Endüstriyel Gaz Çözümleri",
    logo_url: "/logo.jpg",
    favicon_url: "/icon.png",
    contact_address: "İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara",
    contact_phone: "(0312) 395 35 95",
    contact_phone_2: "(+90) 543 455 45 63",
    contact_phone_3: "(+90) 532 422 45 15",
    contact_email: "federal.gaz@hotmail.com",
    instagram_url: "https://www.instagram.com/federal_gaz/",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",
};

interface SettingsContextType {
    settings: SiteSettingsData;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({
    children,
    initialSettings
}: {
    children: React.ReactNode;
    initialSettings?: Partial<SiteSettingsData>;
}) => {
    // Merge initial settings from server with defaults
    const [settings, setSettings] = useState<SiteSettingsData>({
        ...defaultSettings,
        ...initialSettings,
    });

    const [isLoading, setIsLoading] = useState(false);

    // Optional: We could re-fetch on mount if needed, but server-passing is better for SEO/Performance
    // For now, we trust the server-passed initialSettings.

    return (
        <SettingsContext.Provider value={{ settings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};
