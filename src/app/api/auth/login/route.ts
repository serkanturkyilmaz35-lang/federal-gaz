import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Timeout wrapper function
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), ms)
    );
    return Promise.race([promise, timeout]);
};

export async function POST(request: Request) {
    const { email, password } = await request.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    try {
        // Wrap entire database operation in timeout
        const result = await withTimeout(
            (async () => {
                await connectToDatabase();

                const user = await User.findOne({ where: { email } });

                if (!user) {
                    return { status: 404, error: 'User not found' };
                }

                const isPasswordValid = await user.comparePassword(password);
                if (!isPasswordValid) {
                    return { status: 401, error: 'Invalid credentials' };
                }

                return { status: 200, user };
            })(),
            5000 // 5 second timeout for entire operation
        );

        if (result.status === 404) {
            return NextResponse.json({ error: result.error }, { status: 404 });
        }

        if (result.status === 401) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        // Success - set cookie and return user
        const token = signToken({ id: result.user!.id, email: result.user!.email, name: result.user!.name });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        const { password_hash, ...userWithoutPassword } = result.user!.toJSON();
        return NextResponse.json({ user: userWithoutPassword }, { status: 200 });

    } catch (error) {
        console.error('Login Error:', error);
        if (error instanceof Error && error.message === 'Database timeout') {
            return NextResponse.json({ error: 'Database timeout' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
