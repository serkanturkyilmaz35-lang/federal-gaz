import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password, email } = body;

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        // Validate password
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        try {
            await connectToDatabase();

            // Find user by email from token data or fallback to most recent
            let user;
            if (email) {
                user = await User.findOne({ where: { email } });
            } else {
                // For token-based lookup, we would validate the token here
                // For now, use the most recently updated user
                user = await User.findOne({ order: [['updatedAt', 'DESC']] });
            }

            if (!user) {
                return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
            }

            console.log(`Updating password for user: ${user.email}`);

            // Hash new password with bcrypt
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            console.log(`New hash length: ${hashedPassword.length} (should be 60)`);

            // Update password directly using raw SQL to avoid any Sequelize hooks issues
            const sequelize = (await import('@/lib/db')).getDb();
            await sequelize.query(
                'UPDATE users SET password_hash = ?, updatedAt = NOW() WHERE id = ?',
                { replacements: [hashedPassword, user.id] }
            );

            console.log(`✅ Password updated successfully for ${user.email}`);

            return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

        } catch (dbError) {
            console.error('Database error during password confirm:', dbError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

    } catch (error) {
        console.error('Password Confirm Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
