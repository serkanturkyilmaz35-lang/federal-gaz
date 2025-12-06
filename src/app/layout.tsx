import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Federal Gaz - Endüstriyel Gaz Çözümleri",
    description: "Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.",
};

import SecurityProvider from "@/components/SecurityProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className="light">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.variable} font-display antialiased`}>
                <LanguageProvider>
                    <AuthProvider>
                        <SecurityProvider>
                            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
                                <div className="layout-container flex h-full grow flex-col">
                                    <Header />
                                    <main className="flex-1">
                                        {children}
                                    </main>
                                    <Footer />
                                </div>
                            </div>
                        </SecurityProvider>
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
