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

// Get order breakdown by status
async function getOrderBreakdown(dateFilter?: { start: Date; end: Date }) {
    const where = dateFilter ? { createdAt: { [Op.between]: [dateFilter.start, dateFilter.end] } } : {};

    // Use UPPERCASE status values matching database ENUM
    const [pending, preparing, shipping, completed, cancelled] = await Promise.all([
        Order.count({ where: { ...where, status: 'PENDING' } as any }),
        Order.count({ where: { ...where, status: 'PREPARING' } as any }),
        Order.count({ where: { ...where, status: 'SHIPPING' } as any }),
        Order.count({ where: { ...where, status: 'COMPLETED' } as any }),
        Order.count({ where: { ...where, status: 'CANCELLED' } as any }),
    ]);

    return { pending, preparing, shipping, completed, cancelled };
}

// Get contact breakdown by status
async function getContactBreakdown(dateFilter?: { start: Date; end: Date }) {
    const where = dateFilter ? { createdAt: { [Op.between]: [dateFilter.start, dateFilter.end] } } : {};

    const [newCount, read, replied] = await Promise.all([
        ContactRequest.count({ where: { ...where, status: 'new' } as any }),
        ContactRequest.count({ where: { ...where, status: 'read' } as any }),
        ContactRequest.count({ where: { ...where, status: 'replied' } as any }),
    ]);

    return { new: newCount, read, replied };
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

        // MEGA PARALLEL: All DB queries + GA4 calls in ONE Promise.all for maximum speed
        const [
            totalOrders,
            totalUsers,
            totalContacts,
            filteredOrders,
            filteredContacts,
            dailyOrders,
            dailyContacts,
            orderBreakdown,
            dailyOrderBreakdown,
            contactBreakdown,
            dailyContactBreakdown,
            chartData,
            realTimeData,
            activePagesData,
            topPagesData,
            totalPageViews
        ] = await Promise.all([
            // Basic counts
            Order.count(),
            User.count(),
            ContactRequest.count(),
            // Filtered counts
            Order.count({ where: { createdAt: { [Op.between]: [filterStart, filterEnd] } } as any }),
            ContactRequest.count({ where: { createdAt: { [Op.between]: [filterStart, filterEnd] } } as any }),
            // Daily counts
            Order.count({ where: { createdAt: { [Op.between]: [todayStart, todayEnd] } } as any }),
            ContactRequest.count({ where: { createdAt: { [Op.between]: [todayStart, todayEnd] } } as any }),
            // Breakdowns
            getOrderBreakdown(),
            getOrderBreakdown({ start: todayStart, end: todayEnd }),
            getContactBreakdown(),
            getContactBreakdown({ start: todayStart, end: todayEnd }),
            // Chart data
            getChartData(dateRange, filterStart, filterEnd),
            // GA4 data
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
            // Breakdown data for enhanced stats cards
            orderBreakdown,
            dailyOrderBreakdown,
            contactBreakdown,
            dailyContactBreakdown,
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

// Helper function to get chart data based on date range - OPTIMIZED
async function getChartData(dateRange: string, filterStart: Date, filterEnd: Date) {
    const labels: string[] = [];
    const ordersData: number[] = [];
    const contactsData: number[] = [];

    // Determine number of days to show - always show meaningful amount
    let daysToShow = 7;
    if (dateRange === 'today') daysToShow = 7; // Show last 7 days even for today
    else if (dateRange === '7days') daysToShow = 7;
    else if (dateRange === '30days') daysToShow = 30;
    else if (dateRange === '90days') daysToShow = 90;
    else if (dateRange === 'custom') {
        const diffTime = Math.abs(filterEnd.getTime() - filterStart.getTime());
        daysToShow = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        daysToShow = Math.max(daysToShow, 7); // At least 7 days
        daysToShow = Math.min(daysToShow, 90); // Cap at 90 days
    }

    // For longer periods, aggregate by week
    let step = 1;
    if (daysToShow > 30) step = 7; // Show weekly for 30+ days

    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // Build date ranges for parallel querying
    const dateRanges: { date: Date; nextDate: Date; label: string }[] = [];

    for (let i = daysToShow - 1; i >= 0; i -= step) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + step);

        const day = date.getDate();
        const monthLabel = months[date.getMonth()];

        dateRanges.push({
            date,
            nextDate,
            label: `${day} ${monthLabel}`
        });
    }

    // Execute all queries in parallel for speed
    const results = await Promise.all(
        dateRanges.map(async ({ date, nextDate, label }) => {
            const [orderCount, contactCount] = await Promise.all([
                Order.count({
                    where: { createdAt: { [Op.between]: [date, nextDate] } } as any
                }),
                ContactRequest.count({
                    where: { createdAt: { [Op.between]: [date, nextDate] } } as any
                })
            ]);
            return { label, orderCount, contactCount };
        })
    );

    // Populate arrays from results
    results.forEach(({ label, orderCount, contactCount }) => {
        labels.push(label);
        ordersData.push(orderCount);
        contactsData.push(contactCount);
    });

    return { labels, ordersData, contactsData };
}
