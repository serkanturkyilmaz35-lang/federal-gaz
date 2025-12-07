import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        absolute: "Federal Gaz - Yönetim Paneli",
    },
    description: "Federal Gaz Yönetim Paneli - Giriş",
};

export default function DashboardLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
