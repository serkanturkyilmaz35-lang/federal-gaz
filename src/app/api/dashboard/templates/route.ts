

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { EmailTemplate, connectToDatabase } from '@/lib/models';

// GET - List all templates
export async function GET() {
    try {
        await connectToDatabase();

        const templates = await EmailTemplate.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });

        return NextResponse.json({ templates }, { status: 200 });
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

        await template.update({
            nameTR: nameTR ?? template.nameTR,
            nameEN: nameEN ?? template.nameEN,
            headerBgColor: headerBgColor ?? template.headerBgColor,
            headerTextColor: headerTextColor ?? template.headerTextColor,
            headerImage: headerImage !== undefined ? headerImage : template.headerImage,
            bodyBgColor: bodyBgColor ?? template.bodyBgColor,
            bodyTextColor: bodyTextColor ?? template.bodyTextColor,
            buttonColor: buttonColor ?? template.buttonColor,
            footerBgColor: footerBgColor ?? template.footerBgColor,
            footerTextColor: footerTextColor ?? template.footerTextColor,
            footerImage: footerImage !== undefined ? footerImage : template.footerImage,
            bannerImage: bannerImage ?? template.bannerImage,
            logoUrl: logoUrl ?? template.logoUrl,
            headerTitle: headerTitle !== undefined ? headerTitle : template.headerTitle,
            bodyContent: bodyContent !== undefined ? bodyContent : template.bodyContent,
            footerContact: footerContact !== undefined ? footerContact : template.footerContact,
            headerHtml: headerHtml !== undefined ? headerHtml : template.headerHtml,
            footerHtml: footerHtml !== undefined ? footerHtml : template.footerHtml,
            isActive: isActive ?? template.isActive,
        });

        return NextResponse.json({ success: true, template }, { status: 200 });
    } catch (error) {
        console.error('Templates PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }
}
