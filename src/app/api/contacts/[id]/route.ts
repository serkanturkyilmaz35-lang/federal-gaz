import { NextRequest, NextResponse } from "next/server";
import { ContactRequest, connectToDatabase } from "@/lib/models";

// GET: Get single contact by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contactId = parseInt(id, 10);

        if (isNaN(contactId)) {
            return NextResponse.json(
                { error: "Geçersiz iletişim ID" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const contact = await ContactRequest.findByPk(contactId);

        if (!contact) {
            return NextResponse.json(
                { error: "İletişim bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            contact,
        });
    } catch (error) {
        console.error("Contact fetch error:", error);
        return NextResponse.json(
            { error: "İletişim bilgisi alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}

// PATCH: Update contact status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contactId = parseInt(id, 10);

        if (isNaN(contactId)) {
            return NextResponse.json(
                { error: "Geçersiz iletişim ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { status } = body;

        await connectToDatabase();
        await ContactRequest.update({ status }, { where: { id: contactId } });

        return NextResponse.json({
            success: true,
            message: "Durum güncellendi",
        });
    } catch (error) {
        console.error("Contact update error:", error);
        return NextResponse.json(
            { error: "Güncelleme sırasında bir hata oluştu" },
            { status: 500 }
        );
    }
}
