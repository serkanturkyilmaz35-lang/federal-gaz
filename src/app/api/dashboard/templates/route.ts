

export const dynamic = 'force-dynamic';


import { NextResponse } from 'next/server';
import { EmailTemplate, MediaFile, connectToDatabase } from '@/lib/models';
import { defaultTemplateContent } from '@/lib/email';
import fs from 'fs';
import path from 'path';


// Helper to sync image to MediaFile and move to templates folder
async function syncTemplateImage(url: string, templateSlug: string): Promise<string> {
    if (!url) return url;

    try {
        const publicDir = path.join(process.cwd(), 'public');
        let newUrl = url;
        let filename = path.basename(url);
        let buffer: Buffer | null = null;

        // Handle External URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
            console.log(`Downloading external image: ${url}`);
            try {
                const res = await fetch(url);
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    buffer = Buffer.from(arrayBuffer);

                    // Generate a nice name
                    const ext = path.extname(new URL(url).pathname) || '.png';
                    filename = `${templateSlug}-header${ext}`; // e.g. new-year-header.png

                    // Ensure unique if exists
                    if (fs.existsSync(path.join(publicDir, 'templates', filename))) {
                        filename = `${templateSlug}-header-${Date.now()}${ext}`;
                    }

                    // Ensure templates dir exists
                    if (!fs.existsSync(path.join(publicDir, 'templates'))) {
                        fs.mkdirSync(path.join(publicDir, 'templates'), { recursive: true });
                    }

                    const savePath = path.join(publicDir, 'templates', filename);
                    fs.writeFileSync(savePath, buffer);
                    newUrl = `/templates/${filename}`;
                    console.log(`Downloaded to ${newUrl}`);
                } else {
                    console.warn(`Failed to fetch external image: ${res.status}`);
                    return url; // Keep original if fetch fails
                }
            } catch (e) {
                console.error('Fetch error:', e);
                return url;
            }
        }
        // Handle Local Path (move if not in templates)
        else if (url.startsWith('/')) {
            const oldPath = path.join(publicDir, url);
            if (!fs.existsSync(oldPath)) return url; // File not found local

            if (!url.startsWith('/templates/')) {
                // Determine new name
                const ext = path.extname(url);
                const base = path.basename(url, ext);
                filename = `${base}-${Date.now()}${ext}`;
                const newPath = path.join(publicDir, 'templates', filename);

                if (!fs.existsSync(path.join(publicDir, 'templates'))) {
                    fs.mkdirSync(path.join(publicDir, 'templates'), { recursive: true });
                }

                fs.renameSync(oldPath, newPath);
                newUrl = `/templates/${filename}`;
                console.log(`Moved local image to ${newUrl}`);
            }
        } else {
            // Unknown format
            return url;
        }

        // 2. Ensure MediaFile record exists
        const stats = fs.statSync(path.join(publicDir, newUrl));
        const finalFilename = path.basename(newUrl); // ensure correct filename

        const [mediaFile, created] = await MediaFile.findOrCreate({
            where: { url: newUrl },
            defaults: {
                filename: finalFilename,
                originalName: finalFilename,
                mimeType: `image/${path.extname(newUrl).substring(1).replace('jpg', 'jpeg')}`,
                size: stats.size,
                url: newUrl,
                uploadedBy: 1,
            }
        });

        if (!created) {
            if (mediaFile.deletedAt) {
                await mediaFile.restore();
            }
        }

        return newUrl;

    } catch (error) {
        console.error(`Failed to sync template image ${url}:`, error);
        return url; // Fallback
    }
}

// GET - List all templates
export async function GET() {
    try {
        await connectToDatabase();

        const templates = await EmailTemplate.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });

        // Fill in default content if missing in DB
        const enrichedTemplates = templates.map(t => {
            const tmpl = t.toJSON();
            if (!tmpl.bodyContent || tmpl.bodyContent.trim() === '') {
                tmpl.bodyContent = defaultTemplateContent[tmpl.slug] || defaultTemplateContent['modern'] || '';
            }
            // Ensure headerTitle has a fallback
            if (!tmpl.headerTitle || tmpl.headerTitle.trim() === '') {
                tmpl.headerTitle = tmpl.nameTR || 'Duyuru';
            }
            return tmpl;
        });

        return NextResponse.json({ templates: enrichedTemplates }, { status: 200 });
    } catch (error) {
        console.error('Templates GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
}

// PUT - Update template
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, nameTR, nameEN, headerBgColor, headerTextColor, headerImage, bodyBgColor, bodyTextColor, buttonColor, footerBgColor, footerTextColor, footerImage, bannerImage, logoUrl, headerTitle, bodyContent, footerContact, headerHtml, footerHtml, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const template = await EmailTemplate.findByPk(id);
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        // Sync images if they changed and are present
        let finalHeaderImage = headerImage;
        if (headerImage && headerImage !== template.headerImage) {
            finalHeaderImage = await syncTemplateImage(headerImage, template.slug);
        }

        let finalFooterImage = footerImage;
        if (footerImage && footerImage !== template.footerImage) {
            finalFooterImage = await syncTemplateImage(footerImage, template.slug);
        }

        let finalBannerImage = bannerImage;
        if (bannerImage && bannerImage !== template.bannerImage) {
            finalBannerImage = await syncTemplateImage(bannerImage, template.slug);
        }

        await template.update({
            nameTR: nameTR ?? template.nameTR,
            nameEN: nameEN ?? template.nameEN,
            headerBgColor: headerBgColor ?? template.headerBgColor,
            headerTextColor: headerTextColor ?? template.headerTextColor,
            headerImage: finalHeaderImage !== undefined ? finalHeaderImage : template.headerImage,
            bodyBgColor: bodyBgColor ?? template.bodyBgColor,
            bodyTextColor: bodyTextColor ?? template.bodyTextColor,
            buttonColor: buttonColor ?? template.buttonColor,
            footerBgColor: footerBgColor ?? template.footerBgColor,
            footerTextColor: footerTextColor ?? template.footerTextColor,
            footerImage: finalFooterImage !== undefined ? finalFooterImage : template.footerImage,
            bannerImage: finalBannerImage ?? template.bannerImage,
            logoUrl: logoUrl ?? template.logoUrl,
            headerTitle: headerTitle !== undefined ? headerTitle : template.headerTitle,
            bodyContent: bodyContent !== undefined ? bodyContent : template.bodyContent,
            footerContact: footerContact !== undefined ? footerContact : template.footerContact,
            headerHtml: headerHtml !== undefined ? headerHtml : template.headerHtml,
            footerHtml: footerHtml !== undefined ? footerHtml : template.footerHtml,
            buttonText: body.buttonText !== undefined ? body.buttonText : template.buttonText,
            templateData: body.templateData !== undefined ? body.templateData : template.templateData,
            isActive: isActive ?? template.isActive,
        });

        return NextResponse.json({ success: true, template }, { status: 200 });
    } catch (error) {
        console.error('Templates PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}
