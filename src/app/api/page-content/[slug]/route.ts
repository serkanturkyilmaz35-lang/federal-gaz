import { NextRequest, NextResponse } from 'next/server';
import { PageContent, connectToDatabase } from '@/lib/models';
import { getPageConfig } from '@/lib/cms/page-defaults';

// GET /api/page-content/[slug] - Public endpoint for frontend
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug);
        // Convert slug format: 'home' -> '/', 'hakkimizda' -> '/hakkimizda'
        const pageSlug = decodedSlug === 'home' ? '/' : `/${decodedSlug}`;

        const { searchParams } = new URL(request.url);
        const language = (searchParams.get('lang') || 'TR') as 'TR' | 'EN';

        // Get page config
        const pageConfig = getPageConfig(pageSlug);
        if (!pageConfig) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        // Build default content first
        const content: Record<string, unknown> = {};
        for (const section of pageConfig.sections) {
            content[section.key] = section.defaultContent[language];
        }

        // Try to get overrides from database (graceful degradation)
        try {
            await connectToDatabase();

            // Check if PageContent model is properly initialized
            if (PageContent && typeof PageContent.findAll === 'function') {
                const overrides = await PageContent.findAll({
                    where: { pageSlug, language, isActive: true },
                });

                // Apply overrides
                for (const override of overrides) {
                    try {
                        content[override.sectionKey] = JSON.parse(override.contentJson);
                    } catch (e) {
                        console.error('Error parsing content JSON:', e);
                        // Keep default content
                    }
                }
            }
        } catch (dbError) {
            console.warn('Database not available, using default content:', dbError);
            // Continue with defaults
        }

        return NextResponse.json({
            pageSlug,
            language,
            content,
        }, {
            headers: {
                // Cache for 1 minute, revalidate in background
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            },
        });
    } catch (error) {
        console.error('Error fetching page content:', error);
        return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
    }
}

