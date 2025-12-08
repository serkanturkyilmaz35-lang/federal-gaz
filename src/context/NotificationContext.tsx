"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";


export type NotificationType = "order" | "contact" | "system" | "info" | "alert";

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    link: string;
    read: boolean;
    time: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    clearRead: () => void;
    playNotificationSound: () => void;
    loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    // Web Audio API implementation for reliable sound
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();

            // Mimic "WhatsApp" (Glass/Pop) sound
            // Single Sine wave with rapid frequency drop
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            // Start high, drop low quickly to create "bloop/pop" effect
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

            // Envelope: Fast attack, short decay
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                const readIds = JSON.parse(localStorage.getItem('notification_read_ids') || '[]');
                const deletedIds = JSON.parse(localStorage.getItem('notification_deleted_ids') || '[]');

                console.log('Fetching Notifications:', {
                    totalFromServer: data.notifications.length,
                    readIds,
                    deletedIds
                });

                const validNotifications = data.notifications
                    .filter((n: Notification) => !deletedIds.includes(n.id))
                    .map((n: Notification) => ({
                        ...n,
                        read: n.read || readIds.includes(n.id)
                    }));

                setNotifications(prev => {
                    // Check if there are NEW unread notifications compared to previous state
                    const prevUnreadCount = prev.filter(n => !n.read).length;
                    const newUnreadCount = validNotifications.filter((n: any) => !n.read).length;

                    console.log('Notification Update:', {
                        prevUnread: prevUnreadCount,
                        newUnread: newUnreadCount,
                        shouldPlaySound: newUnreadCount > prevUnreadCount
                    });

                    if (newUnreadCount > prevUnreadCount) {
                        // Play sound using Web Audio API
                        playNotificationSound();
                    }
                    return validNotifications;
                });
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 5 seconds for "real-time" feel
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        const readIds = JSON.parse(localStorage.getItem('notification_read_ids') || '[]');
        if (!readIds.includes(id)) {
            localStorage.setItem('notification_read_ids', JSON.stringify([...readIds, id]));
        }
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        const allIds = notifications.map(n => n.id);
        const readIds = JSON.parse(localStorage.getItem('notification_read_ids') || '[]');
        const newIds = Array.from(new Set([...readIds, ...allIds]));
        localStorage.setItem('notification_read_ids', JSON.stringify(newIds));
    };

    const clearAll = () => {
        const allIds = notifications.map(n => n.id);
        const deletedIds = JSON.parse(localStorage.getItem('notification_deleted_ids') || '[]');
        const newDeletedIds = Array.from(new Set([...deletedIds, ...allIds]));
        localStorage.setItem('notification_deleted_ids', JSON.stringify(newDeletedIds));
        setNotifications([]); // Clear current state
    };

    // NEW: Clear only read notifications (History)
    const clearRead = () => {
        const readNotifications = notifications.filter(n => n.read);
        const readIds = readNotifications.map(n => n.id);
        const deletedIds = JSON.parse(localStorage.getItem('notification_deleted_ids') || '[]');
        const newDeletedIds = Array.from(new Set([...deletedIds, ...readIds]));
        localStorage.setItem('notification_deleted_ids', JSON.stringify(newDeletedIds));
        setNotifications(prev => prev.filter(n => !n.read)); // Keep unread ones
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearAll,
            clearRead,
            playNotificationSound,
            loading
        }}>    {children}
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
