import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/db";

// Get all users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get("role");
        const search = searchParams.get("search");

        let query = `SELECT id, email, full_name, phone_number, company_name, role, is_active, last_login, created_at FROM users`;
        const replacements: any[] = [];
        const conditions: string[] = [];

        if (role && role !== "all") {
            conditions.push("role = ?");
            replacements.push(role);
        }

        if (search) {
            conditions.push("(full_name LIKE ? OR email LIKE ? OR company_name LIKE ?)");
            replacements.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` ORDER BY created_at DESC`;

        const [users] = await sequelize.query(query, { replacements });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// Create new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, full_name, phone_number, company_name, role } = body;

        const [result] = await sequelize.query(
            `INSERT INTO users (email, full_name, phone_number, company_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    email,
                    full_name || null,
                    phone_number || null,
                    company_name || null,
                    role || "user",
                    1,
                ],
            }
        );

        return NextResponse.json({
            success: true,
            user: { id: (result as any).insertId, ...body },
        });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}

// Update user
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        const fields = Object.keys(updates)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = Object.values(updates);

        await sequelize.query(`UPDATE users SET ${fields} WHERE id = ?`, {
            replacements: [...values, id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

// Delete user
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        await sequelize.query(`DELETE FROM users WHERE id = ?`, {
            replacements: [id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}
