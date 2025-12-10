// OTP Request Route - Uses SMTP for reliable delivery
import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { sendEmail, getOTPEmailTemplate } from '@/lib/email';
import { Op } from 'sequelize';

export async function POST(request: Request) {
    const t0 = Date.now();

    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 });
        }

        // DB connection
        await connectToDatabase();
        const t1 = Date.now();
        console.log(`[OTP] DB: ${t1 - t0}ms`);

        // Find user
        const user = await User.findOne({
            where: { email, role: { [Op.in]: ['admin', 'editor'] } },
            attributes: ['id', 'name', 'email']
        });
        const t2 = Date.now();
        console.log(`[OTP] Query: ${t2 - t1}ms`);

        if (!user) {
            return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı yetkili kullanıcı bulunamadı.' }, { status: 404 });
        }

        // Generate and save OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await OTPToken.create({
            email,
            token: otp,
            expiresAt: new Date(Date.now() + 2 * 60 * 1000),
            isUsed: false
        });
        const t3 = Date.now();
        console.log(`[OTP] Save: ${t3 - t2}ms, Total DB: ${t3 - t0}ms`);

        // Send email via SMTP (background, no await for fast response)
        sendEmail({
            to: email,
            subject: 'Federal Gaz - Yönetim Paneli Giriş Doğrulama Kodu',
            html: getOTPEmailTemplate(user.name, otp),
        }).then(result => {
            console.log(`[OTP] Email done: ${Date.now() - t0}ms, success: ${result.success}`);
        }).catch(err => {
            console.error('[OTP] Email error:', err);
        });

        console.log(`[OTP] Response: ${Date.now() - t0}ms`);
        return NextResponse.json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });

    } catch (error) {
        console.error('[OTP] Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' }, { status: 500 });
    }
}


