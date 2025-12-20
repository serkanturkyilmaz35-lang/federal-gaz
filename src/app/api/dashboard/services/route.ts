'use server';

import { NextResponse } from 'next/server';
import { Service, connectToDatabase } from '@/lib/models';

// GET - List all services
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        await connectToDatabase();

        if (slug) {
            const service = await Service.findOne({ where: { slug } });
            if (!service) {
                return NextResponse.json({ error: 'Service not found' }, { status: 404 });
            }
            return NextResponse.json({ service }, { status: 200 });
        }

        const services = await Service.findAll({
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });

        return NextResponse.json({ services }, { status: 200 });
    } catch (error) {
        console.error('Services GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

// POST - Create new service
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            slug, icon, titleTR, titleEN, descTR, descEN,
            subtitleTR, subtitleEN, image,
            detailsTitleTR, detailsTitleEN, detailsTR, detailsEN,
            listTitleTR, listTitleEN, listItemsTR, listItemsEN,
            featuresTitleTR, featuresTitleEN, featureItemsTR, featureItemsEN,
            ctaButtonTextTR, ctaButtonTextEN, ctaButtonLink,
            contentTR, contentEN,
            sortOrder, isActive
        } = body;

        if (!slug || !titleTR || !titleEN || !descTR || !descEN) {
            return NextResponse.json({ error: 'Required fields: slug, titleTR, titleEN, descTR, descEN' }, { status: 400 });
        }

        await connectToDatabase();

        const newService = await Service.create({
            slug, icon, titleTR, titleEN, descTR, descEN,
            subtitleTR, subtitleEN, image,
            detailsTitleTR, detailsTitleEN, detailsTR, detailsEN,
            listTitleTR, listTitleEN, listItemsTR, listItemsEN,
            featuresTitleTR, featuresTitleEN, featureItemsTR, featureItemsEN,
            ctaButtonTextTR, ctaButtonTextEN, ctaButtonLink,
            contentTR, contentEN,
            sortOrder: sortOrder || 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        return NextResponse.json({ success: true, service: newService }, { status: 201 });
    } catch (error) {
        console.error('Services POST Error:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}

// PUT - Update service
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const {
            id, slug, icon, titleTR, titleEN, descTR, descEN,
            subtitleTR, subtitleEN, image,
            detailsTitleTR, detailsTitleEN, detailsTR, detailsEN,
            listTitleTR, listTitleEN, listItemsTR, listItemsEN,
            featuresTitleTR, featuresTitleEN, featureItemsTR, featureItemsEN,
            ctaButtonTextTR, ctaButtonTextEN, ctaButtonLink,
            contentTR, contentEN,
            sortOrder, isActive
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const service = await Service.findByPk(id);
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        await service.update({
            slug: slug || service.slug,
            icon: icon || service.icon,
            titleTR: titleTR || service.titleTR,
            titleEN: titleEN || service.titleEN,
            descTR: descTR || service.descTR,
            descEN: descEN || service.descEN,
            subtitleTR: subtitleTR !== undefined ? subtitleTR : service.subtitleTR,
            subtitleEN: subtitleEN !== undefined ? subtitleEN : service.subtitleEN,
            image: image !== undefined ? image : service.image,
            detailsTitleTR: detailsTitleTR !== undefined ? detailsTitleTR : service.detailsTitleTR,
            detailsTitleEN: detailsTitleEN !== undefined ? detailsTitleEN : service.detailsTitleEN,
            detailsTR: detailsTR !== undefined ? detailsTR : service.detailsTR,
            detailsEN: detailsEN !== undefined ? detailsEN : service.detailsEN,
            listTitleTR: listTitleTR !== undefined ? listTitleTR : service.listTitleTR,
            listTitleEN: listTitleEN !== undefined ? listTitleEN : service.listTitleEN,
            listItemsTR: listItemsTR !== undefined ? listItemsTR : service.listItemsTR,
            listItemsEN: listItemsEN !== undefined ? listItemsEN : service.listItemsEN,
            featuresTitleTR: featuresTitleTR !== undefined ? featuresTitleTR : service.featuresTitleTR,
            featuresTitleEN: featuresTitleEN !== undefined ? featuresTitleEN : service.featuresTitleEN,
            featureItemsTR: featureItemsTR !== undefined ? featureItemsTR : service.featureItemsTR,
            featureItemsEN: featureItemsEN !== undefined ? featureItemsEN : service.featureItemsEN,
            ctaButtonTextTR: ctaButtonTextTR !== undefined ? ctaButtonTextTR : service.ctaButtonTextTR,
            ctaButtonTextEN: ctaButtonTextEN !== undefined ? ctaButtonTextEN : service.ctaButtonTextEN,
            ctaButtonLink: ctaButtonLink !== undefined ? ctaButtonLink : service.ctaButtonLink,
            contentTR: contentTR !== undefined ? contentTR : service.contentTR,
            contentEN: contentEN !== undefined ? contentEN : service.contentEN,
            sortOrder: sortOrder !== undefined ? sortOrder : service.sortOrder,
            isActive: isActive !== undefined ? isActive : service.isActive,
        });

        return NextResponse.json({ success: true, service }, { status: 200 });
    } catch (error) {
        console.error('Services PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

// DELETE - Delete service
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
        }

        await connectToDatabase();

        const service = await Service.findByPk(id);
        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        await service.destroy();

        return NextResponse.json({ success: true, message: 'Service deleted' }, { status: 200 });
    } catch (error) {
        console.error('Services DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
