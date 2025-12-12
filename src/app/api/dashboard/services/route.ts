'use server';

import { NextResponse } from 'next/server';
import { Service, connectToDatabase } from '@/lib/models';

// GET - List all services
export async function GET() {
    try {
        await connectToDatabase();

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
        const { slug, icon, titleTR, titleEN, descTR, descEN, contentTR, contentEN, sortOrder, isActive } = body;

        if (!slug || !titleTR || !titleEN || !descTR || !descEN) {
            return NextResponse.json({ error: 'Required fields: slug, titleTR, titleEN, descTR, descEN' }, { status: 400 });
        }

        await connectToDatabase();

        const service = await Service.create({
            slug,
            icon: icon || 'build',
            titleTR,
            titleEN,
            descTR,
            descEN,
            contentTR: contentTR || '',
            contentEN: contentEN || '',
            sortOrder: sortOrder || 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        return NextResponse.json({ success: true, service }, { status: 201 });
    } catch (error) {
        console.error('Services POST Error:', error);
        return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
    }
}

// PUT - Update service
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, slug, icon, titleTR, titleEN, descTR, descEN, contentTR, contentEN, sortOrder, isActive } = body;

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
