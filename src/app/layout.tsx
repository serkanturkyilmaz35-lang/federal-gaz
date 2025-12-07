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
        default: "Federal Gaz - Endüstriyel Gaz Çözümleri",
        template: "%s | Federal Gaz",
    },
    description: "Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.",
    openGraph: {
        title: "Federal Gaz - Endüstriyel Gaz Çözümleri",
        description: "Yenilikçi ve sürdürülebilir endüstriyel gaz hizmetleri.",
        url: 'https://federalgaz.com',
        siteName: 'Federal Gaz',
        locale: 'tr_TR',
        type: 'website',
    },
};

import SecurityProvider from "@/components/SecurityProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

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
                <link rel="icon" href={isDashboard ? "/dashboard-logo.png" : "/favicon.ico"} type="image/png" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.variable} font-display antialiased`}>
                <LanguageProvider>
                    <AuthProvider>
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
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
