// OTP Request Route - Brevo SMTP optimized
import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { sendEmail } from '@/lib/email';
import { Op } from 'sequelize';

// Minimal OTP email for speed (smaller payload = faster)
const getMinimalOTPHtml = (name: string, otp: string) => `
<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;text-align:center">
<h2 style="color:#8B0000">Federal Gaz</h2>
<p>Merhaba <strong>${name}</strong>,</p>
<p>Doğrulama kodunuz:</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#8B0000;background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0">${otp}</div>
<p style="color:#666;font-size:12px">Bu kod 2 dakika geçerlidir.</p>
</div>`;

export async function POST(request: Request) {
    const t0 = Date.now();

    try {
        const { email } = await request.json();
        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 });
        }

        // DB connection
        await connectToDatabase();
        console.log(`[OTP] DB: ${Date.now() - t0}ms`);

        // Find user
        const user = await User.findOne({
            where: { email, role: { [Op.in]: ['admin', 'editor'] } },
            attributes: ['id', 'name', 'email']
        });
        console.log(`[OTP] Query: ${Date.now() - t0}ms`);

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
        console.log(`[OTP] Save: ${Date.now() - t0}ms`);

        // Send email via SMTP in background
        sendEmail({
            to: email,
            subject: 'Doğrulama Kodu - Federal Gaz',
            html: getMinimalOTPHtml(user.name, otp),
        }).then(result => {
            console.log(`[OTP] Email: ${Date.now() - t0}ms, success: ${result.success}`);
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



