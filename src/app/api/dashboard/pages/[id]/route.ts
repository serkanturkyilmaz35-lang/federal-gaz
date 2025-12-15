import { NextRequest, NextResponse } from 'next/server';
import { Page, connectToDatabase } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/dashboard/pages/[id] - Get single page
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { id } = await params;

        const page = await Page.findByPk(id);
        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ page });
    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}

// PUT /api/dashboard/pages/[id] - Update page
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { id } = await params;

        const page = await Page.findByPk(id);
        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const body = await request.json();
        const { title, titleEn, content, contentEn, status, metaTitle, metaDescription } = body;

        // Don't allow slug changes for system pages
        if (page.isSystemPage && body.slug && body.slug !== page.slug) {
            return NextResponse.json({ error: 'Cannot change slug of system pages' }, { status: 400 });
        }

        await page.update({
            title: title ?? page.title,
            titleEn: titleEn !== undefined ? titleEn : page.titleEn,
            content: content ?? page.content,
            contentEn: contentEn !== undefined ? contentEn : page.contentEn,
            status: status ?? page.status,
            metaTitle: metaTitle !== undefined ? metaTitle : page.metaTitle,
            metaDescription: metaDescription !== undefined ? metaDescription : page.metaDescription,
            slug: !page.isSystemPage && body.slug ? body.slug : page.slug,
        });

        return NextResponse.json({ page });
    } catch (error) {
        console.error('Error updating page:', error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE /api/dashboard/pages/[id] - Delete page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { id } = await params;

        const page = await Page.findByPk(id);
        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        // Don't allow deleting system pages
        if (page.isSystemPage) {
            return NextResponse.json({ error: 'Cannot delete system pages' }, { status: 400 });
        }

        await page.destroy();

        return NextResponse.json({ message: 'Page deleted successfully' });
    } catch (error) {
        console.error('Error deleting page:', error);
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}
