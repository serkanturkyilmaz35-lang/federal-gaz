import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { decryptRequest, encryptResponse } from '@/lib/server-secure';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        // Decrypt Request Body
        const { email, password } = await decryptRequest(req);

        if (!email || !password) {
            return NextResponse.json({ error: 'E-posta ve şifre gereklidir.' }, { status: 400 });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
        }

        // Validate password
        // Use the decrypted password directly as it was encrypted during transport
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return NextResponse.json({ error: 'Geçersiz e-posta veya şifre.' }, { status: 401 });
        }

        // Generate Token
        const token = signToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        const cookieStore = await cookies();
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
        });

        const { password_hash, ...userWithoutPassword } = user.toJSON();

        // Encrypt Response
        return await encryptResponse({
            success: true,
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: 'Giriş işlemi başarısız.' }, { status: 500 });
    }
}
