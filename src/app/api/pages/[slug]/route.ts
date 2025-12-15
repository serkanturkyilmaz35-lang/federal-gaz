import { NextRequest, NextResponse } from 'next/server';
import { Page, connectToDatabase } from '@/lib/models';
import { pageDefaults, getPageContent } from '@/lib/page-defaults';

interface RouteParams {
    params: Promise<{ slug: string }>;
}

// GET /api/pages/[slug] - Get page by slug (public)
// Returns database override if exists, otherwise returns default content
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        // First check if we have a database override
        try {
            await connectToDatabase();
            const dbPage = await Page.findOne({
                where: { slug, status: 'published' }
            });

            if (dbPage) {
                return NextResponse.json({
                    page: {
                        slug: dbPage.slug,
                        title: dbPage.title,
                        titleEn: dbPage.titleEn,
                        content: dbPage.content,
                        contentEn: dbPage.contentEn,
                        metaTitle: dbPage.metaTitle,
                        metaDescription: dbPage.metaDescription,
                    },
                    source: 'database'
                });
            }
        } catch (dbError) {
            console.warn('Database not available, using defaults:', dbError);
        }

        // No database override, use defaults
        const { searchParams } = new URL(request.url);
        const settings = {
            site_name: searchParams.get('site_name') || undefined,
            contact_email: searchParams.get('contact_email') || undefined,
            contact_phone: searchParams.get('contact_phone') || undefined,
            contact_address: searchParams.get('contact_address') || undefined,
        };

        const defaultPage = getPageContent(slug, settings);

        if (!defaultPage) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({
            page: {
                slug: defaultPage.slug,
                title: defaultPage.title,
                titleEn: defaultPage.titleEn,
                subtitle: defaultPage.subtitle,
                subtitleEn: defaultPage.subtitleEn,
                content: defaultPage.content,
                contentEn: defaultPage.contentEn,
            },
            source: 'default'
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
}
