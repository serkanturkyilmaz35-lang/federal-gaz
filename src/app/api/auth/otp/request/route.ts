// OTP Request Route - Ultra-fast with direct Brevo API
import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { getOTPEmailTemplate } from '@/lib/email';
import { Op } from 'sequelize';

// Direct Brevo HTTP API call - fastest possible email sending
async function sendOTPEmailDirect(to: string, userName: string, otp: string): Promise<{ success: boolean; time: number }> {
    const startTime = Date.now();
    const apiKey = process.env.BREVO_API_KEY;

    console.log(`[OTP-EMAIL] Starting direct API call, API key present: ${!!apiKey}`);

    if (!apiKey) {
        console.error('[OTP-EMAIL] BREVO_API_KEY is missing!');
        return { success: false, time: Date.now() - startTime };
    }

    const html = getOTPEmailTemplate(userName, otp);
    // Replace logo placeholder
    const finalHtml = html.replace(/cid:logo/g, 'https://www.federalgaz.com/logo-clean.png');

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
                subject: 'Federal Gaz - Yönetim Paneli Giriş Doğrulama Kodu',
                htmlContent: finalHtml,
            }),
        });

        const elapsed = Date.now() - startTime;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[OTP-EMAIL] API error in ${elapsed}ms:`, response.status, errorData);
            return { success: false, time: elapsed };
        }

        const data = await response.json();
        console.log(`[OTP-EMAIL] Success in ${elapsed}ms, messageId: ${data.messageId}`);
        return { success: true, time: elapsed };
    } catch (error) {
        const elapsed = Date.now() - startTime;
        console.error(`[OTP-EMAIL] Fetch error in ${elapsed}ms:`, error);
        return { success: false, time: elapsed };
    }
}

export async function POST(request: Request) {
    const startTime = Date.now();

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'E-posta adresi gereklidir' }, { status: 400 });
        }

        // Connect to DB
        await connectToDatabase();
        console.log(`[OTP] DB connected in ${Date.now() - startTime}ms`);

        // Check if user exists and has admin or editor role
        const user = await User.findOne({
            where: {
                email,
                role: { [Op.in]: ['admin', 'editor'] }
            },
            attributes: ['id', 'name', 'email']
        });
        console.log(`[OTP] User query in ${Date.now() - startTime}ms`);

        if (!user) {
            return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı yetkili kullanıcı bulunamadı.' }, { status: 404 });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        // Save OTP to database
        await OTPToken.create({
            email,
            token: otp,
            expiresAt,
            isUsed: false
        });
        console.log(`[OTP] OTP saved in ${Date.now() - startTime}ms`);

        // Send email directly via Brevo API (fire and forget)
        // Don't await - return response immediately for speed
        sendOTPEmailDirect(email, user.name, otp).then(result => {
            console.log(`[OTP] Email completed in ${Date.now() - startTime}ms total, API time: ${result.time}ms`);
        }).catch(err => {
            console.error('[OTP] Email background error:', err);
        });

        console.log(`[OTP] Response at ${Date.now() - startTime}ms (email in background)`);

        return NextResponse.json({
            message: 'Doğrulama kodu e-posta adresinize gönderildi.',
        });

    } catch (error) {
        console.error('OTP Request Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' }, { status: 500 });
    }
}

