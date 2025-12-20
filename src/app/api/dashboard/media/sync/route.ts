import { NextResponse } from 'next/server';
import { syncPublicFiles } from '@/lib/media-sync';

// POST /api/dashboard/media/sync
export async function POST() {
    try {
        const result = await syncPublicFiles();
        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Sync API Error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
