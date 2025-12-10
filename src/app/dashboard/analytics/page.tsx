"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface AnalyticsResponse {
    success: boolean;
    gaConfigured: boolean;
    keyMetrics: {
        pageViews: number;
        uniqueVisitors: number;
        bounceRate: number;
        avgSessionDuration: number;
    };
    topPages: { name: string; views: number; unique: number; bounceRate: string }[];
    trafficSources: { source: string; users: number; percentage: number }[];
    topCities: { city: string; users: number; percentage: number }[];
    realTime: {
        activeUsers: number;
        mobileUsers: number;
        desktopUsers: number;
    };
}

// Translations for Traffic Sources
const TRAFFIC_SOURCE_TRANSLATIONS: Record<string, string> = {
    'Direct': 'Doğrudan',
    'Organic Search': 'Organik Arama',
    'Paid Search': 'Ücretli Arama',
    'Referral': 'Referans',
    'Organic Social': 'Sosyal Medya',
    'Unassigned': 'Tanımlanmamış',
    '(not set)': 'Bilinmiyor'
};

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | '90days' | 'custom'>('30days');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [data, setData] = useState<AnalyticsResponse | null>(null);

    const fetchData = async () => {
        try {
            let url = `/api/dashboard/analytics?dateRange=${dateRange}`;
            if (dateRange === 'custom' && customStart && customEnd) {
                url += `&customStart=${customStart}&customEnd=${customEnd}`;
            }

            // Don't fetch if custom is selected but dates are empty
            if (dateRange === 'custom' && (!customStart || !customEnd)) {
                return;
            }

            const res = await fetch(url);
            const json = await res.json();
            if (json.success) {
                setData(json);
            }
        } catch (error) {
            console.error('Analytics fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and date range change
    useEffect(() => {
        if (dateRange !== 'custom') {
            setLoading(true);
            fetchData();
        }
    }, [dateRange]);

    // Fetch on custom date change logic can be manual (via button) or effect.
    // Let's rely on a "Uygula" button for custom dates or effect if both valid.
    useEffect(() => {
        if (dateRange === 'custom' && customStart && customEnd) {
            setLoading(true);
            fetchData();
        }
    }, [customStart, customEnd]);

    // Real-time polling (every 30 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            if (dateRange !== 'custom') fetchData();
        }, 30000);
        return () => clearInterval(interval);
    }, [dateRange]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading && !data && dateRange !== 'custom') {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    const { keyMetrics, topPages, trafficSources, topCities = [], realTime, gaConfigured } = data || {
        keyMetrics: { pageViews: 0, uniqueVisitors: 0, bounceRate: 0, avgSessionDuration: 0 },
        topPages: [], trafficSources: [], topCities: [], realTime: { activeUsers: 0, mobileUsers: 0, desktopUsers: 0 }, gaConfigured: false
    };

    return (
        <div className="h-full flex flex-col p-4 lg:p-6 max-w-[1600px] mx-auto">
            {/* Page Header & Filters */}
            <div className="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-white flex items-center gap-3">
                        Analitik
                        {realTime.activeUsers > 0 && (
                            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                CANLI
                            </span>
                        )}
                    </h1>
                    <p className="text-sm lg:text-base font-normal leading-normal text-gray-400">
                        Web sitesi trafik ve performans istatistikleri.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex bg-[#111418] p-1 rounded-lg border border-[#3b4754]">
                        {[
                            { id: 'today', label: 'Bugün' },
                            { id: '7days', label: '7 Gün' },
                            { id: '30days', label: '30 Gün' },
                            { id: '90days', label: '90 Gün' },
                            { id: 'custom', label: 'Özel Tarih' },
                        ].map((range) => (
                            <button
                                key={range.id}
                                onClick={() => setDateRange(range.id as any)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${dateRange === range.id
                                    ? 'bg-[#137fec] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white hover:bg-[#1c2127]'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                    {dateRange === 'custom' && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-[#111418] border border-[#3b4754] text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#137fec] outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                            />
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-[#111418] border border-[#3b4754] text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#137fec] outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754] shadow-sm hover:border-[#137fec]/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-[#137fec]/10 rounded-lg">
                            <span className="material-symbols-outlined text-[#137fec]">visibility</span>
                        </div>
                        {gaConfigured && <span className="text-xs text-gray-500 font-mono">GA4</span>}
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{keyMetrics.pageViews.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Sayfa Görüntüleme</p>
                </div>

                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754] shadow-sm hover:border-green-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-green-400">group</span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-green-400 font-bold">{realTime.activeUsers} Aktif</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{keyMetrics.uniqueVisitors.toLocaleString('tr-TR')}</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Tekil Ziyaretçi</p>
                </div>

                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754] shadow-sm hover:border-yellow-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-yellow-400">trending_down</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">%{keyMetrics.bounceRate}</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Hemen Çıkma Oranı</p>
                </div>

                <div className="bg-[#111418] rounded-xl p-6 border border-[#3b4754] shadow-sm hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <span className="material-symbols-outlined text-purple-400">schedule</span>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">{formatDuration(keyMetrics.avgSessionDuration)}</p>
                    <p className="text-sm text-gray-400 mt-1 font-medium">Ort. Oturum Süresi</p>
                </div>
            </div>

            {/* Main Content Grid - 3 Columns now? Or 2-1 layout. Let's do Standard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {/* Top Pages */}
                <div className="bg-[#111418] rounded-xl border border-[#3b4754] overflow-hidden flex flex-col lg:col-span-2 xl:col-span-1">
                    <div className="px-6 py-4 border-b border-[#3b4754] bg-[#161b22]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-base">description</span>
                            En Çok Ziyaret Edilenler
                        </h2>
                    </div>
                    <div className="p-6 flex-1">
                        {/* (Existing Top Pages Logic) */}
                        {topPages.length > 0 ? (
                            <div className="space-y-5">
                                {topPages.map((page, index) => {
                                    const maxViews = topPages[0].views;
                                    const percent = (page.views / maxViews) * 100;
                                    return (
                                        <div key={page.name} className="group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${index === 0 ? 'bg-[#137fec] text-white' : 'bg-[#1c2127] text-gray-500'}`}>
                                                        {index + 1}
                                                    </span>
                                                    <p className="text-white font-medium text-sm group-hover:text-[#137fec] transition-colors truncate max-w-[150px]">{page.name}</p>
                                                </div>
                                                <span className="text-gray-300 font-mono text-sm">{page.views.toLocaleString('tr-TR')}</span>
                                            </div>
                                            <div className="h-2 bg-[#1c2127] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[#137fec] to-[#3b82f6] rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <div className="text-gray-500 text-center py-10">Veri yok</div>}
                    </div>
                </div>

                {/* Top Cities (NEW) */}
                <div className="bg-[#111418] rounded-xl border border-[#3b4754] overflow-hidden flex flex-col lg:col-span-1 xl:col-span-1">
                    <div className="px-6 py-4 border-b border-[#3b4754] bg-[#161b22]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-base">public</span>
                            En Çok Ziyaret Eden Şehirler
                        </h2>
                    </div>
                    <div className="p-6 flex-1">
                        {/* (Top Cities Logic - similar bars) */}
                        {topCities.length > 0 ? (
                            <div className="space-y-5">
                                {topCities.map((city, index) => {
                                    const maxUsers = topCities[0].users;
                                    const percent = (city.users / maxUsers) * 100;
                                    // Flag logic could be complex without API, stick to simple text
                                    return (
                                        <div key={city.city} className="group">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${index === 0 ? 'bg-orange-500 text-white' : 'bg-[#1c2127] text-gray-500'}`}>
                                                        {index + 1}
                                                    </span>
                                                    <p className="text-white font-medium text-sm group-hover:text-orange-400 transition-colors">{city.city}</p>
                                                </div>
                                                <span className="text-gray-300 font-mono text-sm">{city.users.toLocaleString('tr-TR')}</span>
                                            </div>
                                            <div className="h-2 bg-[#1c2127] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <div className="text-gray-500 text-center py-10">Şehir verisi yok</div>}
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-[#111418] rounded-xl border border-[#3b4754] overflow-hidden flex flex-col lg:col-span-1 xl:col-span-1">
                    <div className="px-6 py-4 border-b border-[#3b4754] bg-[#161b22]">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-400 text-base">traffic</span>
                            Trafik Kaynakları
                        </h2>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-center">
                        {trafficSources.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {trafficSources.map((source, index) => {
                                        const colors = ['bg-[#137fec]', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-gray-500'];
                                        const color = colors[index % colors.length];
                                        const translatedSource = TRAFFIC_SOURCE_TRANSLATIONS[source.source] || source.source;

                                        return (
                                            <div key={source.source} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 ${color} rounded-full ring-2 ring-[#111418]`}></div>
                                                    <span className="text-gray-300 capitalize text-sm">{translatedSource}</span>
                                                </div>
                                                <span className="text-white font-bold text-sm">{source.percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 h-4 bg-[#1c2127] rounded-full overflow-hidden flex ring-1 ring-[#3b4754]">
                                    {trafficSources.map((source, index) => {
                                        const colors = ['bg-[#137fec]', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-gray-500'];
                                        const color = colors[index % colors.length];
                                        return (
                                            <div
                                                key={source.source}
                                                className={`h-full ${color}`}
                                                style={{ width: `${source.percentage}%` }}
                                                title={`${source.source}: ${source.percentage}%`}
                                            ></div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                <span className="material-symbols-outlined text-4xl mb-2">traffic</span>
                                <p>Veri bulunamadı.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* GA4 Footer */}
            <div className="mt-auto flex items-center justify-between bg-[#1c2127]/50 rounded-xl p-4 border border-[#3b4754] backdrop-blur-sm">
                {/* (Same Footer) */}
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 relative flex items-center justify-center bg-white/10 rounded-lg p-1">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V6h2v10z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-medium text-sm">Google Analytics 4 ile güçlendirilmiştir.</p>
                        <p className="text-xs text-gray-500">
                            {gaConfigured
                                ? "Gerçek zamanlı veriler api üzerinden anlık olarak çekilmektedir."
                                : "API bağlantısı bekleniyor. Gösterilen veriler temsilidir."}
                        </p>
                    </div>
                </div>
                {gaConfigured ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span className="text-xs font-bold tracking-wide">BAĞLI</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        <span className="text-xs font-bold tracking-wide">BAĞLANTI YOK</span>
                    </div>
                )}
            </div>
        </div>
    );
}
