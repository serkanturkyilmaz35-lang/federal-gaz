"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

interface UseCachedFetchOptions {
    ttl?: number; // Time to live in milliseconds (default 5 minutes)
    enabled?: boolean; // Whether to fetch automatically
    skipCache?: boolean; // Force fresh fetch
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Custom hook for cached API fetching to minimize Netlify credit usage
 * - Stores data in memory cache
 * - Returns cached data if still valid
 * - Only fetches when cache expired or forced refresh
 */
export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: UseCachedFetchOptions = {}
) {
    const { ttl = 5 * 60 * 1000, enabled = true, skipCache = false } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const fetchingRef = useRef(false);

    const isCacheValid = useCallback(() => {
        const entry = cache.get(key);
        if (!entry) return false;
        return Date.now() - entry.timestamp < entry.ttl;
    }, [key]);

    const getCachedData = useCallback((): T | null => {
        const entry = cache.get(key);
        if (entry && isCacheValid()) {
            return entry.data as T;
        }
        return null;
    }, [key, isCacheValid]);

    const fetchData = useCallback(async (forceRefresh = false) => {
        // Prevent duplicate fetches
        if (fetchingRef.current) return;

        // Check cache first (unless force refresh)
        if (!forceRefresh && !skipCache) {
            const cached = getCachedData();
            if (cached !== null) {
                setData(cached);
                setLoading(false);
                return;
            }
        }

        fetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const result = await fetcher();

            // Store in cache
            cache.set(key, {
                data: result,
                timestamp: Date.now(),
                ttl
            });

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Fetch failed'));
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [key, ttl, skipCache, fetcher, getCachedData]);

    // Manual refresh function
    const refresh = useCallback(() => {
        return fetchData(true);
    }, [fetchData]);

    // Clear this key's cache
    const clearCache = useCallback(() => {
        cache.delete(key);
    }, [key]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            // First check cache synchronously
            const cached = getCachedData();
            if (cached !== null) {
                setData(cached);
                setLoading(false);
            } else {
                fetchData();
            }
        }
    }, [enabled, key]); // Only re-run if key or enabled changes

    return {
        data,
        loading,
        error,
        refresh,
        clearCache,
        isCached: isCacheValid()
    };
}

/**
 * Clear all cached data
 */
export function clearAllCache() {
    cache.clear();
}

/**
 * Clear cache entries matching a prefix
 */
export function clearCacheByPrefix(prefix: string) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) {
            cache.delete(key);
        }
    }
}

/**
 * Debounce helper for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
