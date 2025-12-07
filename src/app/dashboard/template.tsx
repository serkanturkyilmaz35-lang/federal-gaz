import type { Metadata } from "next";

// Dashboard için metadata
export const metadata: Metadata = {
    title: "Federal Gaz - Yönetim Paneli",
    description: "Federal Gaz Yönetim Paneli",
};

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
