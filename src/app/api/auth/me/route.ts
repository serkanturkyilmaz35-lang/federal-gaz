import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { User, connectToDatabase } from '@/lib/models';
import { Op } from 'sequelize';

interface DecodedToken {
    id: number;
    role: string;
    sessionToken?: string;
}

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const decoded = verifyToken(token) as DecodedToken | null;

        if (!decoded || !decoded.id) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        await connectToDatabase();

        // Find user in User table
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        // Session token validation: if token has sessionToken, check it matches DB
        if (decoded.sessionToken && user.sessionToken !== decoded.sessionToken) {
            // Session invalidated - another device logged in
            return NextResponse.json({
                user: null,
                sessionExpired: true,
                message: 'Oturumunuz başka bir cihazda sonlandırıldı.'
            }, { status: 401 });
        }

        // Return user data without password
        const { password_hash, ...safeUser } = user.toJSON();
        return NextResponse.json({ user: safeUser }, { status: 200 });

    } catch (error) {
        console.error('Session Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

