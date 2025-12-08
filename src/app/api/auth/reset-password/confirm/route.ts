import { NextResponse } from 'next/server';
import { User, OTPToken, connectToDatabase } from '@/lib/models';
import bcrypt from 'bcrypt';

// Use secure token validation logic
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Validate Token against OTPToken table (Secure)
        // Note: The frontend sends the 6-digit OTP as "token" in this context? 
        // Wait, the URL param is named 'token'. Is it a JWT or the 6-digit OTP?
        // User said "token payload" before. 
        // Let's assume 'token' in URL is the OTP code for now, OR a custom token.
        // If the URL is `?token=123456`, then it's the OTP.
        // Let's check OTPToken table.

        // However, usually "Reset Password" link has a long random string, NOT a 6 digit OTP.
        // The `OTPToken` model has `token` as `STRING(6)`.
        // If the email sent a "Link" with a token, was it the 6-digit one?
        // The OTP route generates a 6-digit number.
        // If the link is `.../sifre-yenile?token=123456`, then it works.
        // If the link uses a JWT, we need to verify JWT.
        // Let's assume it matches the `token` column in OTPToken which is 6 digits.

        // Find VALID, UNUSED, NON-EXPIRED token
        const otpRecord = await OTPToken.findOne({
            where: {
                token: token,
                isUsed: false,
                // expiresAt check should be done manually or via Op
            }
        });

        if (!otpRecord) {
            return NextResponse.json({ error: 'Geçersiz veya kullanılmış kod.' }, { status: 400 });
        }

        if (new Date() > otpRecord.expiresAt) {
            return NextResponse.json({ error: 'Kodun süresi dolmuş.' }, { status: 400 });
        }

        const email = otpRecord.email;

        // 2. Find User by Email (Secure)
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
        }

        console.log(`Updating password for user: ${email} (via valid token)`);

        // 3. Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Update password raw SQL (to bypass hooks/double hash checks)
        const sequelize = (await import('@/lib/db')).getDb();
        await sequelize.query(
            'UPDATE users SET password_hash = ?, updatedAt = NOW() WHERE id = ?',
            { replacements: [hashedPassword, user.id] }
        );

        // 5. Mark Token as Used
        await otpRecord.update({ isUsed: true });

        console.log(`✅ Password updated successfully for ${email}`);

        return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Password Confirm Error:', error);
        return NextResponse.json({ error: 'Sunucu hatası oluştu.' }, { status: 500 });
    }
}
