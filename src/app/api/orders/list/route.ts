import { NextResponse } from 'next/server';
import { Order, connectToDatabase } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token) as { id: number };
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const orders = await Order.findAll({
            where: { userId: decoded.id },
            order: [['createdAt', 'DESC']]
        });

        // Parse 'details' if it's JSON
        const parsedOrders = orders.map(order => {
            let detailsObj = {};
            try {
                detailsObj = JSON.parse(order.details);
            } catch (e) {
                detailsObj = { raw: order.details };
            }

            return {
                id: order.id,
                status: order.status,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
                details: detailsObj
            };
        });

        return NextResponse.json({ orders: parsedOrders });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
