import { NextRequest, NextResponse } from 'next/server';
import { Page, connectToDatabase } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { pageDefaults } from '@/lib/page-defaults';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// GET /api/dashboard/pages/[slug] - Get page for editing (dashboard)
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;

        // Check for database override first
        try {
            await connectToDatabase();
            const dbPage = await Page.findOne({ where: { slug } });

            if (dbPage) {
                return NextResponse.json({
                    page: {
                        id: dbPage.id,
                        slug: dbPage.slug,
                        title: dbPage.title,
                        titleEn: dbPage.titleEn,
                        content: dbPage.content,
                        contentEn: dbPage.contentEn,
                        status: dbPage.status,
                        metaTitle: dbPage.metaTitle,
                        metaDescription: dbPage.metaDescription,
                    },
                    source: 'database',
                    hasOverride: true
                });
            }
        } catch (dbError) {
            console.warn('Database error:', dbError);
        }

        // Return default content
        const defaultPage = pageDefaults[slug];
        if (!defaultPage) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({
            page: {
                slug: defaultPage.slug,
                title: defaultPage.title,
                titleEn: defaultPage.titleEn,
                content: defaultPage.content,
                contentEn: defaultPage.contentEn,
                status: 'published',
                metaTitle: '',
                metaDescription: '',
            },
            source: 'default',
            hasOverride: false
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}

// PUT /api/dashboard/pages/[slug] - Save page content (creates override)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { slug } = await params;
        const body = await request.json();

        const { title, titleEn, content, contentEn, status, metaTitle, metaDescription } = body;

        // Check if page exists in database
        let page = await Page.findOne({ where: { slug } });

        if (page) {
            // Update existing
            await page.update({
                title: title ?? page.title,
                titleEn: titleEn !== undefined ? titleEn : page.titleEn,
                content: content ?? page.content,
                contentEn: contentEn !== undefined ? contentEn : page.contentEn,
                status: status ?? page.status,
                metaTitle: metaTitle !== undefined ? metaTitle : page.metaTitle,
                metaDescription: metaDescription !== undefined ? metaDescription : page.metaDescription,
            });
        } else {
            // Get default for initial values
            const defaultPage = pageDefaults[slug];
            if (!defaultPage) {
                return NextResponse.json({ error: 'Invalid page slug' }, { status: 400 });
            }

            // Create new override
            page = await Page.create({
                slug,
                title: title ?? defaultPage.title,
                titleEn: titleEn ?? defaultPage.titleEn,
                content: content ?? defaultPage.content,
                contentEn: contentEn ?? defaultPage.contentEn,
                status: status ?? 'published',
                type: defaultPage.type,
                metaTitle: metaTitle ?? '',
                metaDescription: metaDescription ?? '',
                isSystemPage: true,
            });
        }

        return NextResponse.json({
            page: {
                id: page.id,
                slug: page.slug,
                title: page.title,
                titleEn: page.titleEn,
                content: page.content,
                contentEn: page.contentEn,
                status: page.status,
            },
            message: 'Page saved successfully'
        });
    } catch (error) {
        console.error('Error saving page:', error);
        return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
    }
}

// DELETE /api/dashboard/pages/[slug] - Delete override (revert to default)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { slug } = await params;

        const page = await Page.findOne({ where: { slug } });
        if (!page) {
            return NextResponse.json({ error: 'No override exists' }, { status: 404 });
        }

        await page.destroy();

        return NextResponse.json({ message: 'Override removed, page reverted to default' });
    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
