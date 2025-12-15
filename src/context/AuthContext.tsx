'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "editor" | "user";
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch('/api/auth/me', { signal: controller.signal });
            clearTimeout(timeoutId);

            const data = await res.json();

            // Check for session expired (another device logged in)
            if (data.sessionExpired) {
                setUser(null);
                // If on dashboard, redirect to login
                if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
                    router.push('/dashboard/login');
                }
                return;
            }

            if (res.ok && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            // On timeout or error, just set loading to false (show login button)
            console.warn('Auth check failed or timed out:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();

        // Periodic session check when on dashboard (every 2 minutes - optimized for Vercel limits)
        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
                refreshUser();
            }
        }, 120000);

        return () => clearInterval(interval);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        router.push('/profil'); // Redirect to profile after login
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
