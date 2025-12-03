import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sequelize from "@/lib/db";

// Media upload endpoint
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: "public",
        });

        // Save to database
        const [results] = await sequelize.query(
            `INSERT INTO media_library (filename, original_filename, file_path, file_url, file_type, mime_type, file_size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            {
                replacements: [
                    blob.pathname,
                    file.name,
                    blob.pathname,
                    blob.url,
                    file.type.startsWith("image/") ? "image" : "document",
                    file.type,
                    file.size,
                    1, // TODO: Get from session
                ],
            }
        );

        return NextResponse.json({
            success: true,
            file: {
                id: (results as any).insertId,
                url: blob.url,
                filename: file.name,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}

// Get media files
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        let query = `SELECT * FROM media_library`;
        const replacements: any[] = [];

        if (type) {
            query += ` WHERE file_type = ?`;
            replacements.push(type);
        }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        replacements.push(limit, offset);

        const [files] = await sequelize.query(query, { replacements });

        return NextResponse.json({ files });
    } catch (error) {
        console.error("Get media error:", error);
        return NextResponse.json(
            { error: "Failed to fetch media" },
            { status: 500 }
        );
    }
}

// Delete media file
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "No ID provided" }, { status: 400 });
        }

        // TODO: Delete from Vercel Blob as well
        await sequelize.query(`DELETE FROM media_library WHERE id = ?`, {
            replacements: [id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Delete failed" },
            { status: 500 }
        );
    }
}
