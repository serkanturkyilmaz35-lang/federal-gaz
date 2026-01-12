import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Op } from 'sequelize';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        let { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'E-posta ve OTP gereklidir.' }, { status: 400 });
        }

        email = email.trim().toLowerCase();

        // 1. Verify OTP and get User in PARALLEL for speed
        await connectToDatabase();

        const [validToken, user] = await Promise.all([
            OTPToken.findOne({
                where: {
                    email,
                    token: otp,
                    isUsed: false,
                },
                order: [['createdAt', 'DESC']],
            }),
            User.findOne({
                where: {
                    email,
                    role: { [Op.in]: ['admin', 'editor'] }
                }
            })
        ]);

        if (!validToken) {
            return NextResponse.json({ error: 'Geçersiz veya kullanılmış kod.' }, { status: 400 });
        }

        // Check expiry
        if (new Date() > validToken.expiresAt) {
            return NextResponse.json({ error: 'Bu kodun süresi dolmuş.' }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        // 3. Mark OTP as used and generate session token in PARALLEL
        const sessionToken = crypto.randomUUID();

        // Fire and forget updates to speed up response? No, we need consistency.
        // But we can execute them efficiently.
        const updatePromises = [
            validToken.update({ isUsed: true }),
            user.update({ sessionToken })
        ];

        await Promise.all(updatePromises);


        // 6. Generate JWT with session token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            sessionToken, // Include for session validation
        };
        const token = signToken(tokenPayload);

        // 7. Set Cookie
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
