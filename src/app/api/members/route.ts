import { NextResponse } from 'next/server';
import { User, Address, connectToDatabase } from '@/lib/models';

// GET: All Site Members (all users regardless of role)
export async function GET() {
    try {
        await connectToDatabase();

        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: Address,
                as: 'addresses',
                required: false
            }],
            order: [['createdAt', 'DESC']]
        });

        return NextResponse.json({ success: true, members: users });
    } catch (error) {
        console.error("Failed to fetch members:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 });
    }
}
