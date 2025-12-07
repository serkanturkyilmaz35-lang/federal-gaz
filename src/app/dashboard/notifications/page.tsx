"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotification, NotificationType } from "@/context/NotificationContext";

export default function NotificationsPage() {
    const { notifications, markAsRead, markAllAsRead, loading } = useNotification();
    const [filter, setFilter] = useState<"all" | "unread">("all");

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

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-white">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bildirimler</h1>
                    <p className="text-sm text-[#9dabb9]">
                        {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : "Tüm bildirimler okundu"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter */}
                    <div className="flex rounded-lg bg-[#283039] p-1">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === "all"
                                ? "bg-[#137fec] text-white"
                                : "text-[#9dabb9] hover:text-white"
                                }`}
                        >
                            Tümü
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${filter === "unread"
                                ? "bg-[#137fec] text-white"
                                : "text-[#9dabb9] hover:text-white"
                                }`}
                        >
                            Okunmamış
                        </button>
                    </div>
                    {/* Mark All Read */}
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-700 text-[#9dabb9] hover:text-white hover:border-gray-500"
                        >
                            <span className="material-symbols-outlined text-base">done_all</span>
                            Tümünü Okundu İşaretle
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-[#111418] rounded-xl overflow-hidden">
                {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-500 mb-3">notifications_off</span>
                        <p className="text-[#9dabb9]">
                            {filter === "unread" ? "Okunmamış bildirim yok" : "Henüz bildirim yok"}
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
                                    className={`flex items-start gap-4 p-4 hover:bg-[#1c2127] transition-colors ${!notification.isRead ? "bg-[#137fec]/5" : ""
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${iconStyle.color}`}>
                                        <span className="material-symbols-outlined">{iconStyle.icon}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-sm font-medium ${!notification.isRead ? "text-white" : "text-[#9dabb9]"}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-[#137fec]" />
                                            )}
                                        </div>
                                        <p className="text-sm text-[#9dabb9] mt-0.5 truncate">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {notification.createdAt}
                                        </p>
                                    </div>

                                    {/* Arrow */}
                                    <div className="flex-shrink-0 self-center">
                                        <span className="material-symbols-outlined text-gray-500">chevron_right</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
