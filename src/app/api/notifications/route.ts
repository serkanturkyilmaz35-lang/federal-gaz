import { NextResponse } from "next/server";
import { connectToDatabase, Order, ContactRequest, User, NotificationRead } from "@/lib/models";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { Op } from "sequelize";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Oturum bulunamadı' }, { status: 401 });
        }

        const payload = verifyToken(token) as { id: number; email: string; role: string; name: string; sessionToken?: string } | null;
        if (!payload || !payload.id) {
            return NextResponse.json({ success: false, error: 'Geçersiz token' }, { status: 401 });
        }

        await connectToDatabase();

        // Session validation - check if session token matches
        const user = await User.findByPk(payload.id);
        if (!user || (payload.sessionToken && user.sessionToken !== payload.sessionToken)) {
            return NextResponse.json({
                success: false,
                error: 'Oturumunuz başka bir cihazda sonlandırıldı.',
                sessionExpired: true
            }, { status: 401 });
        }

        // Fetch recent orders
        const recentOrders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        // Fetch recent contact requests
        const recentContacts = await ContactRequest.findAll({
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        // Get user's read notifications from DB
        const readNotifications = await NotificationRead.findAll({
            where: { userId: payload.id }
        });
        const readIds = readNotifications.map(n => n.notificationId);

        const notifications = [
            ...recentOrders.map(o => ({
                id: `order-${o.id}`,
                type: 'order',
                title: o.status === 'PENDING' ? 'Yeni Sipariş' : `Sipariş: ${o.status}`,
                message: `#${o.id} numaralı sipariş. Durum: ${o.status}`,
                time: o.createdAt,
                read: readIds.includes(`order-${o.id}`),
                link: `/dashboard/orders/${o.id}`
            })),
            ...recentContacts.map(c => ({
                id: `contact-${c.id}`,
                type: 'contact',
                title: c.status === 'new' ? 'Yeni Mesaj' : 'Mesaj (Yanıtlandı)',
                message: `${c.name} - ${c.message.substring(0, 30)}...`,
                time: c.createdAt,
                read: readIds.includes(`contact-${c.id}`),
                link: `/dashboard/contacts/${c.id}`
            }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error("Notifications fetch failed:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
}
