import { NextResponse } from "next/server";

export async function GET() {
    try {
        // TODO: Replace with actual database query
        // const orderCount = await Order.count({ where: { status: 'PENDING' } });
        // const contactCount = await ContactRequest.count({ where: { status: 'unread' } });

        // Mock data - return unread notifications count
        const mockUnreadCount = 2; // 2 unread notifications

        return NextResponse.json({
            count: mockUnreadCount,
        });
    } catch (error) {
        console.error("Notification count error:", error);
        return NextResponse.json({ count: 0 });
    }
}
