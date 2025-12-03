import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // TODO: Get user from session/auth
    const user = {
        name: "Admin User",
        email: "admin@federalgaz.com",
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#ece6e4] dark:bg-[#101922]">
            <DashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardHeader user={user} />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
