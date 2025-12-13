'use server';

import { NextResponse } from 'next/server';
import { User, Order, connectToDatabase } from '@/lib/models';
import { Op, Sequelize } from 'sequelize';

// GET - List potential recipients with advanced marketing segmentation
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all';
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const segment = searchParams.get('segment'); // Various segment types
        const minAmount = searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined;
        const minOrders = searchParams.get('minOrders') ? parseInt(searchParams.get('minOrders')!) : undefined;

        await connectToDatabase();

        if (type === 'guests') {
            return NextResponse.json({
                recipients: [],
                count: 0,
                message: 'Misafir aboneler henüz desteklenmiyor'
            }, { status: 200 });
        }

        // Build user IDs based on segmentation
        let userIds: number[] | undefined;
        let orderBasedLimit: number | undefined;

        if (segment && segment !== 'none') {
            const now = new Date();
            let dateFilter: Date | undefined;
            let orderBy: string | undefined;

            // ==================== TIME-BASED ACTIVITY ====================
            if (segment === 'active30') {
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else if (segment === 'active90') {
                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            } else if (segment === 'active180') {
                dateFilter = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            }

            // ==================== TOP CUSTOMERS BY ORDER COUNT ====================
            else if (segment === 'topOrders10') {
                orderBy = 'orderCount DESC';
                orderBasedLimit = 10;
            } else if (segment === 'topOrders20') {
                orderBy = 'orderCount DESC';
                orderBasedLimit = 20;
            } else if (segment === 'topOrders50') {
                orderBy = 'orderCount DESC';
                orderBasedLimit = 50;
            }

            // ==================== TOP CUSTOMERS BY TOTAL AMOUNT ====================
            else if (segment === 'topAmount10') {
                orderBy = 'totalSpent DESC';
                orderBasedLimit = 10;
            } else if (segment === 'topAmount20') {
                orderBy = 'totalSpent DESC';
                orderBasedLimit = 20;
            } else if (segment === 'topAmount50') {
                orderBy = 'totalSpent DESC';
                orderBasedLimit = 50;
            }

            // ==================== VIP CUSTOMERS ====================
            // 3+ orders in last 30 days OR 10,000₺+ total spent
            else if (segment === 'vip') {
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                const vipStats = await Order.findAll({
                    where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
                    attributes: [
                        'userId',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
                        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalSpent'],
                    ],
                    group: ['userId'],
                    having: Sequelize.literal('COUNT(id) >= 3 OR SUM(totalAmount) >= 10000'),
                    raw: true,
                }) as unknown as { userId: number }[];
                userIds = vipStats.map(o => o.userId);
            }

            // ==================== ABOUT TO CHURN ====================
            // Was active before but no orders in last 60 days
            else if (segment === 'aboutToChurn') {
                const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
                const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

                // Users with orders 60-90 days ago but not in last 60 days
                const oldOrders = await Order.findAll({
                    where: {
                        createdAt: {
                            [Op.gte]: ninetyDaysAgo,
                            [Op.lt]: sixtyDaysAgo
                        }
                    },
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
                    raw: true,
                }) as unknown as { userId: number }[];
                const oldUserIds = oldOrders.map(o => o.userId);

                const recentOrders = await Order.findAll({
                    where: { createdAt: { [Op.gte]: sixtyDaysAgo } },
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
                    raw: true,
                }) as unknown as { userId: number }[];
                const recentUserIds = new Set(recentOrders.map(o => o.userId));

                userIds = oldUserIds.filter(id => !recentUserIds.has(id));
            }

            // ==================== WIN-BACK (INACTIVE 90+ DAYS) ====================
            else if (segment === 'winBack') {
                const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

                const oldOrders = await Order.findAll({
                    where: { createdAt: { [Op.lt]: ninetyDaysAgo } },
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
                    raw: true,
                }) as unknown as { userId: number }[];
                const oldUserIds = oldOrders.map(o => o.userId);

                const recentOrders = await Order.findAll({
                    where: { createdAt: { [Op.gte]: ninetyDaysAgo } },
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
                    raw: true,
                }) as unknown as { userId: number }[];
                const recentUserIds = new Set(recentOrders.map(o => o.userId));

                userIds = oldUserIds.filter(id => !recentUserIds.has(id));
            }

            // ==================== REGULAR BUYERS ====================
            // Orders every month for last 3 months
            else if (segment === 'regularBuyers') {
                const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                const regularStats = await Order.findAll({
                    where: { createdAt: { [Op.gte]: threeMonthsAgo } },
                    attributes: [
                        'userId',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
                    ],
                    group: ['userId'],
                    having: Sequelize.literal('COUNT(id) >= 3'), // At least 1 per month
                    raw: true,
                }) as unknown as { userId: number }[];
                userIds = regularStats.map(o => o.userId);
            }

            // ==================== NEW CUSTOMERS ====================
            else if (segment === 'newCustomers') {
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                const newUsers = await User.findAll({
                    where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
                    attributes: ['id'],
                    raw: true,
                });
                userIds = newUsers.map(u => u.id);
            }

            // ==================== FIRST-TIME BUYERS ====================
            // Only 1 order ever
            else if (segment === 'firstTimeBuyers') {
                const firstTimeStats = await Order.findAll({
                    attributes: [
                        'userId',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
                    ],
                    group: ['userId'],
                    having: Sequelize.literal('COUNT(id) = 1'),
                    raw: true,
                }) as unknown as { userId: number }[];
                userIds = firstTimeStats.map(o => o.userId);
            }

            // ==================== INACTIVE (GENERAL) ====================
            else if (segment === 'inactive') {
                const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

                const oldOrders = await Order.findAll({
                    where: { createdAt: { [Op.lt]: ninetyDaysAgo } },
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
                    raw: true,
                }) as unknown as { userId: number }[];
                const oldUserIds = oldOrders.map(o => o.userId);

                const recentOrders = await Order.findAll({
                    where: { createdAt: { [Op.gte]: ninetyDaysAgo } },
                    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']],
                    raw: true,
                }) as unknown as { userId: number }[];
                const recentUserIds = new Set(recentOrders.map(o => o.userId));

                userIds = oldUserIds.filter(id => !recentUserIds.has(id));
            }

            // If need to query orders for time-based or top segments
            if (dateFilter || orderBy) {
                const orderWhere: Record<string, unknown> = {};

                if (dateFilter) {
                    orderWhere.createdAt = { [Op.gte]: dateFilter };
                }

                const orderStats = await Order.findAll({
                    where: orderWhere,
                    attributes: [
                        'userId',
                        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
                        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalSpent'],
                    ],
                    group: ['userId'],
                    having: Sequelize.literal(`
                        ${minOrders ? `COUNT(id) >= ${minOrders}` : '1=1'}
                        ${minAmount ? ` AND SUM(totalAmount) >= ${minAmount}` : ''}
                    `),
                    order: orderBy ? [[Sequelize.literal(orderBy.split(' ')[0]), orderBy.split(' ')[1]]] : undefined,
                    limit: orderBasedLimit,
                    raw: true,
                }) as unknown as { userId: number; orderCount: string; totalSpent: string }[];

                userIds = orderStats.map(o => o.userId);
            }

            // If no users match the segment, return empty
            if (userIds && userIds.length === 0) {
                return NextResponse.json({
                    recipients: [],
                    count: 0,
                    stats: { members: 0, guests: 0, total: 0 }
                }, { status: 200 });
            }
        }

        // ==================== STANDALONE MIN ORDERS / MIN AMOUNT FILTERS ====================
        // Apply minOrders/minAmount even when segment is 'none' or not set
        if (!userIds && (minOrders || minAmount)) {
            const orderStats = await Order.findAll({
                attributes: [
                    'userId',
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount'],
                    [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalSpent'],
                ],
                group: ['userId'],
                having: Sequelize.literal(`
                    ${minOrders ? `COUNT(id) >= ${minOrders}` : '1=1'}
                    ${minAmount ? ` AND SUM(totalAmount) >= ${minAmount}` : ''}
                `),
                raw: true,
            }) as unknown as { userId: number; orderCount: string; totalSpent: string }[];

            userIds = orderStats.map(o => o.userId);

            // If no users match the filters, return empty
            if (userIds.length === 0) {
                return NextResponse.json({
                    recipients: [],
                    count: 0,
                    stats: { members: 0, guests: 0, total: 0 }
                }, { status: 200 });
            }
        }

        // Build user query
        const userWhere: Record<string, unknown> = {};

        if (type === 'members') {
            userWhere.role = { [Op.or]: ['user', 'admin', 'editor'] };
        }

        if (userIds) {
            userWhere.id = { [Op.in]: userIds };
        }

        // Get users with optional limit
        const users = await User.findAll({
            where: userWhere,
            attributes: ['id', 'name', 'email'],
            order: [['createdAt', 'DESC']],
            ...(limit && !orderBasedLimit ? { limit } : {}),
        });

        // Total counts for stats
        const totalMembers = await User.count();
        const segmentedCount = userIds ? userIds.length : totalMembers;

        return NextResponse.json({
            recipients: users,
            count: users.length,
            stats: {
                members: totalMembers,
                segmented: segmentedCount,
                guests: 0,
                total: totalMembers,
                applied: {
                    limit: limit || orderBasedLimit || null,
                    segment: segment || 'none',
                    minAmount: minAmount || null,
                    minOrders: minOrders || null,
                }
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Recipients GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
    }
}
