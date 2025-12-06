import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import { sendEmail, getPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// In-memory store for reset tokens (in production, use database)
const resetTokens = new Map<string, { email: string; expires: Date }>();

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Try to connect to database
        try {
            await connectToDatabase();

            // Check if user exists
            const user = await User.findOne({ where: { email } });

            if (user) {
                // Generate reset token
                const token = crypto.randomBytes(32).toString('hex');
                const expires = new Date(Date.now() + 3600000); // 1 hour

                // Store token
                resetTokens.set(token, { email, expires });

                // Create reset link
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const resetLink = `${baseUrl}/sifre-yenile?token=${token}`;

                // Send email
                const emailResult = await sendEmail({
                    to: email,
                    subject: 'Şifre Sıfırlama - Federal Gaz',
                    html: getPasswordResetEmail(resetLink),
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

// Export for use in password reset confirmation
export function getResetToken(token: string) {
    const data = resetTokens.get(token);
    if (data && data.expires > new Date()) {
        return data;
    }
    return null;
}

export function deleteResetToken(token: string) {
    resetTokens.delete(token);
}
