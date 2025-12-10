// OTP Request Route - Ultra-fast with Resend API
import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { sendEmail, getOTPEmailTemplate } from '@/lib/email';
import { Op } from 'sequelize';
import { Resend } from 'resend';

// Minimal OTP email for speed
const getMinimalOTPHtml = (name: string, otp: string) => `
<div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;text-align:center">
<h2 style="color:#8B0000">Federal Gaz</h2>
<p>Merhaba <strong>${name}</strong>,</p>
<p>Doğrulama kodunuz:</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#8B0000;background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0">${otp}</div>
<p style="color:#666;font-size:12px">Bu kod 2 dakika geçerlidir.</p>
</div>`;

// Send email via Resend (fastest) or fallback to Brevo SMTP
async function sendOTPEmail(to: string, name: string, otp: string, t0: number) {
    const resendKey = process.env.RESEND_API_KEY;

    // Try Resend first (much faster ~100-300ms)
    if (resendKey) {
        try {
            const resend = new Resend(resendKey);
            const result = await resend.emails.send({
                from: 'Federal Gaz <noreply@federalgaz.com>',
                to: [to],
                subject: 'Doğrulama Kodu - Federal Gaz',
                html: getMinimalOTPHtml(name, otp),
            });
            console.log(`[OTP] Resend done: ${Date.now() - t0}ms, id: ${result.data?.id}`);
            return { success: true };
        } catch (error) {
            console.error('[OTP] Resend failed:', error);
        }
    }

    // Fallback to Brevo SMTP
    const result = await sendEmail({
        to,
        subject: 'Federal Gaz - Yönetim Paneli Giriş Doğrulama Kodu',
        html: getOTPEmailTemplate(name, otp),
    });
    console.log(`[OTP] SMTP done: ${Date.now() - t0}ms, success: ${result.success}`);
    return result;
}

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

        // Send email in background (don't await)
        sendOTPEmail(email, user.name, otp, t0).catch(err => {
            console.error('[OTP] Email error:', err);
        });

        console.log(`[OTP] Response: ${Date.now() - t0}ms`);
        return NextResponse.json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });

    } catch (error) {
        console.error('[OTP] Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' }, { status: 500 });
    }
}



