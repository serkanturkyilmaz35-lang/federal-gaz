/**
 * Simple in-memory rate limiter for API endpoints
 * Note: For production with multiple instances, use Redis-based rate limiting
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting (simple implementation)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean every minute

export interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

// Predefined limits for different endpoints
export const RATE_LIMITS = {
    login: { windowMs: 60000, maxRequests: 5 },      // 5 attempts per minute
    otp: { windowMs: 60000, maxRequests: 3 },        // 3 OTP attempts per minute
    register: { windowMs: 300000, maxRequests: 3 }, // 3 registrations per 5 minutes
    api: { windowMs: 60000, maxRequests: 100 },     // 100 API calls per minute
    passwordReset: { windowMs: 300000, maxRequests: 3 }, // 3 resets per 5 minutes
};

/**
 * Check if request is rate limited
 * @param identifier - Unique identifier (usually IP + endpoint)
 * @param config - Rate limit configuration
 * @returns Object with limited status and retry info
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime < now) {
        // First request or window expired
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return { limited: false, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
        // Rate limited
        return {
            limited: true,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    // Increment counter
    entry.count++;
    return {
        limited: false,
        remaining: config.maxRequests - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(resetIn: number) {
    return new Response(
        JSON.stringify({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil(resetIn / 1000),
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(Math.ceil(resetIn / 1000)),
            },
        }
    );
}
