"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";
import { NotificationProvider } from "@/context/NotificationContext";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Check for login page on both /dashboard/login and /login (subdomain)
    const isLoginPage = pathname === "/dashboard/login" || pathname === "/login";

    // TODO: Get user from session/auth
    const user = {
        name: "Admin User",
        email: "admin@federalgaz.com",
    };

    // Login sayfası için sidebar ve header gösterme
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <NotificationProvider>
            <div className="flex h-screen overflow-hidden bg-[#101922]">
                <DashboardSidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <DashboardHeader user={user} />
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </NotificationProvider>
    );
}
