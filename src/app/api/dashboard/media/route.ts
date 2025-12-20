'use server';

import { NextResponse } from 'next/server';
import { MediaFile, connectToDatabase } from '@/lib/models';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, mkdir, unlink, rename } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { Op } from 'sequelize';
import sharp from 'sharp';


// Initialize S3 client for Cloudflare R2
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'federal-gaz-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// Check if R2 is configured
const isR2Configured = R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY;

const s3Client = isR2Configured ? new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
}) : null;

// Image processing settings
const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;

// GET - List all media files
// GET - List all media files
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const trash = searchParams.get('trash') === 'true';

        await connectToDatabase();

        const whereClause = trash
            ? { deletedAt: { [Op.not]: null } }  // Trash: deletedAt is NOT null
            : { deletedAt: null };               // Normal: deletedAt IS null

        const mediaFiles = await MediaFile.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            paranoid: false // Required to see soft-deleted records or mixed
        });

        return NextResponse.json({ mediaFiles }, { status: 200 });
    } catch (error) {
        console.error('Media GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch media files' }, { status: 500 });
    }
}

// POST - Upload new file
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'uploads';

        // Validate folder to prevent directory traversal
        const allowedFolders = ['uploads', 'hero', 'products', 'icons', 'services', 'images', 'templates', 'gallery'];
        const targetFolder = allowedFolders.includes(folder) ? folder : 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP, SVG, PDF' }, { status: 400 });
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum 10MB allowed' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name;
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

        let fileUrl = '';
        let finalBuffer: Buffer;
        let finalMimeType = file.type;
        let finalFilename: string;
        let width = 0;
        let height = 0;
        let format = file.type.split('/')[1] || 'unknown';

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Process images (except SVG and PDF)
        const isProcessableImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);

        if (isProcessableImage) {
            try {
                // Get image metadata first
                const metadata = await sharp(buffer).metadata();

                let sharpInstance = sharp(buffer);

                // Resize if width exceeds max
                if (metadata.width && metadata.width > MAX_WIDTH) {
                    sharpInstance = sharpInstance.resize(MAX_WIDTH, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    });
                }

                // Convert to WebP with compression
                finalBuffer = await sharpInstance
                    .webp({ quality: WEBP_QUALITY })
                    .toBuffer();

                // Get final dimensions
                const finalMetadata = await sharp(finalBuffer).metadata();
                width = finalMetadata.width || 0;
                height = finalMetadata.height || 0;
                format = 'webp';
                finalMimeType = 'image/webp';

                // Update filename to .webp
                const nameWithoutExt = safeName.replace(/\.[^/.]+$/, '');
                finalFilename = `${timestamp}-${nameWithoutExt}.webp`;

            } catch (sharpError) {
                console.error('Sharp processing error, using original:', sharpError);
                finalBuffer = buffer;
                finalFilename = `${timestamp}-${safeName}`;
            }
        } else {
            // Non-processable files (SVG, PDF)
            finalBuffer = buffer;
            finalFilename = `${timestamp}-${safeName}`;
        }

        if (isR2Configured && s3Client) {
            // R2 Upload (Folder in key)
            const key = `${targetFolder}/${finalFilename}`;
            const uploadCommand = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: finalBuffer,
                ContentType: finalMimeType,
            });

            await s3Client.send(uploadCommand);
            fileUrl = `${R2_PUBLIC_URL}/${key}`;
        } else {
            // Local Storage (public/{folder})
            const uploadDir = path.join(process.cwd(), 'public', targetFolder);

            // Ensure directory exists
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, finalFilename);
            await writeFile(filePath, finalBuffer);

            // Local URL
            fileUrl = `/${targetFolder}/${finalFilename}`;
        }

        await connectToDatabase();

        // Save to database with extended info
        const mediaFile = await MediaFile.create({
            filename: finalFilename,
            originalName: originalName,
            mimeType: finalMimeType,
            size: finalBuffer.length,
            url: fileUrl,
            width: width,
            height: height,
            format: format,
            altText: '',
        });

        return NextResponse.json({
            success: true,
            mediaFile,
            message: 'File uploaded and optimized successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Media POST Error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

// DELETE - Delete file (Soft or Permanent)
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const force = searchParams.get('force') === 'true';

        if (!id) {
            return NextResponse.json({ error: 'Media file ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const mediaFile = await MediaFile.findByPk(id, { paranoid: false });
        if (!mediaFile) {
            return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
        }

        const filename = mediaFile.filename;

        if (force) {
            // PERMANENT DELETE
            try {
                if (isR2Configured && s3Client) {
                    // R2 Delete
                    let key = mediaFile.url;
                    if (R2_PUBLIC_URL && mediaFile.url.startsWith(R2_PUBLIC_URL)) {
                        key = mediaFile.url.substring(R2_PUBLIC_URL.length + 1); // +1 for the '/'
                    } else if (mediaFile.url.startsWith('/')) {
                        key = mediaFile.url.slice(1);
                    }

                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: key,
                    });
                    await s3Client.send(deleteCommand);
                } else {
                    // Local Delete
                    // Determine the correct path based on whether it was soft-deleted or not
                    const filePath = mediaFile.deletedAt && mediaFile.originalPath
                        ? path.join(process.cwd(), 'public', mediaFile.originalPath) // Original path if soft-deleted
                        : path.join(process.cwd(), 'public', mediaFile.url); // Current path

                    if (existsSync(filePath)) {
                        await unlink(filePath);
                    }

                    // Also try to delete from trash if it was moved there
                    const trashFilePath = path.join(process.cwd(), 'public', 'trash', filename);
                    if (existsSync(trashFilePath)) {
                        await unlink(trashFilePath);
                    }
                }
            } catch (storageError) {
                console.error('Storage delete error:', storageError);
                // Continue even if storage delete fails, to delete from DB
            }
            await mediaFile.destroy({ force: true });
            return NextResponse.json({ success: true, message: 'File permanently deleted' }, { status: 200 });

        } else {
            // SOFT DELETE (Move to Trash)
            if (mediaFile.deletedAt) {
                return NextResponse.json({ error: 'File already in trash' }, { status: 400 });
            }

            const oldUrl = mediaFile.url;
            const trashUrl = `/trash/${filename}`;

            try {
                if (isR2Configured && s3Client) {
                    // For R2, soft delete means updating the DB record only.
                    // The file remains in its original R2 location, but is marked as deleted.
                    // Actual file movement in R2 (copy + delete) is more complex and often not done for soft delete.
                    // The `url` field will still point to the original R2 location.
                    // The `deletedAt` flag and `originalPath` will indicate it's in trash.
                    // If a user wants to restore, we just clear `deletedAt`.
                } else {
                    // Local Move
                    const sourcePath = path.join(process.cwd(), 'public', oldUrl);
                    const destPath = path.join(process.cwd(), 'public', 'trash', filename);

                    if (existsSync(sourcePath)) {
                        // Ensure trash dir exists
                        const trashDir = path.dirname(destPath);
                        if (!existsSync(trashDir)) await mkdir(trashDir, { recursive: true });

                        // Move file
                        await rename(sourcePath, destPath);
                    } else {
                        console.warn(`Source file not found for soft delete: ${sourcePath}`);
                        // If file missing but DB exists, just mark deleted in DB
                    }
                }

                // Update DB
                await mediaFile.update({
                    deletedAt: new Date(),
                    originalPath: oldUrl,
                    url: isR2Configured ? oldUrl : trashUrl // R2 URL remains the same, local URL changes
                });

                return NextResponse.json({ success: true, message: 'File moved to trash' }, { status: 200 });

            } catch (err) {
                console.error('Soft Delete Error:', err);
                return NextResponse.json({ error: 'Failed to move file to trash' }, { status: 500 });
            }
        }

    } catch (error) {
        console.error('Media DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
