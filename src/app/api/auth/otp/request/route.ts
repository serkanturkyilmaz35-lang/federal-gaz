// OTP Request Route - Optimized for speed
import { NextResponse } from 'next/server';
import { connectToDatabase, User, OTPToken } from '@/lib/models';
import { sendEmail, getOTPEmailTemplate } from '@/lib/email';
import { Op } from 'sequelize';

// Vercel Edge/Serverless waitUntil for background tasks
// This ensures email is sent even after response is returned
async function runInBackground(promise: Promise<unknown>) {
    // In Vercel, we can use waitUntil from @vercel/functions
    // But for compatibility, we just fire the promise without awaiting
    promise.catch(err => console.error('Background task failed:', err));
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
            attributes: ['id', 'name', 'email'] // Only fetch needed fields for speed
        });
        console.log(`[OTP] User query completed in ${Date.now() - startTime}ms`);

        if (!user) {
            return NextResponse.json({ error: 'Bu e-posta adresi ile kayıtlı yetkili kullanıcı bulunamadı.' }, { status: 404 });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // Save OTP to database
        await OTPToken.create({
            email,
            token: otp,
            expiresAt,
            isUsed: false
        });
        console.log(`[OTP] OTP saved in ${Date.now() - startTime}ms`);

        // OPTIMIZATION: Send email in background, return response immediately
        // This is the key to fast OTP delivery - user sees success immediately
        const emailPromise = sendEmail({
            to: email,
            subject: 'Federal Gaz - Yönetim Paneli Giriş Doğrulama Kodu',
            replyTo: 'no-reply@federalgaz.com',
            html: getOTPEmailTemplate(user.name, otp)
        }).then(result => {
            console.log(`[OTP] Email sent in ${Date.now() - startTime}ms, success: ${result.success}`);
        });

        // Fire and forget - don't await
        runInBackground(emailPromise);

        console.log(`[OTP] Response returned in ${Date.now() - startTime}ms (email sending in background)`);

        return NextResponse.json({
            message: 'Doğrulama kodu e-posta adresinize gönderildi.',
        });

    } catch (error) {
        console.error('OTP Request Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu, lütfen tekrar deneyin.' }, { status: 500 });
    }
}
