import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MediaFile, ensureModels } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

// DELETE /api/dashboard/media/bulk - Bulk delete media files
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

        const { ids, force } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        const publicDir = path.join(process.cwd(), 'public');
        let deletedCount = 0;

        for (const id of ids) {
            const file = await MediaFile.findByPk(id);
            if (!file) continue;

            if (force) {
                // Permanent delete - remove file from disk
                const filePath = path.join(publicDir, file.url);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    await file.destroy();
                    deletedCount++;
                } catch (err) {
                    console.error(`Failed to delete file ${file.url}:`, err);
                }
            } else {
                // Soft delete - mark as deleted
                file.deletedAt = new Date();
                await file.save();
                deletedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: force
                ? `${deletedCount} dosya kalıcı olarak silindi.`
                : `${deletedCount} dosya çöp kutusuna taşındı.`,
            deletedCount
        });

    } catch (error) {
        console.error('Bulk Delete Error:', error);
        return NextResponse.json({ success: false, error: 'Bulk delete failed' }, { status: 500 });
    }
}
