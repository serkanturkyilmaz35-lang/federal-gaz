"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of our settings
export interface SiteSettingsData {
    // General
    site_name: string;
    site_slogan: string;
    logo_url: string;
    favicon_url: string;

    // Contact Info
    contact_address: string;
    contact_phone: string;
    contact_phone_1_label?: string;
    contact_phone_2: string;
    contact_phone_2_label?: string;
    contact_phone_3: string;
    contact_phone_3_label?: string;
    contact_email: string;

    // Contact Icons
    contact_icon_address?: string;
    contact_icon_phone?: string;
    contact_icon_gsm?: string;
    contact_icon_email?: string;
    contact_icon_directions?: string;

    // Social
    instagram_url: string;
    facebook_url: string;
    twitter_url: string;
    linkedin_url: string;
    youtube_url: string;

    // Auth & Profile Icons
    auth_icon_forgot_password?: string;
    auth_icon_login?: string;
    auth_icon_register?: string;
    auth_icon_profile?: string;

    // Homepage
    homepage_marquee_text?: string;

    // Map Coordinates
    contact_map_lat?: string;
    contact_map_lng?: string;

    // ===== CONTACT FORM SETTINGS =====
    contact_form_title?: string;
    contact_form_subtitle?: string;
    contact_form_name_label?: string;
    contact_form_name_placeholder?: string;
    contact_form_email_label?: string;
    contact_form_email_placeholder?: string;
    contact_form_phone_label?: string;
    contact_form_phone_placeholder?: string;
    contact_form_message_label?: string;
    contact_form_message_placeholder?: string;
    contact_form_submit_btn?: string;
    contact_form_submitting?: string;
    contact_form_success_title?: string;
    contact_form_success_message?: string;
    contact_form_fields?: string; // JSON array of FormField

    // ===== ORDER FORM SETTINGS =====
    order_form_title?: string;
    order_form_fields?: string; // JSON array of FormField
    order_form_subtitle?: string;
    order_form_name_label?: string;
    order_form_company_label?: string;
    order_form_email_label?: string;
    order_form_phone_label?: string;
    order_form_address_label?: string;
    order_form_product_label?: string;
    order_form_select_product?: string;
    order_form_products?: string; // JSON array string: ["Oksijen", "Argon", ...]
    order_form_amount_label?: string;
    order_form_unit_label?: string;
    order_form_units?: string; // JSON array string: ["Adet", "m³", ...]
    order_form_notes_label?: string;
    order_form_notes_placeholder?: string;
    order_form_submit_btn?: string;
    order_form_add_product_btn?: string;
    order_form_basket_title?: string;
    order_form_empty_basket?: string;
    order_form_submitting?: string;
    order_form_success_title?: string;
    order_form_success_message?: string;
    order_form_error_message?: string;
    order_form_max_items_error?: string;
    order_form_fill_product_error?: string;
    order_form_other_note_required?: string;
    order_form_other_not_added?: string;
    order_form_other_popup_title?: string;
    order_form_other_popup_subtitle?: string;

    order_form_other_popup_label?: string;
    order_form_other_popup_placeholder?: string;
    order_form_icon_add?: string;
    order_form_icon_delete?: string;
    order_form_icon_note?: string;

    // Global Visibility Control
    system_disabled_keys?: string; // JSON Array of keys that are disabled (passive)
    // Footer Text
    footer_copyright?: string;
}

// Default fallback settings (safe to use if API fails)
const defaultSettings: SiteSettingsData = {
    site_name: "Federal Gaz",
    site_slogan: "Endüstriyel Gaz Çözümleri",
    logo_url: "/logo.jpg",
    favicon_url: "/icon.png",
    footer_copyright: "© 2025 Federal Gaz. Tüm hakları saklıdır.",
    contact_address: "İvedik OSB, 1550. Cad. No:1, 06378 Yenimahalle/Ankara",
    contact_phone: "(0312) 395 35 95",
    contact_phone_2: "(+90) 543 455 45 63",
    contact_phone_3: "(+90) 532 422 45 15",
    contact_email: "federal.gaz@hotmail.com",
    contact_icon_address: "location_on|#b13329",
    contact_icon_phone: "phone|#137fec",
    contact_icon_gsm: "smartphone|#137fec",
    contact_icon_email: "mail|#b13329",
    contact_icon_directions: "directions|#ffffff",
    instagram_url: "https://www.instagram.com/federal_gaz/",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",

    // Auth Icons Defaults
    auth_icon_forgot_password: "lock_reset|#b13329",
    auth_icon_login: "",
    auth_icon_register: "",
    auth_icon_profile: "",
    homepage_marquee_text: "Önemli Duyuru: Federal Gaz sipariş ve destek talepleriniz için 7/24 iletişim e-posta adresimiz federal.gaz@hotmail.com",
    contact_map_lat: "39.9876",
    contact_map_lng: "32.7543",

    // Contact Form Defaults
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
    contact_form_fields: "[]",

    // Order Form Defaults
    order_form_title: "Sipariş Ver",
    order_form_fields: "[]",
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
    order_form_icon_add: "add|#ffffff",
    order_form_icon_delete: "delete|#ef4444",
    order_form_icon_note: "edit_note|#ef4444",
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

    // Filter out disabled settings
    const processedSettings = React.useMemo(() => {
        const finalSettings = { ...settings };
        const disabledKeysString = finalSettings.system_disabled_keys;

        let disabledKeys: string[] = [];
        try {
            if (disabledKeysString) {
                disabledKeys = JSON.parse(disabledKeysString);
            }
        } catch (e) {
            console.error("Failed to parse disabled keys:", e);
        }

        // If a key is disabled, set its value to empty string to hide it in UI checks
        disabledKeys.forEach(key => {
            if (key in finalSettings) {
                // specialized handling: if it's marquee text, set to empty
                // typescript trick to allow indexing
                (finalSettings as any)[key] = "";
            }
        });

        return finalSettings;
    }, [settings]);

    return (
        <SettingsContext.Provider value={{ settings: processedSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
};
