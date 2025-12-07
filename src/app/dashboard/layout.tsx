import { Metadata } from 'next';
import DashboardLayoutClient from './DashboardLayoutClient';

export const metadata: Metadata = {
    title: {
        absolute: "Federal Gaz - Yönetim Paneli", // Overrides template from root layout
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
