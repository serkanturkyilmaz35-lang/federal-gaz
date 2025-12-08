"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification, NotificationType } from "@/context/NotificationContext";


export default function NotificationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { notifications, markAsRead, markAllAsRead, clearAll, clearRead, unreadCount, loading } = useNotification();
    const [activeTab, setActiveTab] = useState<"new" | "history">("new");
    const searchTerm = searchParams.get("q") || "";

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case "order":
                return { icon: "shopping_cart", color: "text-blue-400 bg-blue-500/20" };
            case "contact":
                return { icon: "mail", color: "text-green-400 bg-green-500/20" };
            case "system":
                return { icon: "info", color: "text-yellow-400 bg-yellow-500/20" };
            default:
                return { icon: "notifications", color: "text-gray-400 bg-gray-500/20" };
        }
    };

    // Filter Logic
    const filteredNotifications = notifications.filter((n) => {
        const matchesTab = activeTab === "new" ? !n.read : n.read;
        const lowerTerm = searchTerm.toLocaleLowerCase('tr-TR');
        const matchesSearch = searchTerm === "" ||
            n.title.toLocaleLowerCase('tr-TR').includes(lowerTerm) ||
            n.message.toLocaleLowerCase('tr-TR').includes(lowerTerm);
        return matchesTab && matchesSearch;
    });



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#137fec]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700 mb-6"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Geri Dön
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Bildirimler</h1>
                        <p className="text-sm text-[#9dabb9]">
                            {unreadCount > 0 ? `${unreadCount} yeni bildirim` : "Yeni bildirim yok"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Tabs */}
                        <div className="flex rounded-lg bg-[#283039] p-1">
                            <button
                                onClick={() => setActiveTab("new")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "new"
                                    ? "bg-[#137fec] text-white shadow-sm"
                                    : "text-[#9dabb9] hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                Yeni
                                {unreadCount > 0 && (
                                    <span className="ml-2 bg-white/20 text-white text-[10px] px-1.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "history"
                                    ? "bg-[#137fec] text-white shadow-sm"
                                    : "text-[#9dabb9] hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                Geçmiş
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4 border-l border-gray-700 pl-4 h-8">




                            {activeTab === "new" && filteredNotifications.length > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-[#137fec] hover:text-[#137fec]/80 font-medium transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">done_all</span>
                                    Tümünü Okundu Say
                                </button>
                            )}

                            {activeTab === "history" && filteredNotifications.length > 0 && (
                                <button
                                    onClick={clearRead}
                                    className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                    Geçmişi Temizle
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>


            {/* Notifications List */}
            < div className="bg-[#111418] rounded-xl overflow-hidden shadow-lg border border-[#3b4754]" >
                {
                    filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-[#1c2127] flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-gray-500">
                                    {activeTab === "new" ? "notifications_off" : "history"}
                                </span>
                            </div>
                            <h3 className="text-white font-medium mb-1">
                                {activeTab === "new" ? "Yeni bildirim yok" : "Geçmiş bildirim yok"}
                            </h3>
                            <p className="text-[#9dabb9] text-sm">
                                {activeTab === "new"
                                    ? "Tüm bildirimleri okudunuz."
                                    : "Okunmuş bildirimler burada listelenir."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#3b4754]">
                            {filteredNotifications.map((notification) => {
                                const iconStyle = getNotificationIcon(notification.type);
                                return (
                                    <Link
                                        key={notification.id}
                                        href={notification.link}
                                        onClick={() => markAsRead(notification.id)}
                                        className={`flex items-start gap-4 p-4 hover:bg-[#1c2127] transition-colors group ${!notification.read ? "bg-[#137fec]/5" : ""
                                            }`}
                                    >
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconStyle.color} group-hover:scale-110 transition-transform`}>
                                            <span className="material-symbols-outlined">{iconStyle.icon}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className={`text-sm font-medium ${!notification.read ? "text-white" : "text-gray-300"}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 rounded-full bg-[#137fec]" title="Okunmamış" />
                                                )}
                                            </div>
                                            <p className="text-sm text-[#9dabb9] truncate pr-4">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">schedule</span>
                                                {new Date(notification.time).toLocaleString('tr-TR')}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-gray-500">chevron_right</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )
                }
            </div >
        </div >
    );
}
