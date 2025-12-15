import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import crypto from 'crypto';

// POST: Add a single member
export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const { name, email, phone } = await req.json();

        // Validation - all fields required
        if (!name || !email || !phone) {
            return NextResponse.json({
                success: false,
                error: 'Tüm alanlar zorunludur (Ad, E-posta, Telefon).'
            }, { status: 400 });
        }

        // Email format validation (must have @ and domain with .)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({
                success: false,
                error: 'Geçerli bir e-posta adresi girin (örn: ad@domain.com)'
            }, { status: 400 });
        }

        // Phone validation (Turkish format)
        const phoneClean = phone.replace(/\s/g, '');
        const phoneRegex = /^(\+90|0)?5[0-9]{9}$/;
        if (!phoneRegex.test(phoneClean)) {
            return NextResponse.json({
                success: false,
                error: 'Geçerli bir telefon numarası girin (05XX XXX XX XX)'
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
            phone: phone.trim(),
            role: 'user'
        });

        // Return success without password hash
        const { password_hash, ...memberData } = newMember.toJSON();

        return NextResponse.json({
            success: true,
            member: memberData,
            message: 'Üye başarıyla eklendi.'
        });

    } catch (error) {
        console.error('Add member failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Üye eklenirken bir hata oluştu.'
        }, { status: 500 });
    }
}
