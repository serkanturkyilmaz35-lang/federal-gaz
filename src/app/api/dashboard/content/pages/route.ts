import { NextRequest, NextResponse } from "next/server";
import sequelize from "@/lib/db";

// Get all pages
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");

        let query = `SELECT p.*, u.full_name as author_name 
                 FROM pages p 
                 LEFT JOIN users u ON p.created_by = u.id`;
        const replacements: any[] = [];
        const conditions: string[] = [];

        if (status && status !== "all") {
            conditions.push(status === "published" ? "p.is_published = 1" : "p.is_published = 0");
        }

        if (search) {
            conditions.push("(p.title LIKE ? OR p.slug LIKE ?)");
            replacements.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        query += ` ORDER BY p.updated_at DESC`;

        const [pages] = await sequelize.query(query, { replacements });

        return NextResponse.json({ pages });
    } catch (error) {
        console.error("Get pages error:", error);
        return NextResponse.json(
            { error: "Failed to fetch pages" },
            { status: 500 }
        );
    }
}

// Create new page
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title,
            slug,
            content,
            excerpt,
            meta_title,
            meta_description,
            meta_keywords,
            featured_image_id,
            template,
            is_published,
        } = body;

        const [result] = await sequelize.query(
            `INSERT INTO pages (title, slug, content, excerpt, meta_title, meta_description, meta_keywords, featured_image_id, template, is_published, published_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    title,
                    slug,
                    content || null,
                    excerpt || null,
                    meta_title || title,
                    meta_description || null,
                    meta_keywords || null,
                    featured_image_id || null,
                    template || "default",
                    is_published ? 1 : 0,
                    is_published ? new Date() : null,
                    1, // TODO: Get from session
                ],
            }
        );

        return NextResponse.json({
            success: true,
            page: { id: (result as any).insertId, ...body },
        });
    } catch (error) {
        console.error("Create page error:", error);
        return NextResponse.json(
            { error: "Failed to create page" },
            { status: 500 }
        );
    }
}

// Update page
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

        await sequelize.query(`UPDATE pages SET ${fields} WHERE id = ?`, {
            replacements: [...values, id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update page error:", error);
        return NextResponse.json(
            { error: "Failed to update page" },
            { status: 500 }
        );
    }
}

// Delete page
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        await sequelize.query(`DELETE FROM pages WHERE id = ?`, {
            replacements: [id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete page error:", error);
        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}
