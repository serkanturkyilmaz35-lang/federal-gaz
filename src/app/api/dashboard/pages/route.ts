import { NextRequest, NextResponse } from 'next/server';
import { Page, connectToDatabase } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';

// GET /api/dashboard/pages - List all pages
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;

        const pages = await Page.findAll({
            where,
            order: [['updatedAt', 'DESC']],
        });

        return NextResponse.json({ pages });
    } catch (error) {
        console.error('Error fetching pages:', error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST /api/dashboard/pages - Create new page
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        const body = await request.json();
        const { slug, title, titleEn, content, contentEn, status, type, metaTitle, metaDescription, isSystemPage } = body;

        if (!slug || !title || !content) {
            return NextResponse.json({ error: 'Slug, title, and content are required' }, { status: 400 });
        }

        // Check if slug already exists
        const existing = await Page.findOne({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 });
        }

        const page = await Page.create({
            slug,
            title,
            titleEn,
            content,
            contentEn,
            status: status || 'draft',
            type: type || 'static',
            metaTitle,
            metaDescription,
            isSystemPage: isSystemPage || false,
        });

        return NextResponse.json({ page }, { status: 201 });
    } catch (error) {
        console.error('Error creating page:', error);
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}
