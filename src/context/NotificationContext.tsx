"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

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
    refreshNotifications: () => Promise<void>;
    loading: boolean;
    sessionExpired: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);
    const router = useRouter();

    // Web Audio API implementation for reliable sound
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

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

            if (data.sessionExpired) {
                setSessionExpired(true);
                router.push('/dashboard/login');
                return;
            }

            if (data.success) {
                setNotifications(prev => {
                    const prevUnreadCount = prev.filter(n => !n.read).length;
                    const newUnreadCount = data.notifications.filter((n: Notification) => !n.read).length;

                    if (newUnreadCount > prevUnreadCount) {
                        playNotificationSound();
                    }
                    return data.notifications;
                });
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    // No automatic fetching to save Netlify credits
    // Notifications are only fetched when user clicks the bell icon
    useEffect(() => {
        setLoading(false);
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );

        // Save to DB via API
        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: [id] })
            });
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        const allIds = notifications.filter(n => !n.read).map(n => n.id);

        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        // Save to DB via API
        try {
            await fetch('/api/notifications/read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: allIds })
            });
        } catch (error) {
            console.error('Failed to mark all notifications as read', error);
        }
    };

    const clearAll = async () => {
        const allIds = notifications.map(n => n.id);

        // Optimistic update
        setNotifications([]);

        // Save to DB via API
        try {
            await fetch('/api/notifications/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: allIds })
            });
        } catch (error) {
            console.error('Failed to delete all notifications', error);
        }
    };

    const clearRead = async () => {
        const readIds = notifications.filter(n => n.read).map(n => n.id);

        // Optimistic update - keep only unread
        setNotifications(prev => prev.filter(n => !n.read));

        // Save to DB via API
        try {
            await fetch('/api/notifications/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIds: readIds })
            });
        } catch (error) {
            console.error('Failed to delete read notifications', error);
        }
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
            refreshNotifications: fetchNotifications,
            loading,
            sessionExpired
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

