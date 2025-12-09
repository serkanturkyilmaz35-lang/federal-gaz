import { NextRequest, NextResponse } from 'next/server';
import { SiteSettings, connectToDatabase } from '@/lib/models';

// GET - Get all settings or by category
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let whereClause = {};
        if (category && ['general', 'contact', 'social', 'seo'].includes(category)) {
            whereClause = { category };
        }

        const settings = await SiteSettings.findAll({
            where: whereClause,
            order: [['category', 'ASC'], ['key', 'ASC']],
        });

        // Transform to key-value object for easier frontend use
        const settingsObj: Record<string, string> = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });

        return NextResponse.json({
            settings: settingsObj,
            raw: settings
        });
    } catch (error) {
        console.error('Settings GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// POST - Create or Update settings (bulk upsert)
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { settings } = body; // Array of { key, value, category, description? }

        if (!settings || !Array.isArray(settings)) {
            return NextResponse.json({ error: 'Settings array required' }, { status: 400 });
        }

        const results = [];
        for (const setting of settings) {
            const { key, value, category, description } = setting;

            if (!key || value === undefined || !category) {
                continue;
            }

            const [record, created] = await SiteSettings.upsert({
                key,
                value: String(value),
                category,
                description,
            });

            results.push({ key, created, updated: !created });
        }

        return NextResponse.json({
            success: true,
            message: `${results.length} settings saved`,
            results
        });
    } catch (error) {
        console.error('Settings POST Error:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}

// PUT - Update single setting by key
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
        }

        const setting = await SiteSettings.findOne({ where: { key } });

        if (!setting) {
            return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
        }

        setting.value = String(value);
        await setting.save();

        return NextResponse.json({ success: true, setting });
    } catch (error) {
        console.error('Settings PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
}
