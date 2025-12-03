import { NextResponse } from 'next/server';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { Op } from 'sequelize';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // Find valid OTP
        const validOtp = await Otp.findOne({
            where: {
                email,
                otp_code: otp,
                is_used: false,
                expires_at: {
                    [Op.gt]: new Date(),
                },
            },
            order: [['created_at', 'DESC']],
        });

        if (!validOtp) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
        }

        // Mark OTP as used
        await validOtp.update({ is_used: true });

        // Get User
        const user = await User.findOne({ where: { email } });

        // Here you would typically set a session cookie or return a JWT
        // For simplicity, we'll return user info and a success message
        // In a real app, use a library like `jose` or `jsonwebtoken` to sign a token.

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user?.dataValues.id,
                email: user?.dataValues.email,
                role: user?.dataValues.role,
            },
        });

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
