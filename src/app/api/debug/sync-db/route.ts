import { NextResponse } from 'next/server';
import { connectToDatabase, NotificationRead, SiteSettings, MediaFile } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        // Sync NotificationRead table with alter to add new columns like deletedAt
        await NotificationRead.sync({ alter: true });

        // Sync SiteSettings table
        await SiteSettings.sync({ alter: true });

        // Sync MediaFile table for Trash Bin support (originalPath, deletedAt)
        await MediaFile.sync({ alter: true });

        return NextResponse.json({
            message: 'Tables synced successfully: NotificationRead, SiteSettings, MediaFile'
        });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
