import { readdir, stat } from 'fs/promises';
import { join, relative, sep } from 'path';
import { MediaFile, connectToDatabase } from './models';

const PUBLIC_DIR = join(process.cwd(), 'public');
const EXCLUDED_DIRS = ['_next', 'fonts', 'sounds', 'static'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.mp4'];

interface SyncResult {
    added: number;
    skipped: number;
    errors: number;
}

async function getFilesRecursively(dir: string): Promise<string[]> {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = join(dir, dirent.name);
        if (dirent.isDirectory()) {
            if (EXCLUDED_DIRS.includes(dirent.name)) return [];
            return getFilesRecursively(res);
        } else {
            return [res];
        }
    }));
    return Array.prototype.concat(...files);
}

function getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'webp': return 'image/webp';
        case 'svg': return 'image/svg+xml';
        case 'pdf': return 'application/pdf';
        case 'mp4': return 'video/mp4';
        default: return 'application/octet-stream';
    }
}

export async function syncPublicFiles(): Promise<SyncResult & { removed: number }> {
    const result = { added: 0, skipped: 0, errors: 0, removed: 0 };

    try {
        await connectToDatabase();

        // 1. Get all file paths from public directory
        const allFiles = await getFilesRecursively(PUBLIC_DIR);

        // 2. Filter allowed extensions
        const validFiles = allFiles.filter(filePath => {
            const ext = '.' + filePath.split('.').pop()?.toLowerCase();
            return ALLOWED_EXTENSIONS.includes(ext);
        });

        console.log(`Found ${validFiles.length} valid files in public directory.`);

        // 3. Sync Files: Add new ones
        for (const filePath of validFiles) {
            try {
                // Generate relative URL path (e.g., /hero/bg.jpg)
                const relPath = relative(PUBLIC_DIR, filePath);
                // Ensure forward slashes for URL
                const urlPath = '/' + relPath.split(sep).join('/');

                // Check if exists in DB
                const existing = await MediaFile.findOne({ where: { url: urlPath } });

                if (existing) {
                    result.skipped++;
                } else {
                    const stats = await stat(filePath);
                    const filename = relPath.split(sep).pop() || 'unknown';

                    await MediaFile.create({
                        filename: filename, // Just the name for display/ref
                        originalName: filename,
                        mimeType: getMimeType(filename),
                        size: stats.size,
                        url: urlPath,
                        uploadedBy: 1 // System/Admin
                    });
                    result.added++;
                }
            } catch (err) {
                console.error(`Error processing file ${filePath}:`, err);
                result.errors++;
            }
        }

        // 4. Cleanup: Remove orphans (DB records with no matching file)
        const allDbFiles = await MediaFile.findAll();
        for (const dbFile of allDbFiles) {
            // Skip external URLs (R2, Unsplash, etc.)
            if (dbFile.url.startsWith('http')) continue;

            const relativeUrl = dbFile.url.startsWith('/') ? dbFile.url.slice(1) : dbFile.url;
            const localPath = join(PUBLIC_DIR, relativeUrl);

            try {
                await stat(localPath);
            } catch (err) {
                // File does not exist
                console.log(`Removing orphaned record: ${dbFile.url}`);
                await dbFile.destroy();
                result.removed++;
            }
        }

    } catch (error) {
        console.error('Sync failed:', error);
        throw error;
    }

    return result;
}
