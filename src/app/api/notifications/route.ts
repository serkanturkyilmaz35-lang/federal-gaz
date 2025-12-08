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
            // No token = not logged in, return empty notifications (not error)
            return NextResponse.json({ success: true, notifications: [] });
        }

        const payload = verifyToken(token) as { id: number; email: string; role: string; name: string; sessionToken?: string } | null;
        if (!payload || !payload.id) {
            return NextResponse.json({ success: true, notifications: [] });
        }

        await connectToDatabase();

        const user = await User.findByPk(payload.id);
        if (!user) {
            return NextResponse.json({ success: true, notifications: [] });
        }

        // Session validation ONLY if BOTH have sessionToken
        // If user logged in before sessionToken feature, they won't have it in JWT
        if (payload.sessionToken && user.sessionToken && payload.sessionToken !== user.sessionToken) {
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

        // Get user's notification states from DB (read and deleted)
        const userNotificationStates = await NotificationRead.findAll({
            where: { userId: payload.id }
        });

        // Create maps for quick lookup
        const readMap = new Map<string, boolean>();
        const deletedMap = new Map<string, boolean>();
        userNotificationStates.forEach(n => {
            readMap.set(n.notificationId, true);
            if (n.deletedAt) {
                deletedMap.set(n.notificationId, true);
            }
        });

        const allNotifications = [
            ...recentOrders.map(o => ({
                id: `order-${o.id}`,
                type: 'order',
                title: o.status === 'PENDING' ? 'Yeni Sipariş' : `Sipariş: ${o.status}`,
                message: `#${o.id} numaralı sipariş. Durum: ${o.status}`,
                time: o.createdAt,
                read: readMap.has(`order-${o.id}`),
                link: `/dashboard/orders/${o.id}`
            })),
            ...recentContacts.map(c => ({
                id: `contact-${c.id}`,
                type: 'contact',
                title: c.status === 'new' ? 'Yeni Mesaj' : 'Mesaj (Yanıtlandı)',
                message: `${c.name} - ${c.message.substring(0, 30)}...`,
                time: c.createdAt,
                read: readMap.has(`contact-${c.id}`),
                link: `/dashboard/contacts/${c.id}`
            }))
        ];

        // Filter out deleted notifications for this user
        const notifications = allNotifications
            .filter(n => !deletedMap.has(n.id))
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error("Notifications fetch failed:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
}
