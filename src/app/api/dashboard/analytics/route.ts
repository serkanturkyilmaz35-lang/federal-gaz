import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase, Order, User, ContactRequest } from '@/lib/models';
import { getRealtimeUsers, getActivePages, getTopPages, getTotalPageViews } from '@/lib/ga4';
import { Op } from 'sequelize';

// Helper to get date range from filter type
function getDateRange(dateRange: string, customStart?: string, customEnd?: string): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    switch (dateRange) {
        case 'today':
            // Already set to today
            break;
        case '7days':
            start.setDate(start.getDate() - 6);
            break;
        case '30days':
            start.setDate(start.getDate() - 29);
            break;
        case '90days':
            start.setDate(start.getDate() - 89);
            break;
        case 'all':
            start.setFullYear(2020, 0, 1); // Far past date
            break;
        case 'custom':
            if (customStart && customEnd) {
                return {
                    start: new Date(customStart),
                    end: new Date(customEnd + 'T23:59:59.999')
                };
            }
            break;
        default:
            // Default to today
            break;
    }

    return { start, end };
}

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const dateRange = searchParams.get('dateRange') || 'today';
        const customStart = searchParams.get('customStart') || undefined;
        const customEnd = searchParams.get('customEnd') || undefined;

        // Get date range for filtering
        const { start: filterStart, end: filterEnd } = getDateRange(dateRange, customStart, customEnd);

        // Today's date range (for daily stats)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Get real counts from database
        const totalOrders = await Order.count();
        const totalUsers = await User.count();
        const totalContacts = await ContactRequest.count();

        // Filtered counts based on date range
        const filteredOrders = await Order.count({
            where: {
                createdAt: { [Op.between]: [filterStart, filterEnd] }
            } as any
        });
        const filteredContacts = await ContactRequest.count({
            where: {
                createdAt: { [Op.between]: [filterStart, filterEnd] }
            } as any
        });

        // Daily counts (always today)
        const dailyOrders = await Order.count({
            where: {
                createdAt: { [Op.between]: [todayStart, todayEnd] }
            } as any
        });
        const dailyContacts = await ContactRequest.count({
            where: {
                createdAt: { [Op.between]: [todayStart, todayEnd] }
            } as any
        });

        // Chart data based on date range
        const chartData = await getChartData(dateRange, filterStart, filterEnd);

        // Try to get real GA4 data
        const [realTimeData, activePagesData, topPagesData, totalPageViews] = await Promise.all([
            getRealtimeUsers(),
            getActivePages(),
            getTopPages(),
            getTotalPageViews(),
        ]);

        // Check if GA is configured
        const gaConfigured = !!(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && process.env.GA_PROPERTY_ID);

        const realTime = gaConfigured ? realTimeData : {
            activeUsers: 0,
            mobileUsers: 0,
            desktopUsers: 0,
        };

        const activePages = gaConfigured ? activePagesData : [];
        const topPages = gaConfigured ? topPagesData : [];

        return NextResponse.json({
            success: true,
            gaConfigured,
            dateRange,
            stats: {
                totalOrders,
                dailyOrders,
                filteredOrders,
                totalUsers,
                totalContacts,
                dailyContacts,
                filteredContacts,
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

// Helper function to get chart data based on date range
async function getChartData(dateRange: string, filterStart: Date, filterEnd: Date) {
    const labels: string[] = [];
    const ordersData: number[] = [];
    const contactsData: number[] = [];

    // Determine number of days to show
    let daysToShow = 7;
    if (dateRange === 'today') daysToShow = 1;
    else if (dateRange === '7days') daysToShow = 7;
    else if (dateRange === '30days') daysToShow = 30;
    else if (dateRange === '90days') daysToShow = 90;
    else if (dateRange === 'custom') {
        const diffTime = Math.abs(filterEnd.getTime() - filterStart.getTime());
        daysToShow = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysToShow = Math.min(daysToShow, 90); // Cap at 90 days
    }

    // For longer periods, aggregate by week or month
    let aggregateBy = 'day';
    if (daysToShow > 30) aggregateBy = 'week';

    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Skip if aggregating
        if (aggregateBy === 'week' && i % 7 !== 0) continue;

        const day = date.getDate();
        const monthLabel = months[date.getMonth()];
        labels.push(`${day} ${monthLabel}`);

        const orderCount = await Order.count({
            where: {
                createdAt: { [Op.between]: [date, nextDate] }
            } as any
        });
        ordersData.push(orderCount);

        const contactCount = await ContactRequest.count({
            where: {
                createdAt: { [Op.between]: [date, nextDate] }
            } as any
        });
        contactsData.push(contactCount);
    }

    return { labels, ordersData, contactsData };
}
