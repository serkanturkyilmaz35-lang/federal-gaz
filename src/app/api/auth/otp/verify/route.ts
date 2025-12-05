import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        // TODO: Implement OTP verification with database
        // For now, return success for demo
        return NextResponse.json({
            message: 'Login successful',
            user: {
                email: email,
                role: 'user',
            },
        });

    } catch (error) {
        console.error('OTP Verify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
