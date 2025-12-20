import { NextRequest, NextResponse } from 'next/server';
import { PageContent, connectToDatabase } from '@/lib/models';
import { verifyAuth } from '@/lib/auth';
import { allPageConfigs, getPageConfig, getSectionDefault } from '@/lib/cms/page-defaults';

// Development mode check - bypass auth for localhost
const isDevelopment = process.env.NODE_ENV === 'development';

// GET /api/dashboard/page-content - Get page content with defaults
export async function GET(request: NextRequest) {
    try {
        // In development, allow access without authentication for testing
        if (!isDevelopment) {
            const authResult = await verifyAuth(request);
            if (!authResult.authenticated) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const { searchParams } = new URL(request.url);
        const pageSlug = searchParams.get('slug');
        const language = (searchParams.get('language') || 'TR') as 'TR' | 'EN';

        // If no slug, return list of all editable pages
        if (!pageSlug) {
            const pages = allPageConfigs.map(page => ({
                slug: page.slug,
                title: page.title,
                titleEN: page.titleEN,
                sectionCount: page.sections.length,
            }));
            return NextResponse.json({ pages });
        }

        // Get page config
        const pageConfig = getPageConfig(pageSlug);
        if (!pageConfig) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        // Try to get overrides from database (graceful degradation)
        let overrides: any[] = [];
        try {
            await connectToDatabase();
            if (PageContent && typeof PageContent.findAll === 'function') {
                overrides = await PageContent.findAll({
                    where: { pageSlug, language, isActive: true },
                });
            }
        } catch (dbError) {
            console.warn('Database not available for dashboard, using defaults:', dbError);
            // Continue with empty overrides - will use defaults
        }

        // Build sections with content (override or default)
        const sections = pageConfig.sections.map(section => {
            const override = overrides.find((o: any) => o.sectionKey === section.key);
            let content = section.defaultContent[language];
            let hasOverride = false;

            if (override) {
                try {
                    content = JSON.parse(override.contentJson);
                    hasOverride = true;
                } catch (e) {
                    console.error('Error parsing content JSON:', e);
                }
            }

            return {
                key: section.key,
                title: section.title,
                fields: section.fields,
                content,
                hasOverride,
            };
        });

        return NextResponse.json({
            page: {
                slug: pageConfig.slug,
                title: pageConfig.title,
                titleEN: pageConfig.titleEN,
            },
            sections,
            language,
        });
    } catch (error) {
        console.error('Error fetching page content:', error);
        return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
    }
}

// PUT /api/dashboard/page-content - Save section content
export async function PUT(request: NextRequest) {
    try {
        // In development, allow access without authentication for testing
        if (!isDevelopment) {
            const authResult = await verifyAuth(request);
            if (!authResult.authenticated) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        await connectToDatabase();

        const body = await request.json();
        const { pageSlug, sectionKey, content, language = 'TR' } = body;

        if (!pageSlug || !sectionKey || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate page and section exist
        const pageConfig = getPageConfig(pageSlug);
        if (!pageConfig) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const sectionConfig = pageConfig.sections.find(s => s.key === sectionKey);
        if (!sectionConfig) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        // Upsert content
        const [record, created] = await PageContent.findOrCreate({
            where: { pageSlug, sectionKey, language },
            defaults: {
                pageSlug,
                sectionKey,
                contentJson: JSON.stringify(content),
                language,
                isActive: true,
            },
        });

        if (!created) {
            await record.update({
                contentJson: JSON.stringify(content),
                isActive: true,
            });
        }

        return NextResponse.json({
            success: true,
            message: created ? 'Content created' : 'Content updated',
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error saving page content:', error);
        console.error('Error details:', errorMessage);
        return NextResponse.json({
            error: 'Failed to save page content',
            details: errorMessage
        }, { status: 500 });
    }
}

// DELETE /api/dashboard/page-content - Revert section to default
export async function DELETE(request: NextRequest) {
    try {
        // In development, allow access without authentication for testing
        if (!isDevelopment) {
            const authResult = await verifyAuth(request);
            if (!authResult.authenticated) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const pageSlug = searchParams.get('slug');
        const sectionKey = searchParams.get('section');
        const language = searchParams.get('language') || 'TR';

        if (!pageSlug) {
            return NextResponse.json({ error: 'Missing page slug' }, { status: 400 });
        }

        // If sectionKey provided, delete only that section
        // Otherwise delete all sections for the page
        const where: { pageSlug: string; sectionKey?: string; language: string } = { pageSlug, language };
        if (sectionKey) {
            where.sectionKey = sectionKey;
        }

        const deleted = await PageContent.destroy({ where });

        return NextResponse.json({
            success: true,
            message: `Reverted ${deleted} section(s) to default`,
        });
    } catch (error) {
        console.error('Error reverting page content:', error);
        return NextResponse.json({ error: 'Failed to revert page content' }, { status: 500 });
    }
}
