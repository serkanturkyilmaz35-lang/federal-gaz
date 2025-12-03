import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/db";

// Get all orders
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let query = `SELECT o.*, u.full_name as customer_name, u.company_name 
                 FROM orders o 
                 LEFT JOIN users u ON o.user_id = u.id`;
        const replacements: any[] = [];
        const conditions: string[] = [];

        if (status && status !== "all") {
            conditions.push("o.status = ?");
            replacements.push(status);
        }

        if (search) {
            conditions.push("(o.order_number LIKE ? OR u.full_name LIKE ? OR u.company_name LIKE ?)");
            replacements.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (startDate) {
            conditions.push("o.created_at >= ?");
            replacements.push(startDate);
        }

        if (endDate) {
            conditions.push("o.created_at <= ?");
            replacements.push(endDate);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` ORDER BY o.created_at DESC`;

        const [orders] = await sequelize.query(query, { replacements });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("Get orders error:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}

// Create new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, order_number, status, total_amount, notes, shipping_address, items } = body;

        // Start transaction
        const [orderResult] = await sequelize.query(
            `INSERT INTO orders (user_id, order_number, status, total_amount, notes, shipping_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    user_id,
                    order_number,
                    status || "pending",
                    total_amount,
                    notes || null,
                    shipping_address || null,
                ],
            }
        );

        const orderId = (orderResult as any).insertId;

        // Insert order items
        if (items && items.length > 0) {
            for (const item of items) {
                await sequelize.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
           VALUES (?, ?, ?, ?, ?)`,
                    {
                        replacements: [
                            orderId,
                            item.product_id,
                            item.product_name,
                            item.quantity,
                            item.unit_price,
                        ],
                    }
                );
            }
        }

        return NextResponse.json({
            success: true,
            order: { id: orderId, ...body },
        });
    } catch (error) {
        console.error("Create order error:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

// Update order status
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: "ID and status required" },
                { status: 400 }
            );
        }

        await sequelize.query(`UPDATE orders SET status = ? WHERE id = ?`, {
            replacements: [status, id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update order error:", error);
        return NextResponse.json(
            { error: "Failed to update order" },
            { status: 500 }
        );
    }
}
