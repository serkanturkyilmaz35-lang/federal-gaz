import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase, Order, User, ContactRequest } from '@/lib/models';
import { getDb } from '@/lib/db';
import { getRealtimeUsers, getActivePages, getTopPages, getTotalPageViews } from '@/lib/ga4';
import { Op } from 'sequelize';

const sequelize = getDb();

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
    // Determine number of days/grouping
    let daysToShow = 7;
    if (dateRange === '30days') daysToShow = 30;
    else if (dateRange === '90days') daysToShow = 90;
    else if (dateRange === 'custom') {
        const diffTime = Math.abs(filterEnd.getTime() - filterStart.getTime());
        daysToShow = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Determine grouping format (Day vs Week/Month could be added for larger ranges, staying daily for now)
    // For 90+ days we might want to group by week, but user asked for speed primarily.
    // Daily grouping is fine if efficient.

    const db = await connectToDatabase();

    // Efficient Single Query for Orders
    const orderResults = await Order.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
            createdAt: {
                [Op.between]: [filterStart, filterEnd]
            }
        } as any,
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
        raw: true
    }) as unknown as { date: string, count: number }[];

    // Efficient Single Query for Contacts
    const contactResults = await ContactRequest.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
            createdAt: {
                [Op.between]: [filterStart, filterEnd]
            }
        } as any,
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
        raw: true
    }) as unknown as { date: string, count: number }[];

    // Map results to a complete date range map to fill gaps with 0
    const dataMap: Record<string, { orders: number, contacts: number }> = {};
    const labels: string[] = [];
    const ordersData: number[] = [];
    const contactsData: number[] = [];

    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // Fill map with 0s
    // Determine step size
    let step = 1;
    if (daysToShow > 60) step = 3; // Reduce granularity for very long ranges if needed, or keep 1

    // Populate all dates in range
    // Backward loop from today/end date to start date to ensure correct order or forward? 
    // Let's go forward from start to end.

    const currentDate = new Date(filterStart);
    // Adjust to start of day
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(filterEnd);
    endDate.setHours(23, 59, 59, 999);

    while (currentDate <= endDate) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${yyyy}-${mm}-${dd}`; // Matches SQL Date format

        dataMap[dateKey] = { orders: 0, contacts: 0 };

        // Label generation
        const day = currentDate.getDate();
        const monthLabel = months[currentDate.getMonth()];
        labels.push(`${day} ${monthLabel}`);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate with actual data
    orderResults.forEach((row: any) => {
        // SQL Date might be YYYY-MM-DD string
        const dateStr = typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0];
        if (dataMap[dateStr]) {
            dataMap[dateStr].orders = Number(row.count);
        }
    });

    contactResults.forEach((row: any) => {
        const dateStr = typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().split('T')[0];
        if (dataMap[dateStr]) {
            dataMap[dateStr].contacts = Number(row.count);
        }
    });

    // Flatten to arrays
    // Object.keys(dataMap) might not be sorted if we just iterate, but we generated labels in order.
    // We should iterate based on the labels we generated, but we need to map labels back to date keys? 
    // Easier: Re-iterate the date range or store in an ordered array effectively.

    // Better approach:
    // Reset currentDate and iterate again to pick from Map
    const orderedKeys = Object.keys(dataMap).sort(); // YYYY-MM-DD sorts correctly

    // But we need to match the specific "daysToShow" logic if we want to skip days (step). 
    // If we want exact daily data for the whole range:
    orderedKeys.forEach(key => {
        ordersData.push(dataMap[key].orders);
        contactsData.push(dataMap[key].contacts);
    });

    // Re-generate labels if needed (actually orderedKeys is fine)
    // Wait, labels array was generated in the loop. 
    // If we used a step in loop, we'd have fewer labels.
    // If we just want daily data, standard approach is fine.

    // To match previous logic's "step" for long durations:
    if (ordersData.length > 30) {
        // Filter arrays to reduce points? Or just let Chart.js handle it (it's usually fine up to 100 points)
        // Let's return daily data, it's most accurate. Chart.js is fast enough.
    }

    return { labels, ordersData, contactsData };
}
