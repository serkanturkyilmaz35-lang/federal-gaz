import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { AdminUser, connectToDatabase } from '@/lib/models'; // Import AdminUser

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const decoded = verifyToken(token) as { id: number };

        if (!decoded || !decoded.id) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        await connectToDatabase();

        let user = null;

        // Check for role to distinguish User vs AdminUser
        // @ts-ignore
        if (decoded.role === 'user') {
            // Customer
            const { User } = await import('@/lib/models');
            user = await User.findByPk(decoded.id);
        } else {
            // Admin (Dashboard) or Legacy without role
            const { AdminUser } = await import('@/lib/models');
            user = await AdminUser.findByPk(decoded.id);
        }

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        // Return user data (AdminUser typically has no password field, but we return toJSON)
        return NextResponse.json({ user: user.toJSON() }, { status: 200 });

    } catch (error) {
        console.error('Session Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
