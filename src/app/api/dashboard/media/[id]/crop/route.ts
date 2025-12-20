import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { MediaFile, ensureModels } from '@/lib/models';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// POST /api/dashboard/media/[id]/crop - Save cropped image
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await connectToDatabase();
        ensureModels();

        const file = await MediaFile.findByPk(id);
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const croppedFile = formData.get('file') as File;

        if (!croppedFile) {
            return NextResponse.json({ error: 'No cropped file provided' }, { status: 400 });
        }

        // Convert to buffer
        const arrayBuffer = await croppedFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process with sharp for optimization
        const processedBuffer = await sharp(buffer)
            .webp({ quality: 80 })
            .toBuffer();

        // Get new dimensions
        const metadata = await sharp(processedBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        // Generate new filename
        const timestamp = Date.now();
        const originalNameWithoutExt = file.filename.replace(/\.[^/.]+$/, '');
        const newFilename = `${originalNameWithoutExt}-cropped-${timestamp}.webp`;

        // Determine folder from original URL
        const urlParts = file.url.split('/');
        const folder = urlParts.length > 2 ? urlParts[1] : 'uploads';

        // Save to disk
        const uploadDir = path.join(process.cwd(), 'public', folder);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, newFilename);
        await writeFile(filePath, processedBuffer);

        const newUrl = `/${folder}/${newFilename}`;

        // Create new media file record
        const newMediaFile = await MediaFile.create({
            filename: newFilename,
            originalName: `${file.originalName} (kırpılmış)`,
            mimeType: 'image/webp',
            size: processedBuffer.length,
            url: newUrl,
            width: width,
            height: height,
            format: 'webp',
            altText: file.altText || '',
        });

        return NextResponse.json({
            success: true,
            mediaFile: newMediaFile,
            message: 'Görsel kırpıldı ve kaydedildi'
        });

    } catch (error) {
        console.error('Crop Save Error:', error);
        return NextResponse.json({ success: false, error: 'Crop save failed' }, { status: 500 });
    }
}
