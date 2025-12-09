import { NextResponse } from 'next/server';
import { connectToDatabase, Order, User, ContactRequest } from '@/lib/models';
import { getRealtimeUsers, getActivePages, getTopPages, getTotalPageViews } from '@/lib/ga4';

export async function GET() {
    try {
        await connectToDatabase();

        // Get real counts from database
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'PENDING' } });
        const totalUsers = await User.count();
        const totalContacts = await ContactRequest.count();
        const newContacts = await ContactRequest.count({ where: { status: 'new' } });

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
                pendingOrders,
                totalUsers,
                totalContacts,
                newContacts,
                totalPageViews: totalPageViews || 0,
            },
            realTime,
            activePages,
            topPages,
        });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({ success: false, error: 'Analytics fetch failed' }, { status: 500 });
    }
}

