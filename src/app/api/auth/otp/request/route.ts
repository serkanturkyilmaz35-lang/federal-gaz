// OTP Request Route - Maximum performance optimized
import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { Op } from 'sequelize';

// Minimal OTP email - no external dependencies, tiny payload
function getMinimalOTPEmail(name: string, otp: string): string {
    return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px">
<div style="background:#fff;padding:20px;border-radius:8px;text-align:center">
<h2 style="color:#8B0000;margin-bottom:20px">Federal Gaz</h2>
<p>Merhaba <strong>${name}</strong>,</p>
<p>Doğrulama kodunuz:</p>
<div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#8B0000;background:#f5f5f5;padding:15px;border-radius:8px;margin:20px 0">${otp}</div>
<p style="color:#666;font-size:12px">Bu kod 2 dakika geçerlidir.</p>
<hr style="border:none;border-top:1px solid #eee;margin:20px 0">
<p style="color:#999;font-size:11px">Federal Gaz © 2014</p>
</div></body></html>`;
}

// Ultra-fast Brevo API call - no timeout to ensure delivery
async function sendOTPEmailFast(to: string, userName: string, otp: string): Promise<{ success: boolean; time: number }> {
    const startTime = Date.now();
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.error('[OTP-API] BREVO_API_KEY missing!');
        return { success: false, time: Date.now() - startTime };
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: { name: 'Federal Gaz', email: 'noreply@federalgaz.com' },
                to: [{ email: to }],
                subject: 'Doğrulama Kodu - Federal Gaz',
                htmlContent: getMinimalOTPEmail(userName, otp),
            }),
        });

        const elapsed = Date.now() - startTime;

        if (!response.ok) {
            const err = await response.text().catch(() => 'Unknown error');
            console.error(`[OTP-API] Error ${response.status} in ${elapsed}ms: ${err}`);
            return { success: false, time: elapsed };
        }

        console.log(`[OTP-API] Success in ${elapsed}ms`);
        return { success: true, time: elapsed };
    } catch (error: unknown) {
        const elapsed = Date.now() - startTime;
        const errorMsg = error instanceof Error ? error.message : 'Unknown';
        console.error(`[OTP-API] Error in ${elapsed}ms: ${errorMsg}`);
        return { success: false, time: elapsed };
    }
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
        console.log(`[OTP] Save: ${t3 - t2}ms, Total: ${t3 - t0}ms`);

        // Fire email in background (no await)
        sendOTPEmailFast(email, user.name, otp).then(r => {
            console.log(`[OTP] Email done: ${Date.now() - t0}ms total, API: ${r.time}ms, success: ${r.success}`);
        });

        console.log(`[OTP] Response: ${Date.now() - t0}ms`);
        return NextResponse.json({ message: 'Doğrulama kodu e-posta adresinize gönderildi.' });

    } catch (error) {
        console.error('[OTP] Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' }, { status: 500 });
    }
}


