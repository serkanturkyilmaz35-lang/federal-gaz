import { NextResponse } from 'next/server';
import { User, OTPToken, connectToDatabase } from '@/lib/models';
import { sendEmail, getPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
    try {
        const { email, language = 'TR' } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Try to connect to database
        try {
            await connectToDatabase();

            // Check if user exists
            const user = await User.findOne({ where: { email } });

            if (user) {
                // Generate 6-digit reset token (compatible with OTPToken table)
                const token = Math.floor(100000 + Math.random() * 900000).toString();
                const expires = new Date(Date.now() + 3600000); // 1 hour

                // Store token in Database
                await OTPToken.create({
                    email,
                    token,
                    expiresAt: expires,
                    isUsed: false
                });

                // Create reset link
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const resetLink = `${baseUrl}/sifre-yenile?token=${token}`;

                // Send email with language
                const emailResult = await sendEmail({
                    to: email,
                    subject: language === 'EN' ? 'Password Reset - Federal Gaz' : 'Şifre Sıfırlama - Federal Gaz',
                    html: getPasswordResetEmail(resetLink, language as 'TR' | 'EN'),
                });

                if (!emailResult.success) {
                    console.error('Failed to send reset email:', emailResult.error);
                }
            }
        } catch (dbError) {
            console.error('Database error during password reset:', dbError);
            // Continue to return success message to prevent enumeration
        }

        // Always return success to prevent email enumeration attacks
        return NextResponse.json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        }, { status: 200 });

    } catch (error) {
        console.error('Password Reset Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
