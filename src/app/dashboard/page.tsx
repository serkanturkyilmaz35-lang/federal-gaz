"use client";

import StatsCard from "@/components/dashboard/StatsCard";

export default function DashboardPage() {
    // Mock data - will be replaced with real API calls
    const stats = {
        totalOrders: 1245,
        totalQuotes: 832,
        activeUsers: 3450,
        siteVisits: 15678,
    };

    const activePages = [
        { url: "/urunler/endustriyel-gazlar/oksijen", users: 18, percentage: 20.6 },
        { url: "/anasayfa", users: 15, percentage: 17.2 },
        { url: "/cozumler/kaynak-teknolojileri", users: 11, percentage: 12.6 },
        { url: "/iletisim", users: 9, percentage: 10.3 },
        { url: "/hakkimizda", users: 7, percentage: 8.0 },
    ];

    const topPages = [
        { name: "/anasayfa", views: 4290, unique: 3985, bounceRate: "45%" },
        { name: "/urunler/gaz-sensoru", views: 2150, unique: 1820, bounceRate: "32%" },
        { name: "/hakkimizda", views: 1890, unique: 1600, bounceRate: "60%" },
        { name: "/iletisim", views: 980, unique: 850, bounceRate: "25%" },
    ];

    return (
        <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-[#292828] dark:text-white">
                        Genel Bakış
                    </h1>
                    <p className="text-base font-normal leading-normal text-[#94847c]">
                        Web sitesi performans metriklerine hoş geldiniz.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#b13329] pl-4 pr-3 text-white hover:bg-[#b13329]/90">
                        <p className="text-sm font-medium leading-normal">Son 30 Gün</p>
                        <span className="material-symbols-outlined text-lg">
                            expand_more
                        </span>
                    </button>
                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-300 bg-white px-3 text-[#292828] hover:bg-gray-100 dark:border-[#3b4754] dark:bg-[#1c2127] dark:text-white dark:hover:bg-[#283039]">
                        <span className="material-symbols-outlined text-lg">download</span>
                        <p className="text-sm font-medium leading-normal">Rapor İndir</p>
                    </button>
                </div>
            </div>

            {/* Real-time Stats & Active Pages */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Real-time Tracking */}
                <div className="flex flex-col justify-between rounded-xl border border-gray-300 bg-white p-6 dark:border-[#3b4754] dark:bg-[#1c2127] lg:col-span-1">
                    <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-[#292828] dark:text-white">
                            Gerçek Zamanlı Takip
                        </h3>
                        <span className="flex items-center gap-2 text-[#b13329]">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b13329] opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#b13329]"></span>
                            </span>
                            <span className="text-sm font-medium">CANLI</span>
                        </span>
                    </div>
                    <div className="my-4">
                        <p className="text-6xl font-bold text-[#292828] dark:text-white">87</p>
                        <p className="text-[#94847c]">şu anda aktif kullanıcı</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <p className="text-[#94847c]">Mobil</p>
                            <div className="h-2 w-2/3 rounded-full bg-gray-200 dark:bg-[#283039]">
                                <div className="h-2 rounded-full bg-[#f4b834]" style={{ width: "65%" }}></div>
                            </div>
                            <p className="font-medium text-[#292828] dark:text-white">57</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <p className="text-[#94847c]">Masaüstü</p>
                            <div className="h-2 w-2/3 rounded-full bg-gray-200 dark:bg-[#283039]">
                                <div className="h-2 rounded-full bg-[#b13329]" style={{ width: "35%" }}></div>
                            </div>
                            <p className="font-medium text-[#292828] dark:text-white">30</p>
                        </div>
                    </div>
                </div>

                {/* Active Pages */}
                <div className="rounded-xl border border-gray-300 bg-white p-6 dark:border-[#3b4754] dark:bg-[#1c2127] lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-[#292828] dark:text-white">
                        Aktif Sayfalar
                    </h3>
                    <div className="space-y-3">
                        {activePages.map((page, index) => (
                            <div key={index} className="grid grid-cols-10 items-center gap-4 text-sm">
                                <div className="col-span-6 truncate font-medium text-[#292828] dark:text-white">
                                    {page.url}
                                </div>
                                <div className="col-span-2 text-[#94847c]">{page.users} kullanıcı</div>
                                <div className="col-span-2 h-2 w-full rounded-full bg-gray-200 dark:bg-[#283039]">
                                    <div
                                        className="h-2 rounded-full bg-[#b13329]"
                                        style={{ width: `${page.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Toplam Sipariş"
                    value={stats.totalOrders.toLocaleString()}
                    change={{ value: "+5%", trend: "up" }}
                    icon="shopping_cart"
                />
                <StatsCard
                    title="Toplam Talep"
                    value={stats.totalQuotes.toLocaleString()}
                    change={{ value: "-2%", trend: "down" }}
                    icon="chat_bubble"
                />
                <StatsCard
                    title="Aktif Kullanıcılar"
                    value={stats.activeUsers.toLocaleString()}
                    change={{ value: "+12%", trend: "up" }}
                    icon="group"
                />
                <StatsCard
                    title="Site Ziyaretleri"
                    value={stats.siteVisits.toLocaleString()}
                    change={{ value: "+8%", trend: "up" }}
                    icon="visibility"
                />
            </div>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Chart Placeholder */}
                <div className="rounded-xl border border-gray-300 bg-white p-6 dark:border-[#3b4754] dark:bg-[#1c2127] lg:col-span-2">
                    <h3 className="mb-4 text-lg font-bold text-[#292828] dark:text-white">
                        Sipariş ve Talep Akışı
                    </h3>
                    <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#283039]">
                        <p className="text-[#94847c]">Grafik (Chart.js entegrasyonu yapılacak)</p>
                    </div>
                </div>

                {/* Donut Chart Placeholder */}
                <div className="rounded-xl border border-gray-300 bg-white p-6 dark:border-[#3b4754] dark:bg-[#1c2127]">
                    <h3 className="mb-4 text-lg font-bold text-[#292828] dark:text-white">
                        Kullanıcı Kaynakları
                    </h3>
                    <div className="flex h-80 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#283039]">
                        <p className="text-[#94847c]">Donut Chart</p>
                    </div>
                </div>

                {/* Top Pages Table */}
                <div className="rounded-xl border border-gray-300 bg-white p-6 dark:border-[#3b4754] dark:bg-[#1c2127] lg:col-span-3">
                    <h3 className="mb-4 text-lg font-bold text-[#292828] dark:text-white">
                        En Çok Görüntülenen Sayfalar
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#94847c]">
                            <thead className="bg-gray-100 text-xs uppercase text-[#292828] dark:bg-[#283039] dark:text-white">
                                <tr>
                                    <th className="rounded-l-lg px-6 py-3" scope="col">
                                        Sayfa Adı
                                    </th>
                                    <th className="px-6 py-3" scope="col">
                                        Görüntülenme
                                    </th>
                                    <th className="px-6 py-3" scope="col">
                                        Tekil Ziyaretçi
                                    </th>
                                    <th className="rounded-r-lg px-6 py-3" scope="col">
                                        Hemen Çıkma Oranı
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPages.map((page, index) => (
                                    <tr
                                        key={index}
                                        className="border-b border-gray-200 bg-white dark:border-[#3b4754] dark:bg-[#1c2127]"
                                    >
                                        <td className="px-6 py-4 font-medium text-[#292828] dark:text-white">
                                            {page.name}
                                        </td>
                                        <td className="px-6 py-4">{page.views.toLocaleString()}</td>
                                        <td className="px-6 py-4">{page.unique.toLocaleString()}</td>
                                        <td className="px-6 py-4">{page.bounceRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
