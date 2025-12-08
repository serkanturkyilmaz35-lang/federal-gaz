import { NextResponse } from 'next/server';
import { connectToDatabase, Order, User, ContactRequest } from '@/lib/models';
import { Op, Sequelize } from 'sequelize';

export async function GET() {
    try {
        await connectToDatabase();

        // Get real counts from database
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'PENDING' } });

        const totalUsers = await User.count();
        const totalContacts = await ContactRequest.count();
        const newContacts = await ContactRequest.count({ where: { status: 'new' } });

        // Simulated real-time (more stable, realistic numbers based on DB data)
        // Base: contacts represent some site activity
        const baseActiveUsers = Math.max(20, totalContacts + pendingOrders * 2);
        // Small variation (±3) for "live" feel without being chaotic
        const activeVariation = Math.floor(Math.random() * 6) - 3;
        const activeUsers = baseActiveUsers + activeVariation;

        const mobileRatio = 0.65; // Stable mobile ratio

        return NextResponse.json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                totalUsers,
                totalContacts,
                newContacts,
            },
            realTime: {
                activeUsers: Math.max(5, activeUsers),
                mobileUsers: Math.round(Math.max(5, activeUsers) * mobileRatio),
                desktopUsers: Math.round(Math.max(5, activeUsers) * (1 - mobileRatio)),
            },
            // More stable active pages (smaller variations)
            activePages: [
                { url: "/urunler/endustriyel-gazlar/oksijen", users: 12 + Math.floor(Math.random() * 3), percentage: 22 },
                { url: "/anasayfa", users: 10 + Math.floor(Math.random() * 3), percentage: 18 },
                { url: "/siparis", users: 8 + Math.floor(Math.random() * 2), percentage: 14 },
                { url: "/iletisim", users: 6 + Math.floor(Math.random() * 2), percentage: 11 },
                { url: "/hakkimizda", users: 5 + Math.floor(Math.random() * 2), percentage: 9 },
            ],
            topPages: [
                { name: "/anasayfa", views: 4290 + Math.floor(Math.random() * 10), unique: 3985, bounceRate: "45%" },
                { name: "/urunler", views: 2150 + Math.floor(Math.random() * 10), unique: 1820, bounceRate: "32%" },
                { name: "/hakkimizda", views: 1890 + Math.floor(Math.random() * 10), unique: 1600, bounceRate: "60%" },
                { name: "/iletisim", views: 980 + Math.floor(Math.random() * 10), unique: 850, bounceRate: "25%" },
            ]
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ success: false, error: 'Analytics fetch failed' }, { status: 500 });
    }
}
