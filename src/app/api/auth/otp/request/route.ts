// Force rebuild
import { NextResponse } from 'next/server';
import { connectToDatabase, AdminUser, OTPToken } from '@/lib/models';
import { sendEmail, getOTPEmailTemplate } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Check if user exists and is an AdminUser (for Dashboard access)
        const user = await AdminUser.findOne({ where: { email, isActive: true } });

        if (!user) {
            return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı yetkili kullanıcı bulunamadı.' }, { status: 404 });
        }

        // 2. Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // 1 minute expiry
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        // 3. Save OTP to database
        await OTPToken.create({
            email,
            token: otp,
            expiresAt,
            isUsed: false
        });

        console.log(`Debug: OTP generated for ${email}: ${otp}`);

        // 4. Send OTP via Email - run in background (detached) for speed
        setTimeout(() => {
            sendEmail({
                to: email,
                subject: 'Federal Gaz - Yönetim Paneli Giriş Doğrulama Kodu',
                replyTo: 'no-reply@federalgaz.com',
                html: getOTPEmailTemplate(user.name, otp)
            }).catch((err: any) => console.error('Background email sending failed:', err));
        }, 0);

        return NextResponse.json({
            message: 'Doğrulama kodu e-posta adresinize gönderildi.',
        });

    } catch (error) {
        console.error('OTP Request Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' }, { status: 500 });
    }
}
