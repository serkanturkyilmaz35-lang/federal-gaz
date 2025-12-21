import jwt from 'jsonwebtoken';

// SECURITY: JWT_SECRET must be set in environment variables
// Build-time friendly: Don't throw during module evaluation
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.warn('WARNING: JWT_SECRET environment variable is not set.');
        return 'build-time-placeholder-secret';
    }
    return secret;
};

export const signToken = (payload: object) => {
    const secret = getJwtSecret();
    if (secret === 'build-time-placeholder-secret') {
        throw new Error('CRITICAL: JWT_SECRET environment variable is not set. Cannot sign tokens.');
    }
    return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    try {
        const secret = getJwtSecret();
        if (secret === 'build-time-placeholder-secret') {
            return null;
        }
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

// Helper function to verify authentication from request
export const verifyAuth = async (request: Request): Promise<{ authenticated: boolean; user?: any }> => {
    try {
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return { authenticated: false };
        }

        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        const token = cookies['auth_token'];
        if (!token) {
            return { authenticated: false };
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return { authenticated: false };
        }

        return { authenticated: true, user: decoded };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { authenticated: false };
    }
};
