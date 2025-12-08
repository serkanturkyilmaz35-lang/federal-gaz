"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Check for login page on both /dashboard/login and /login (subdomain)
    const isLoginPage = pathname === "/dashboard/login" || pathname === "/login";

    const { user } = useAuth();

    // Fallback display if user is loading or not found (though auth guard should handle access)
    const displayUser = user ? {
        name: user.name || "Kullanıcı",
        email: user.email || "",
        image: undefined
    } : {
        name: "Yönetici",
        email: "admin@federalgaz.com"
    };

    // Login sayfası için sidebar ve header gösterme
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#101922]">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader user={displayUser} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
