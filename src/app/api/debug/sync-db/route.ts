import { NextResponse } from 'next/server';
import { connectToDatabase, NotificationRead } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        // Sync NotificationRead table with alter to add new columns like deletedAt
        await NotificationRead.sync({ alter: true });

        return NextResponse.json({
            message: 'NotificationRead table synced successfully (with deletedAt column)'
        });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}


