import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import { SiteSettings, connectToDatabase } from "@/lib/models"; // Import models

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    metadataBase: new URL('https://federalgaz.com'),
    title: {
        default: "Federal Gaz - Endüstriyel Gaz Çözümleri | Oksijen, Argon, Azot, Tüp Satış",
        template: "%s | Federal Gaz",
    },
    description: "Federal Gaz, endüstriyel gaz sektöründe Türkiye genelinde oksijen, argon, azot, karbondioksit ve medikal gaz çözümleri sunan güvenilir tedarikçiniz. Tüp satış, dolum ve dağıtım hizmetleri.",
    keywords: [
        "federal gaz",
        "endüstriyel gaz",
        "oksijen",
        "argon",
        "azot",
        "karbondioksit",
        "medikal gaz",
        "gaz tüpü",
        "tüp dolum",
        "kaynak gazı",
        "gaz tedarik",
        "gaz satış",
        "sanayi gazları",
        "istanbul gaz",
        "türkiye gaz",
    ],
    authors: [{ name: "Federal Gaz" }],
    creator: "Federal Gaz",
    publisher: "Federal Gaz",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: "Federal Gaz - Endüstriyel Gaz Çözümleri",
        description: "Oksijen, argon, azot ve medikal gaz çözümleri. Türkiye'nin güvenilir gaz tedarikçisi.",
        url: 'https://federalgaz.com',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
        images: [
            {
                url: '/logo-clean.png',
                width: 512,
                height: 512,
                alt: 'Federal Gaz Logo',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Federal Gaz - Endüstriyel Gaz Çözümleri',
        description: 'Oksijen, argon, azot ve medikal gaz çözümleri. Türkiye\'nin güvenilir gaz tedarikçisi.',
        images: ['/logo-clean.png'],
    },
    alternates: {
        canonical: 'https://federalgaz.com',
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
};


import SecurityProvider from "@/components/SecurityProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SettingsProvider } from "@/context/SettingsContext"; // Import SettingsProvider
import { EncryptionProvider } from "@/context/EncryptionContext";

// Fetch settings helper
async function getSiteSettings() {
    try {
        await connectToDatabase();
        // Use raw query or ensuring the model is loaded to avoid "Model not defined" in dev
        // In production, standard findAll works fine.
        const settings = await SiteSettings.findAll();

        const settingsObj: Record<string, string> = {};
        settings.forEach(s => {
            if (s && s.key) {
                settingsObj[s.key] = s.value;
            }
        });
        return settingsObj;
    } catch (error) {
        console.error("Failed to fetch settings for layout:", error);
        return {};
    }
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Check if it's dashboard subdomain
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const isDashboard = hostname.startsWith('dashboard.');

    // Fetch settings server-side
    const settings = await getSiteSettings();

    const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    return (
        <html lang="tr" className={isDashboard ? "dark" : "light"}>
            <head>
                {isDashboard ? (
                    <>
                        <title>Federal Gaz - Yönetim Paneli</title>
                        <meta name="description" content="Federal Gaz Yönetim Paneli" />
                    </>
                ) : null}
                {/* Google Analytics 4 - SPA Compatible */}
                {gaMeasurementId && <GoogleAnalytics measurementId={gaMeasurementId} />}
                {/* Use dynamic favicon if available, else default */}
                <link rel="icon" href={isDashboard ? "/dashboard-logo.png" : (settings['favicon_url'] || "/favicon.ico")} type="image/png" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

                {/* JSON-LD Structured Data for SEO */}
                {!isDashboard && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@graph": [
                                    {
                                        "@type": "Organization",
                                        "@id": "https://federalgaz.com/#organization",
                                        "name": settings['site_name'] || "Federal Gaz",
                                        "alternateName": "Federal Gaz Endüstriyel Gaz",
                                        "url": "https://federalgaz.com",
                                        "logo": {
                                            "@type": "ImageObject",
                                            "url": `https://federalgaz.com${settings['logo_url'] || '/logo-clean.png'}`,
                                            "width": 512,
                                            "height": 512
                                        },
                                        "description": settings['site_slogan'] || "Federal Gaz, endüstriyel gaz sektöründe Türkiye genelinde oksijen, argon, azot ve medikal gaz çözümleri sunan güvenilir tedarikçiniz.",
                                        "contactPoint": {
                                            "@type": "ContactPoint",
                                            "telephone": settings['contact_phone'] || "+90-312-395-3595",
                                            "contactType": "customer service",
                                            "areaServed": "TR",
                                            "availableLanguage": ["Turkish", "English"]
                                        },
                                        "sameAs": [
                                            settings['instagram_url'],
                                            settings['facebook_url'],
                                            settings['twitter_url'],
                                            settings['linkedin_url'],
                                            settings['youtube_url']
                                        ].filter(Boolean)
                                    },
                                    {
                                        "@type": "WebSite",
                                        "@id": "https://federalgaz.com/#website",
                                        "url": "https://federalgaz.com",
                                        "name": settings['site_name'] || "Federal Gaz",
                                        "description": "Endüstriyel gaz çözümleri ve tüp satış hizmetleri",
                                        "publisher": {
                                            "@id": "https://federalgaz.com/#organization"
                                        },
                                        "potentialAction": {
                                            "@type": "SearchAction",
                                            "target": "https://federalgaz.com/urunler?q={search_term_string}",
                                            "query-input": "required name=search_term_string"
                                        }
                                    },
                                    {
                                        "@type": "SiteNavigationElement",
                                        "name": "Ana Sayfa",
                                        "url": "https://federalgaz.com"
                                    },
                                    {
                                        "@type": "SiteNavigationElement",
                                        "name": "Hakkımızda",
                                        "url": "https://federalgaz.com/hakkimizda"
                                    },
                                    {
                                        "@type": "SiteNavigationElement",
                                        "name": "Ürünler",
                                        "url": "https://federalgaz.com/urunler"
                                    },
                                    {
                                        "@type": "SiteNavigationElement",
                                        "name": "Hizmetler",
                                        "url": "https://federalgaz.com/hizmetler"
                                    },
                                    {
                                        "@type": "SiteNavigationElement",
                                        "name": "Galeri",
                                        "url": "https://federalgaz.com/galeri"
                                    },
                                    {
                                        "@type": "SiteNavigationElement",
                                        "name": "İletişim",
                                        "url": "https://federalgaz.com/iletisim"
                                    }
                                ]
                            })
                        }}
                    />
                )}
            </head>
            <body className={`${inter.variable} font-display antialiased`}>
                <LanguageProvider>
                    <AuthProvider>
                        <SettingsProvider initialSettings={settings}>
                            <NotificationProvider>
                                <EncryptionProvider>
                                    <SecurityProvider>
                                        {isDashboard ? (
                                            // Dashboard: no main site header/footer
                                            <>{children}</>
                                        ) : (
                                            // Main site: with header and footer
                                            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
                                                <div className="layout-container flex h-full grow flex-col">
                                                    <Header />
                                                    <main className="flex-1">
                                                        {children}
                                                    </main>
                                                    <Footer />
                                                </div>
                                            </div>
                                        )}
                                    </SecurityProvider>
                                </EncryptionProvider>
                            </NotificationProvider>
                        </SettingsProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
