import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/db";

// Get analytics data
export async function GET(request: NextRequest) {
    try {
        // Get total stats
        const [statsResult] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM quotes) as total_quotes,
        (SELECT COUNT(*) FROM users WHERE is_active = 1) as active_users,
        (SELECT SUM(total_visits) FROM analytics_daily WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as site_visits
    `);

        const stats = (statsResult as any)[0];

        // Get top pages
        const [topPages] = await sequelize.query(`
      SELECT page_url, COUNT(*) as views, COUNT(DISTINCT visitor_id) as unique_visitors
      FROM page_views
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `);

        // Get recent orders
        const [recentOrders] = await sequelize.query(`
      SELECT o.*, u.full_name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

        return NextResponse.json({
            stats,
            topPages,
            recentOrders,
        });
    } catch (error) {
        console.error("Get analytics error:", error);
        return NextResponse.json(
            { error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}

// Track page view
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { page_url, visitor_id, user_id, referrer } = body;

        const userAgent = request.headers.get("user-agent") || "";
        const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "";

        await sequelize.query(
            `INSERT INTO page_views (page_url, visitor_id, user_id, referrer, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    page_url,
                    visitor_id,
                    user_id || null,
                    referrer || null,
                    userAgent,
                    ip,
                ],
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Track view error:", error);
        return NextResponse.json(
            { error: "Failed to track view" },
            { status: 500 }
        );
    }
}
