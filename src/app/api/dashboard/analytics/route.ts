import { NextResponse } from 'next/server';
import { connectToDatabase, Order, User, ContactRequest } from '@/lib/models';
import { Op, Sequelize } from 'sequelize';

export async function GET() {
    try {
        await connectToDatabase();

        // Get real counts from database
        const totalOrders = await Order.count();

        // Today's orders - use raw query approach
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = await Order.count({
            where: Sequelize.where(
                Sequelize.fn('DATE', Sequelize.col('createdAt')),
                Sequelize.fn('DATE', today)
            )
        } as any);

        const pendingOrders = await Order.count({ where: { status: 'PENDING' } });

        const totalUsers = await User.count();
        const totalContacts = await ContactRequest.count();
        const newContacts = await ContactRequest.count({ where: { status: 'new' } });

        // Simulate real-time active users (random variation for demo)
        const baseActiveUsers = Math.floor(Math.random() * 50) + 30;
        const mobileRatio = 0.6 + (Math.random() * 0.1);

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                todayOrders,
                pendingOrders,
                totalUsers,
                totalContacts,
                newContacts,
            },
            realTime: {
                activeUsers: baseActiveUsers,
                mobileUsers: Math.round(baseActiveUsers * mobileRatio),
                desktopUsers: Math.round(baseActiveUsers * (1 - mobileRatio)),
            },
            // Mock active pages with slight randomization for "live" effect
            activePages: [
                { url: "/urunler/endustriyel-gazlar/oksijen", users: Math.floor(Math.random() * 10) + 12, percentage: 20.6 },
                { url: "/anasayfa", users: Math.floor(Math.random() * 8) + 10, percentage: 17.2 },
                { url: "/siparis", users: Math.floor(Math.random() * 6) + 8, percentage: 12.6 },
                { url: "/iletisim", users: Math.floor(Math.random() * 5) + 6, percentage: 10.3 },
                { url: "/hakkimizda", users: Math.floor(Math.random() * 4) + 5, percentage: 8.0 },
            ],
            topPages: [
                { name: "/anasayfa", views: 4290 + Math.floor(Math.random() * 100), unique: 3985, bounceRate: "45%" },
                { name: "/urunler", views: 2150 + Math.floor(Math.random() * 50), unique: 1820, bounceRate: "32%" },
                { name: "/hakkimizda", views: 1890 + Math.floor(Math.random() * 30), unique: 1600, bounceRate: "60%" },
                { name: "/iletisim", views: 980 + Math.floor(Math.random() * 20), unique: 850, bounceRate: "25%" },
            ]
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ success: false, error: 'Analytics fetch failed' }, { status: 500 });
    }
}

