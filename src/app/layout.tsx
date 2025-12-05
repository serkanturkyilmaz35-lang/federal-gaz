import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "700", "900"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Federal Gaz - Güvenilir Enerji Çözümleri",
    description: "Endüstriyel gaz ihtiyaçlarınız için yenilikçi, sürdürülebilir ve kaliteli hizmetler sunuyoruz.",
};

import SecurityProvider from "@/components/SecurityProvider";

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
                <SecurityProvider>
                    {children}
                </SecurityProvider>
            </body>
        </html>
    );
}
