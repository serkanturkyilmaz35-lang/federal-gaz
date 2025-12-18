'use server';

import { NextResponse } from 'next/server';
import { MediaFile, connectToDatabase } from '@/lib/models';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT || '',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'federal-gaz-media';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// GET - List all media files
export async function GET() {
    try {
        await connectToDatabase();

        const mediaFiles = await MediaFile.findAll({
            order: [['createdAt', 'DESC']],
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
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudflare R2
        const uploadCommand = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
        });

        await s3Client.send(uploadCommand);

        // Construct public URL
        const fileUrl = `${R2_PUBLIC_URL}/${filename}`;

        await connectToDatabase();

        // Save to database
        const mediaFile = await MediaFile.create({
            filename: filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: fileUrl,
        });

        return NextResponse.json({
            success: true,
            mediaFile,
            message: 'File uploaded successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Media POST Error:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

// DELETE - Delete file
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Media file ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const mediaFile = await MediaFile.findByPk(id);
        if (!mediaFile) {
            return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
        }

        // Extract filename from URL and delete from R2
        try {
            const filename = mediaFile.filename;
            const deleteCommand = new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
            });
            await s3Client.send(deleteCommand);
        } catch (r2Error) {
            console.error('R2 delete error:', r2Error);
            // Continue even if R2 delete fails
        }

        // Delete from database
        await mediaFile.destroy();

        return NextResponse.json({ success: true, message: 'File deleted' }, { status: 200 });
    } catch (error) {
        console.error('Media DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
