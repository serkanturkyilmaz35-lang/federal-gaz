"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: { page: string; views: number }[];
}

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

    const [data] = useState<AnalyticsData>({
        pageViews: 12458,
        uniqueVisitors: 4521,
        bounceRate: 42.3,
        avgSessionDuration: 185,
        topPages: [
            { page: '/urunler', views: 3245 },
            { page: '/', views: 2876 },
            { page: '/hizmetler', views: 1543 },
            { page: '/iletisim', views: 1234 },
            { page: '/hakkimizda', views: 876 },
        ]
    });

    useEffect(() => {
        // TODO: Fetch real analytics from GA4 or custom tracking
        setLoading(false);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white">
                        Analitik
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Web sitesi trafik ve performans istatistikleri.
                    </p>
                </div>
                <div className="flex gap-2">
                    {(['today', 'week', 'month', 'year'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateRange === range
                                    ? 'bg-[#137fec] text-white'
                                    : 'bg-[#1c2127] text-gray-400 hover:text-white border border-[#3b4754]'
                                }`}
                        >
                            {range === 'today' ? 'Bugün' : range === 'week' ? 'Hafta' : range === 'month' ? 'Ay' : 'Yıl'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-[#137fec]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#137fec]">visibility</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{data.pageViews.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-400 mt-1">Sayfa Görüntüleme</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +12.5% geçen aya göre
                    </p>
                </div>

                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-green-400">group</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{data.uniqueVisitors.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-400 mt-1">Tekil Ziyaretçi</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +8.3% geçen aya göre
                    </p>
                </div>

                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-yellow-400">trending_down</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">%{data.bounceRate}</p>
                    <p className="text-sm text-gray-400 mt-1">Hemen Çıkma Oranı</p>
                    <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +2.1% geçen aya göre
                    </p>
                </div>

                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-purple-400">schedule</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatDuration(data.avgSessionDuration)}</p>
                    <p className="text-sm text-gray-400 mt-1">Ort. Oturum Süresi</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                        +15s geçen aya göre
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-[#111418] rounded-xl border border-[#3b4754] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#3b4754]">
                        <h2 className="text-lg font-bold text-white">En Çok Ziyaret Edilen Sayfalar</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {data.topPages.map((page, index) => (
                                <div key={page.page} className="flex items-center gap-4">
                                    <span className="text-gray-500 font-medium w-6">{index + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{page.page}</p>
                                        <div className="mt-1 h-2 bg-[#1c2127] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#137fec] rounded-full"
                                                style={{ width: `${(page.views / data.topPages[0].views) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <span className="text-gray-400 font-medium">{page.views.toLocaleString('tr-TR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-[#111418] rounded-xl border border-[#3b4754] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#3b4754]">
                        <h2 className="text-lg font-bold text-white">Trafik Kaynakları</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-[#137fec] rounded-full"></div>
                                    <span className="text-gray-300">Organik Arama</span>
                                </div>
                                <span className="text-white font-medium">45%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-300">Direkt</span>
                                </div>
                                <span className="text-white font-medium">28%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-gray-300">Sosyal Medya</span>
                                </div>
                                <span className="text-white font-medium">18%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-gray-300">Referans</span>
                                </div>
                                <span className="text-white font-medium">9%</span>
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="mt-6 h-4 bg-[#1c2127] rounded-full overflow-hidden flex">
                            <div className="h-full bg-[#137fec]" style={{ width: '45%' }}></div>
                            <div className="h-full bg-green-500" style={{ width: '28%' }}></div>
                            <div className="h-full bg-purple-500" style={{ width: '18%' }}></div>
                            <div className="h-full bg-yellow-500" style={{ width: '9%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* GA4 Connection Note */}
            <div className="mt-6 bg-[#1c2127] rounded-xl p-4 border border-[#3b4754] flex items-center gap-4">
                <span className="material-symbols-outlined text-yellow-400">info</span>
                <div>
                    <p className="text-white font-medium">Google Analytics 4 Entegrasyonu</p>
                    <p className="text-sm text-gray-400">Gerçek zamanlı veriler için GA4 API entegrasyonu yapılabilir.</p>
                </div>
            </div>
        </div>
    );
}
