import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { headers } from "next/headers";

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
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Check if it's dashboard subdomain
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const isDashboard = hostname.startsWith('dashboard.');

    return (
        <html lang="tr" className={isDashboard ? "dark" : "light"}>
            <head>
                {isDashboard ? (
                    <>
                        <title>Federal Gaz - Yönetim Paneli</title>
                        <meta name="description" content="Federal Gaz Yönetim Paneli" />
                    </>
                ) : null}
                {/* Google Analytics 4 */}
                {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                    <>
                        <script
                            async
                            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
                        />
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                                        page_path: window.location.pathname,
                                    });
                                `,
                            }}
                        />
                    </>
                )}
                <link rel="icon" href={isDashboard ? "/dashboard-logo.png" : "/favicon.ico"} type="image/png" />
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
                                        "name": "Federal Gaz",
                                        "alternateName": "Federal Gaz Endüstriyel Gaz",
                                        "url": "https://federalgaz.com",
                                        "logo": {
                                            "@type": "ImageObject",
                                            "url": "https://federalgaz.com/logo-clean.png",
                                            "width": 512,
                                            "height": 512
                                        },
                                        "description": "Federal Gaz, endüstriyel gaz sektöründe Türkiye genelinde oksijen, argon, azot ve medikal gaz çözümleri sunan güvenilir tedarikçiniz.",
                                        "contactPoint": {
                                            "@type": "ContactPoint",
                                            "telephone": "+90-212-XXX-XXXX",
                                            "contactType": "customer service",
                                            "areaServed": "TR",
                                            "availableLanguage": ["Turkish", "English"]
                                        },
                                        "sameAs": []
                                    },
                                    {
                                        "@type": "WebSite",
                                        "@id": "https://federalgaz.com/#website",
                                        "url": "https://federalgaz.com",
                                        "name": "Federal Gaz",
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
                        <NotificationProvider>
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
                        </NotificationProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
