import { NextResponse } from 'next/server';
import { connectToDatabase, NotificationRead } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        // Only sync NotificationRead table to avoid "Too many keys" error
        await NotificationRead.sync({ alter: false });

        return NextResponse.json({
            message: 'NotificationRead table synced successfully'
        });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

