import { NextResponse } from 'next/server';
import User from '@/models/User';
import Otp from '@/models/Otp';
import sequelize from '@/lib/db';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

// Ensure DB is synced (in production, use migrations)
// sequelize.sync(); 

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if user exists, if not create one (or handle as registration)
        // For this requirement, we assume user might be created on the fly or must exist.
        // Let's find or create to allow new users to sign up via OTP.
        const [user] = await User.findOrCreate({
            where: { email },
            defaults: { email, role: 'user' }
        });

        // Generate OTP
        const otpCode = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP
        await Otp.create({
            email,
            otp_code: otpCode,
            expires_at: expiresAt,
        });

        // Send Email
        // Configure transporter (mock for now if no env vars)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'user',
                pass: process.env.SMTP_PASS || 'pass',
            },
        });

        if (process.env.SMTP_HOST) {
            await transporter.sendMail({
                from: '"Federal Gaz" <no-reply@federalgaz.com>',
                to: email,
                subject: 'Your Login OTP',
                text: `Your OTP code is ${otpCode}. It expires in 10 minutes.`,
                html: `<p>Your OTP code is <b>${otpCode}</b>. It expires in 10 minutes.</p>`,
            });
        } else {
            console.log(`[DEV] OTP for ${email}: ${otpCode}`);
        }

        return NextResponse.json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('OTP Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
