import { NextResponse } from 'next/server';
import { connectToDatabase, NotificationRead, SiteSettings } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        // Sync NotificationRead table with alter to add new columns like deletedAt
        await NotificationRead.sync({ alter: true });

        // Sync SiteSettings table (create if not exists)
        await SiteSettings.sync({ alter: true });

        return NextResponse.json({
            message: 'Tables synced successfully: NotificationRead, SiteSettings'
        });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
