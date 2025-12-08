import { NextResponse } from "next/server";
import { connectToDatabase, Order, ContactRequest, User } from "@/lib/models";
import { Op } from "sequelize";

export async function GET() {
    try {
        await connectToDatabase();

        // 1. Fetch ALL Recent Orders (for History)
        const recentOrders = await Order.findAll({
            // Removed status filter to allow history
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        // 2. Fetch ALL Recent Contact Requests
        const recentContacts = await ContactRequest.findAll({
            // Removed status filter
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        const notifications = [
            ...recentOrders.map(o => ({
                id: `order-${o.id}`,
                type: 'order',
                title: o.status === 'PENDING' ? 'Yeni Sipariş' : `Sipariş: ${o.status}`,
                message: `#${o.id} numaralı sipariş. Durum: ${o.status}`,
                time: o.createdAt,
                read: false, // Default to false, frontend will handle read status via localStorage
                link: `/dashboard/orders/${o.id}`
            })),
            ...recentContacts.map(c => ({
                id: `contact-${c.id}`,
                type: 'contact',
                title: c.status === 'new' ? 'Yeni Mesaj' : 'Mesaj (Yanıtlandı)',
                message: `${c.name} - ${c.message.substring(0, 30)}...`,
                time: c.createdAt,
                read: false,
                link: `/dashboard/contacts/${c.id}`
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error("Notifications fetch failed:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
}
