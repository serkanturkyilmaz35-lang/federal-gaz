"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext"; // Import hook

const translations = {
    TR: {
        about: "Hakkımızda",
        services: "Hizmetlerimiz",
        products: "Ürünler",
        gallery: "Galeri",
        contact: "İletişim",
        footerSlogan: "Endüstriyel Gaz Çözümleri", // Fallback only
        footerContact: "İletişim",
        footerQuickLinks: "Hızlı Erişim",
        footerSocial: "Sosyal Medya",
        rights: "Tüm hakları saklıdır."
    },
    EN: {
        about: "About Us",
        services: "Services",
        products: "Products",
        gallery: "Gallery",
        contact: "Contact",
        footerSlogan: "Your reliable partner in industrial gas solutions.",
        footerContact: "Contact",
        footerQuickLinks: "Quick Links",
        footerSocial: "Social Media",
        rights: "All rights reserved."
    }
};

export default function Footer() {
    const { language } = useLanguage();
    const { settings } = useSettings(); // Use context
    const t = translations[language];

    // Helper to format phone for href (remove spaces, parens)
    const formatPhone = (phone: string) => phone.replace(/[^0-9+]/g, '');

    return (
        <footer className="bg-secondary text-white/80 dark:bg-secondary">
            <div className="mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="md:col-span-1">
                        <Link href="/" title={language === 'TR' ? 'Federal Gaz Ana Sayfa' : 'Federal Gaz Home'} className="inline-block">
                            <h3 className="mb-4 text-lg font-bold text-white hover:text-primary transition-colors">
                                {settings.site_name || "Federal Gaz"}
                            </h3>
                        </Link>
                        <p className="text-sm">
                            {language === 'TR' ? (settings.site_slogan || t.footerSlogan) : t.footerSlogan}
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-white">{t.footerContact}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><p className="whitespace-pre-line">{settings.contact_address}</p></li>

                            {/* Phone 1 */}
                            {settings.contact_phone && (
                                <li>
                                    {settings.contact_phone_1_label && <span className="text-xs text-gray-400 block">{settings.contact_phone_1_label}</span>}
                                    <a href={`tel:${formatPhone(settings.contact_phone)}`} title="Telefon" className="transition-colors hover:text-primary pt-1 block sm:pt-0 sm:inline">
                                        {settings.contact_phone}
                                    </a>
                                </li>
                            )}

                            {/* Phone 2 */}
                            {settings.contact_phone_2 && (
                                <li>
                                    {settings.contact_phone_2_label && <span className="text-xs text-gray-400 block">{settings.contact_phone_2_label}</span>}
                                    <a href={`tel:${formatPhone(settings.contact_phone_2)}`} title="GSM 1" className="transition-colors hover:text-primary">
                                        {settings.contact_phone_2}
                                    </a>
                                </li>
                            )}

                            {/* Phone 3 */}
                            {settings.contact_phone_3 && (
                                <li>
                                    {settings.contact_phone_3_label && <span className="text-xs text-gray-400 block">{settings.contact_phone_3_label}</span>}
                                    <a href={`tel:${formatPhone(settings.contact_phone_3)}`} title="GSM 2" className="transition-colors hover:text-primary">
                                        {settings.contact_phone_3}
                                    </a>
                                </li>
                            )}

                            {settings.contact_email && (
                                <li><a href={`mailto:${settings.contact_email}`} title="E-posta" className="transition-colors hover:text-primary">{settings.contact_email}</a></li>
                            )}
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-white">{t.footerQuickLinks}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/hakkimizda" title={language === 'TR' ? 'Federal Gaz Hakkında' : 'About Federal Gaz'} className="transition-colors hover:text-primary">{t.about}</Link></li>
                            <li><Link href="/hizmetler" title={language === 'TR' ? 'Federal Gaz Hizmetleri' : 'Federal Gaz Services'} className="transition-colors hover:text-primary">{t.services}</Link></li>
                            <li><Link href="/urunler" title={language === 'TR' ? 'Endüstriyel Gaz Ürünleri' : 'Industrial Gas Products'} className="transition-colors hover:text-primary">{t.products}</Link></li>
                            <li><Link href="/galeri" title={language === 'TR' ? 'Federal Gaz Galeri' : 'Federal Gaz Gallery'} className="transition-colors hover:text-primary">{t.gallery}</Link></li>
                            <li><Link href="/iletisim" title={language === 'TR' ? 'Federal Gaz İletişim' : 'Contact Federal Gaz'} className="transition-colors hover:text-primary">{t.contact}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-4 font-semibold text-white">{t.footerSocial}</h4>
                        <div className="flex space-x-4">
                            {settings.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram" className="transition-colors hover:text-primary">
                                    <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.791.218-2.427.465a4.901 4.901 0 00-1.772 1.153A4.902 4.902 0 002.525 5.45c-.247.636-.416 1.363-.465 2.427C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.427a4.902 4.902 0 001.153 1.772 4.901 4.901 0 001.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.427-.465a4.901 4.901 0 001.772-1.153 4.902 4.902 0 001.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.427a4.902 4.902 0 00-1.153-1.772 4.901 4.901 0 00-1.772-1.153c-.636-.247-1.363-.416-2.427-.465C15.056 2.012 14.716 2 12 2zm0 1.802c2.67 0 2.986.01 4.04.058.976.045 1.505.207 1.858.344.466.182.8.399 1.15.748.35.35.566.684.748 1.15.137.353.3.882.344 1.857.048 1.055.058 1.37.058 4.041 0 2.67-.01 2.986-.058 4.04-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 01-.748 1.15c-.35.35-.684.566-1.15.748-.353.137-.882.3-1.857.344-1.054.048-1.37.058-4.041.058-2.67 0-2.987-.01-4.04-.058-.976-.045-1.505-.207-1.858-.344a3.098 3.098 0 01-1.15-.748 3.098 3.098 0 01-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.058-1.37-.058-4.041 0-2.67.01-2.986.058-4.04.045-.976.207-1.505.344-1.858.182-.466.399-.8.748-1.15.35-.35.684-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.37-.058 4.041-.058zm0 3.063a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                                    </svg>
                                </a>
                            )}
                            {/* Render other social icons similarly if needed, or stick to just Instagram if that's the only one provided */}
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-white/20 pt-8 text-center text-sm">
                    <p>© {new Date().getFullYear()} {settings.site_name || "Federal Gaz"}. {t.rights} <a href="https://www.federalgaz.com" className="font-semibold transition-colors hover:text-primary">www.federalgaz.com</a></p>
                </div>
            </div>
        </footer>
    );
}
