import { NextResponse } from 'next/server';

export async function GET() {
    // TODO: Implement with database
    return NextResponse.json({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
    });
}
