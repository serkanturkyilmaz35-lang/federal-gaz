import { NextResponse } from 'next/server';
import { PageContent, connectToDatabase } from '@/lib/models';

// GET /api/init-db - Force sync PageContent table
export async function GET() {
    try {
        await connectToDatabase();

        // Force sync PageContent model
        await PageContent.sync({ force: false, alter: true });

        return NextResponse.json({
            success: true,
            message: 'PageContent table synced successfully'
        });
    } catch (error) {
        console.error('Error syncing database:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            error: 'Failed to sync database',
            details: errorMessage
        }, { status: 500 });
    }
}
