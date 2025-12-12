'use server';

import { NextResponse } from 'next/server';
import { User, Order, connectToDatabase } from '@/lib/models';
import { Op, Sequelize } from 'sequelize';

// GET - List potential recipients with segmentation
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'all';
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const segment = searchParams.get('segment'); // 'none', 'active30', 'active90', 'highValue'
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

        if (segment && segment !== 'none') {
            const now = new Date();
            let dateFilter: Date | undefined;

            // Time-based segmentation
            if (segment === 'active30') {
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else if (segment === 'active90') {
                dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            } else if (segment === 'active180') {
                dateFilter = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            }

            // Query orders to find qualifying users
            const orderWhere: Record<string, unknown> = {};

            if (dateFilter) {
                orderWhere.createdAt = { [Op.gte]: dateFilter };
            }

            // Group orders by user to apply filters
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
                raw: true,
            }) as unknown as { userId: number; orderCount: string; totalSpent: string }[];

            userIds = orderStats.map(o => o.userId);

            // If no users match the segment, return empty
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
            order: [['createdAt', 'DESC']], // Newest first for limiting
            ...(limit ? { limit } : {}),
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
                    limit: limit || null,
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
