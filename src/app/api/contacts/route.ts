import { NextResponse } from 'next/server';
import { ContactRequest, connectToDatabase } from '@/lib/models';
import { Op } from 'sequelize';

// GET: List all contacts
export async function GET() {
    try {
        await connectToDatabase();
        const contacts = await ContactRequest.findAll({
            order: [['createdAt', 'DESC']]
        });
        return NextResponse.json({ success: true, contacts });
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch contacts" }, { status: 500 });
    }
}

// DELETE: Bulk delete
export async function DELETE(req: Request) {
    try {
        await connectToDatabase();
        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
        }

        await ContactRequest.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete contacts:", error);
        return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
    }
}
