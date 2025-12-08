import { NextResponse } from 'next/server';
import { Order, ContactRequest, connectToDatabase } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Pending Orders
        const pendingOrders = await Order.count({
            where: { status: 'PENDING' }
        });

        // 2. New Contact Requests
        const newContacts = await ContactRequest.count({
            where: { status: 'new' }
        });

        return NextResponse.json({
            success: true,
            total: pendingOrders + newContacts,
            details: {
                orders: pendingOrders,
                contacts: newContacts
            }
        });
    } catch (error) {
        console.error("Notification check failed:", error);
        return NextResponse.json({ success: false, error: "Check failed" }, { status: 500 });
    }
}
