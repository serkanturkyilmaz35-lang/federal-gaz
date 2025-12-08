import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Op } from 'sequelize';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'E-posta ve OTP gereklidir.' }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Verify OTP
        const validToken = await OTPToken.findOne({
            where: {
                email,
                token: otp,
                isUsed: false,
            },
            order: [['createdAt', 'DESC']],
        });

        // 3. User Details - Check admin or editor role
        const user = await User.findOne({
            where: {
                email,
                role: { [Op.in]: ['admin', 'editor'] }
            }
        });

        if (!validToken) {
            return NextResponse.json({ error: 'Geçersiz veya kullanılmış kod.' }, { status: 400 });
        }

        // Check expiry
        if (new Date() > validToken.expiresAt) {
            return NextResponse.json({ error: 'Bu kodun süresi dolmuş.' }, { status: 400 });
        }

        // 2. Mark OTP as used (Create promise but don't blocking wait if we don't strict consistency? Better wait.)
        // We can optimize this: Update OTP in background? 
        // No, consistency is important. But we can await it AFTER checking user.
        await validToken.update({ isUsed: true });

        // 3. User Details
        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        // 4. Generate JWT
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const token = signToken(tokenPayload);

        // 5. Set Cookie
        // NO Max-Age/Expires = Session Cookie (expires on browser close)
        try {
            const cookieStore = await cookies();
            cookieStore.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            });
        } catch (cookieErr) {
            console.error('Cookie Set Error:', cookieErr);
            // Don't crash, just log. Client might still work if we rely on other things? 
            // Actually client needs cookie. But let's see if this is the cause.
            return NextResponse.json({ error: 'Çerez ayarlanamadı.' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Giriş başarılı',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
