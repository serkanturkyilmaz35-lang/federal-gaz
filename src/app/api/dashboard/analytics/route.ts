import { NextResponse } from 'next/server';
import { connectToDatabase, Order, User, ContactRequest } from '@/lib/models';
import { getRealtimeUsers, getActivePages, getTopPages, getTotalPageViews } from '@/lib/ga4';
import { Op } from 'sequelize';

export async function GET() {
    try {
        await connectToDatabase();

        // Today's date range
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Get real counts from database
        const totalOrders = await Order.count();
        const dailyOrders = await Order.count({
            where: {
                createdAt: { [Op.between]: [todayStart, todayEnd] }
            } as any
        });
        const totalUsers = await User.count();
        const totalContacts = await ContactRequest.count();
        const dailyContacts = await ContactRequest.count({
            where: {
                createdAt: { [Op.between]: [todayStart, todayEnd] }
            } as any
        });

        // Last 7 days chart data
        const chartData = await getLast7DaysData();

        // Try to get real GA4 data
        const [realTimeData, activePagesData, topPagesData, totalPageViews] = await Promise.all([
            getRealtimeUsers(),
            getActivePages(),
            getTopPages(),
            getTotalPageViews(),
        ]);

        // Check if GA is configured based on credentials existence
        const gaConfigured = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && process.env.GA_PROPERTY_ID);

        // Always use real GA4 data - no more fake fallback data
        const realTime = gaConfigured ? realTimeData : {
            activeUsers: 0,
            mobileUsers: 0,
            desktopUsers: 0,
        };

        // Use real GA4 data, empty array if no data
        const activePages = gaConfigured ? activePagesData : [];
        const topPages = gaConfigured ? topPagesData : [];

        return NextResponse.json({
            success: true,
            gaConfigured,
            stats: {
                totalOrders,
                dailyOrders,
                totalUsers,
                totalContacts,
                dailyContacts,
                totalPageViews: totalPageViews || 0,
            },
            chartData,
            realTime,
            activePages,
            topPages,
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ success: false, error: 'Analytics fetch failed' }, { status: 500 });
    }
}

// Helper function to get last 7 days data for charts
async function getLast7DaysData() {
    const labels: string[] = [];
    const ordersData: number[] = [];
    const contactsData: number[] = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Format label as "5 Ara"
        const day = date.getDate();
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        const monthLabel = months[date.getMonth()];
        labels.push(`${day} ${monthLabel}`);

        // Count orders for this day
        const orderCount = await Order.count({
            where: {
                createdAt: { [Op.between]: [date, nextDate] }
            } as any
        });
        ordersData.push(orderCount);

        // Count contacts for this day
        const contactCount = await ContactRequest.count({
            where: {
                createdAt: { [Op.between]: [date, nextDate] }
            } as any
        });
        contactsData.push(contactCount);
    }

    return { labels, ordersData, contactsData };
}
