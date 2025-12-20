import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MediaFile, ensureModels } from '@/lib/models';

const isDevelopment = process.env.NODE_ENV === 'development';

// PATCH /api/dashboard/media/[id] - Update media file (alt text, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await connectToDatabase();
        ensureModels();

        const file = await MediaFile.findByPk(id);
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const body = await request.json();

        // Update allowed fields
        if (typeof body.altText === 'string') {
            file.altText = body.altText;
        }

        await file.save();

        return NextResponse.json({
            success: true,
            mediaFile: file,
            message: 'Alt text güncellendi'
        });

    } catch (error) {
        console.error('Media PATCH Error:', error);
        return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }
}

// GET /api/dashboard/media/[id] - Get single media file
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await connectToDatabase();
        ensureModels();

        const file = await MediaFile.findByPk(id, { paranoid: false });
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, mediaFile: file });

    } catch (error) {
        console.error('Media GET Error:', error);
        return NextResponse.json({ success: false, error: 'Fetch failed' }, { status: 500 });
    }
}
