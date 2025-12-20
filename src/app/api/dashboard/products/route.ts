import { NextRequest, NextResponse } from 'next/server';
import { Product, connectToDatabase } from '@/lib/models';

// GET - Get all products
export async function GET() {
    try {
        await connectToDatabase();

        const products = await Product.findAll({
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Products GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { slug, slugEN, titleTR, titleEN, descTR, descEN, contentTR, contentEN, image, sortOrder, listIcon, ctaIcon } = body;

        if (!slug || !slugEN || !titleTR || !titleEN || !descTR || !descEN || !image) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
        }

        const product = await Product.create({
            slug,
            slugEN,
            titleTR,
            titleEN,
            descTR,
            descEN,
            contentTR: contentTR || '',
            contentEN: contentEN || '',
            image,
            sortOrder: sortOrder || 0,
            isActive: true,
            listIcon: listIcon || 'check',
            ctaIcon: ctaIcon || 'contact_support',
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Products POST Error:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const product = await Product.findByPk(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await product.update(updates);

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Products PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        const product = await Product.findByPk(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await product.destroy();

        return NextResponse.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        console.error('Products DELETE Error:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
