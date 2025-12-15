import { NextResponse } from 'next/server';
import { CookieConsent, connectToDatabase } from '@/lib/models';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const body = await req.json();
        const { visitorId, necessary, analytics, marketing, functional } = body;

        if (!visitorId) {
            return NextResponse.json({ error: 'Visitor ID required' }, { status: 400 });
        }

        // Get IP and User Agent
        const headersList = await headers();
        const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
            headersList.get('x-real-ip') ||
            'unknown';
        const userAgent = headersList.get('user-agent') || undefined;

        // Upsert consent record
        const [consent, created] = await CookieConsent.findOrCreate({
            where: { visitorId },
            defaults: {
                visitorId,
                necessary: necessary ?? true,
                analytics: analytics ?? false,
                marketing: marketing ?? false,
                functional: functional ?? false,
                ipAddress,
                userAgent
            }
        });

        if (!created) {
            // Update existing record
            await consent.update({
                necessary: necessary ?? true,
                analytics: analytics ?? false,
                marketing: marketing ?? false,
                functional: functional ?? false,
                ipAddress,
                userAgent
            });
        }

        return NextResponse.json({
            success: true,
            consent: {
                necessary: consent.necessary,
                analytics: consent.analytics,
                marketing: consent.marketing,
                functional: consent.functional
            }
        });

    } catch (error) {
        console.error('Cookie consent save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const visitorId = searchParams.get('visitorId');

        if (!visitorId) {
            return NextResponse.json({
                consent: { necessary: true, analytics: false, marketing: false, functional: false }
            });
        }

        const consent = await CookieConsent.findOne({ where: { visitorId } });

        if (!consent) {
            return NextResponse.json({
                consent: { necessary: true, analytics: false, marketing: false, functional: false }
            });
        }

        return NextResponse.json({
            consent: {
                necessary: consent.necessary,
                analytics: consent.analytics,
                marketing: consent.marketing,
                functional: consent.functional
            }
        });

    } catch (error) {
        console.error('Cookie consent fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
