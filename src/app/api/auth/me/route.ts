import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { User, connectToDatabase } from '@/lib/models';

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
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const { password_hash, ...userWithoutPassword } = user.toJSON();

        return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error('Session Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
