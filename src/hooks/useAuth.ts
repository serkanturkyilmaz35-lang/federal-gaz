import { useState, useEffect } from 'react';

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getCookie = (name: string) => {
            if (typeof document === 'undefined') return null;
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
            return null;
        };

        const tokenVal = getCookie('auth_token');
        setToken(tokenVal);
        setLoading(false);
    }, []);

    return { token, loading };
}
