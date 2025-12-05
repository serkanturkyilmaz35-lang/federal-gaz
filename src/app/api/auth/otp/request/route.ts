import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // TODO: Save OTP to database and send via email
        // For now, just return success
        console.log(`OTP for ${email}: ${otp}`);

        return NextResponse.json({
            message: 'OTP sent successfully',
            // In production, don't return the OTP - send it via email
        });

    } catch (error) {
        console.error('OTP Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
