import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models'; // Import initialized models

export async function POST(request: Request) {
    try {
        await connectToDatabase(); // Ensure DB is connected

        const { name, email, password, phone } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const user = await User.create({
            name,
            email,
            password_hash: password, // Will be hashed by hook
            phone
        });

        // Don't return password hash
        const { password_hash, ...userWithoutPassword } = user.toJSON();

        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
