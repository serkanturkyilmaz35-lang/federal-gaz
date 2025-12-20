import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MediaFile, ensureModels } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { Op } from 'sequelize';

const isDevelopment = process.env.NODE_ENV === 'development';

// POST /api/dashboard/media/restore-all - Restore all trashed files
export async function POST(request: Request) {
    try {
        if (!isDevelopment) {
            const authResult = await verifyAuth(request);
            if (!authResult.authenticated) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        await connectToDatabase();
        ensureModels();

        // Find all soft-deleted files
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trashedFiles = await MediaFile.findAll({
            where: {
                deletedAt: { [Op.ne]: null }
            } as any
        });

        if (trashedFiles.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Çöp kutusu zaten boş.',
                restoredCount: 0
            });
        }

        let restoredCount = 0;

        for (const file of trashedFiles) {
            try {
                file.deletedAt = null;
                await file.save();
                restoredCount++;
            } catch (err) {
                console.error(`Failed to restore ${file.url}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${restoredCount} dosya geri yüklendi.`,
            restoredCount
        });

    } catch (error) {
        console.error('Restore All Error:', error);
        return NextResponse.json({ success: false, error: 'Restore all failed' }, { status: 500 });
    }
}
