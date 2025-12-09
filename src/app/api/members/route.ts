import { NextResponse } from 'next/server';
import { User, Address, Order, connectToDatabase } from '@/lib/models';

// GET: All Site Members (all users regardless of role) with addresses and orders
export async function GET() {
    try {
        await connectToDatabase();

        const users = await User.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Address,
                    as: 'addresses',
                    required: false
                },
                {
                    model: Order,
                    as: 'orders',
                    required: false,
                    limit: 5,
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Also get order count for each user
        const membersWithStats = await Promise.all(users.map(async (user: any) => {
            const orderCount = await Order.count({ where: { userId: user.id } });
            return {
                ...user.toJSON(),
                totalOrders: orderCount
            };
        }));

        return NextResponse.json({ success: true, members: membersWithStats });
    } catch (error) {
        console.error("Failed to fetch members:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch members" }, { status: 500 });
    }
}
