"use client";

import { useEffect, useRef, useCallback } from "react";

const NOTIFICATION_SOUND_URL = "/sounds/notification.mp3";
const CHECK_INTERVAL = 30000; // 30 seconds
const STORAGE_KEY = "lastCheckedOrderCount";

interface UseOrderNotificationOptions {
    enabled?: boolean;
    onNewOrder?: (newCount: number) => void;
}

export function useOrderNotification(options: UseOrderNotificationOptions = {}) {
    const { enabled = true, onNewOrder } = options;
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const lastCountRef = useRef<number | null>(null);

    // Initialize audio element
    useEffect(() => {
        if (typeof window !== "undefined") {
            audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
            audioRef.current.volume = 0.5;

            // Load last count from localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                lastCountRef.current = parseInt(stored, 10);
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Play notification sound
    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
                console.warn("Could not play notification sound:", error);
            });
        }
    }, []);

    // Check for new orders
    const checkNewOrders = useCallback(async () => {
        try {
            const response = await fetch("/api/orders/count");
            if (!response.ok) return;

            const data = await response.json();
            const currentCount = data.count || 0;

            // If we have a previous count and it increased
            if (lastCountRef.current !== null && currentCount > lastCountRef.current) {
                const newOrdersCount = currentCount - lastCountRef.current;
                playNotificationSound();
                onNewOrder?.(newOrdersCount);
            }

            // Update stored count
            lastCountRef.current = currentCount;
            localStorage.setItem(STORAGE_KEY, currentCount.toString());
        } catch (error) {
            console.error("Error checking for new orders:", error);
        }
    }, [playNotificationSound, onNewOrder]);

    // Set up polling interval
    useEffect(() => {
        if (!enabled) return;

        // Initial check
        checkNewOrders();

        // Set up interval
        const interval = setInterval(checkNewOrders, CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, [enabled, checkNewOrders]);

    return {
        playNotificationSound,
        checkNewOrders,
    };
}
