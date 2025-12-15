import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import crypto from 'crypto';

// POST: Add a single member
export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { name, email, phone, sendWelcomeEmail } = await req.json();

        // Validation
        if (!name || !email) {
            return NextResponse.json({
                success: false,
                error: 'Ad ve e-posta adresi zorunludur.'
            }, { status: 400 });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                error: 'Geçersiz e-posta adresi formatı.'
            }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: 'Bu e-posta adresi zaten kayıtlı.'
            }, { status: 409 });
        }

        // Generate a random secure password (will be hashed by hook)
        // User will set their own password via password reset flow
        const randomPassword = crypto.randomBytes(32).toString('hex');

        // Create new member with role: 'user'
        const newMember = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password_hash: randomPassword, // Hook will hash this
            phone: phone?.trim() || null,
            role: 'user'
        });

        // Optionally send welcome email with password reset link
        if (sendWelcomeEmail) {
            try {
                // Trigger password reset flow to send welcome email
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

                await fetch(`${baseUrl}/api/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.toLowerCase(), language: 'TR' })
                });
            } catch (emailError) {
                console.error('Welcome email failed:', emailError);
                // Don't fail the whole request if email fails
            }
        }

        // Return success without password hash
        const { password_hash, ...memberData } = newMember.toJSON();

        return NextResponse.json({
            success: true,
            member: memberData,
            message: sendWelcomeEmail
                ? 'Üye başarıyla eklendi ve hoş geldiniz e-postası gönderildi.'
                : 'Üye başarıyla eklendi.'
        });

    } catch (error) {
        console.error('Add member failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Üye eklenirken bir hata oluştu.'
        }, { status: 500 });
    }
}
