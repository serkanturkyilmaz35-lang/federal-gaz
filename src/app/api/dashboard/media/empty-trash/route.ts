import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MediaFile, ensureModels } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

// DELETE /api/dashboard/media/empty-trash - Permanently delete all trashed files
export async function DELETE(request: Request) {
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
                deletedCount: 0
            });
        }

        const publicDir = path.join(process.cwd(), 'public');
        let deletedCount = 0;

        for (const file of trashedFiles) {
            const filePath = path.join(publicDir, file.url);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                await file.destroy();
                deletedCount++;
            } catch (err) {
                console.error(`Failed to permanently delete ${file.url}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            message: `${deletedCount} dosya kalıcı olarak silindi.`,
            deletedCount
        });

    } catch (error) {
        console.error('Empty Trash Error:', error);
        return NextResponse.json({ success: false, error: 'Empty trash failed' }, { status: 500 });
    }
}
