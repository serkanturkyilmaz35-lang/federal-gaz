import { NextResponse } from 'next/server';
import { MediaFile, connectToDatabase } from '@/lib/models';
import { rename } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Media file ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const mediaFile = await MediaFile.findByPk(id, { paranoid: false });
        if (!mediaFile || !mediaFile.deletedAt) {
            return NextResponse.json({ error: 'File not found in trash' }, { status: 404 });
        }

        const originalUrl = mediaFile.originalPath || `/uploads/${mediaFile.filename}`;
        const trashUrl = mediaFile.url;

        // Paths
        const trashPath = path.join(process.cwd(), 'public', trashUrl);
        const restorePath = path.join(process.cwd(), 'public', originalUrl);

        // Check if destination occupied
        if (existsSync(restorePath)) {
            return NextResponse.json({
                error: 'Conflict: A file with the same name exists in the original location. Delete or rename it first.'
            }, { status: 409 });
        }

        // Move File
        if (existsSync(trashPath)) {
            // Ensure directory exists
            const restoreDir = path.dirname(restorePath);
            // This assumes dir usually exists, but good to be safe if folder was deleted? 
            // Skipping mkdir for now as folders (hero, products) are likely static. 
            // But if user deleted a folder... wait, folders are not user-managed. ok.

            await rename(trashPath, restorePath);
        } else {
            console.warn(`Trash file missing on disk: ${trashPath}`);
            // Proceed to restore DB record anyway? Maybe dangerous if file is gone.
            // Let's error out.
            return NextResponse.json({ error: 'Source file missing in trash' }, { status: 500 });
        }

        // Update DB
        await mediaFile.update({
            deletedAt: null,
            url: originalUrl,
            // originalPath can correspond to current path now
        });

        return NextResponse.json({ success: true, message: 'File restored successfully' });

    } catch (error) {
        console.error('Restore Error:', error);
        return NextResponse.json({ error: 'Failed to restore file' }, { status: 500 });
    }
}
