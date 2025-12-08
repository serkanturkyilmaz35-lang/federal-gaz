import { NextResponse } from 'next/server';
import { connectToDatabase, AdminUser, OTPToken } from '@/lib/models';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        await connectToDatabase();
        const db = getDb();

        // Force sync to create tables
        await db.sync({ alter: true });

        return NextResponse.json({
            message: 'Database synced successfully',
            models: Object.keys(db.models)
        });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
