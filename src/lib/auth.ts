import jwt from 'jsonwebtoken';

// SECURITY: JWT_SECRET must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is not set. Authentication is disabled.');
}

export const signToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
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

        const token = cookies['auth-token'];
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
