"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type NotificationType = "order" | "contact" | "system";

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock API call simulation
        setTimeout(() => {
            const storedReadIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");

            const initialNotifications: Notification[] = [
                {
                    id: 1,
                    type: "order",
                    title: "Yeni Sipariş",
                    message: "Ahmet Yılmaz yeni bir sipariş verdi. Sipariş No: #12548",
                    link: "/dashboard/orders?id=1",
                    isRead: false,
                    createdAt: "5 dakika önce",
                },
                {
                    id: 2,
                    type: "contact",
                    title: "Yeni İletişim Formu",
                    message: "Murat Özkan 'Fiyat Teklifi' konulu bir mesaj gönderdi",
                    link: "/dashboard/contacts?id=1",
                    isRead: false,
                    createdAt: "15 dakika önce",
                },
                {
                    id: 3,
                    type: "order",
                    title: "Yeni Sipariş",
                    message: "Ayşe Kaya yeni bir sipariş verdi. Sipariş No: #12547",
                    link: "/dashboard/orders?id=2",
                    isRead: true,
                    createdAt: "1 saat önce",
                },
                {
                    id: 4,
                    type: "contact",
                    title: "Yeni İletişim Formu",
                    message: "Zeynep Yıldız 'Teslimat Sorgusu' konulu bir mesaj gönderdi",
                    link: "/dashboard/contacts?id=2",
                    isRead: true,
                    createdAt: "2 saat önce",
                },
                {
                    id: 5,
                    type: "order",
                    title: "Yeni Sipariş",
                    message: "Mehmet Demir yeni bir sipariş verdi. Sipariş No: #12546",
                    link: "/dashboard/orders?id=3",
                    isRead: true,
                    createdAt: "3 saat önce",
                },
                {
                    id: 6,
                    type: "system",
                    title: "Sistem Bildirimi",
                    message: "Haftalık raporunuz hazır. İncelemek için tıklayın.",
                    link: "/dashboard",
                    isRead: true,
                    createdAt: "1 gün önce",
                },
            ];

            // Apply read status from localStorage
            const updatedNotifications = initialNotifications.map(n => ({
                ...n,
                isRead: n.isRead || storedReadIds.includes(n.id)
            }));

            setNotifications(updatedNotifications);
            setLoading(false);
        }, 500);
    }, []);

    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

        // Persist to localStorage
        const storedReadIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
        if (!storedReadIds.includes(id)) {
            localStorage.setItem("read_notifications", JSON.stringify([...storedReadIds, id]));
        }
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        // Persist all IDs to localStorage
        const allIds = notifications.map(n => n.id);
        const storedReadIds = JSON.parse(localStorage.getItem("read_notifications") || "[]");
        const newIds = Array.from(new Set([...storedReadIds, ...allIds]));
        localStorage.setItem("read_notifications", JSON.stringify(newIds));
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
}
