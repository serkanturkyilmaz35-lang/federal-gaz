import { NextResponse } from 'next/server';
import { getCampaignEmailTemplate } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { templateSlug } = await req.json();

        if (!templateSlug) {
            return NextResponse.json({ error: 'Template slug is required' }, { status: 400 });
        }

        // Generate preview HTML using the template function with sample data
        const html = getCampaignEmailTemplate(templateSlug, {
            subject: 'Örnek E-posta Konusu',
            content: '', // Empty content will use the default professional content
            recipientName: 'Mehmet Yılmaz'
        });

        return NextResponse.json({ html });
    } catch (error) {
        console.error('Template preview error:', error);
        return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 });
    }
}
