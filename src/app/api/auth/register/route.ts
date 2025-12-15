import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { decryptRequest, encryptResponse } from '@/lib/server-secure';
import { verifyRecaptcha } from '@/lib/recaptcha';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        // Decrypt Request Body
        const { name, email, phone, password, recaptchaToken } = await decryptRequest(req);

        // Verify reCAPTCHA
        const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'register');
        if (!recaptchaResult.success) {
            console.warn('reCAPTCHA failed for register:', recaptchaResult.error);
            return NextResponse.json({
                error: 'Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.'
            }, { status: 400 });
        }

        // Validate
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Tüm alanlar zorunludur.' }, { status: 400 });
        }

        // Check existing user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 400 });
        }

        // Create User
        // Provide the decrypted plain password; the User model hook will hash it
        const user = await User.create({
            name,
            email,
            phone,
            password_hash: password, // Will be hashed by beforeCreate hook
            role: 'user'
        });

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
        }, 201);

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: 'Kayıt işlemi başarısız.' }, { status: 500 });
    }
}
