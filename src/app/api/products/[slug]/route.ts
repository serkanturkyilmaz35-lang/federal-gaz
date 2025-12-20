import { NextRequest, NextResponse } from 'next/server';
import { Product, connectToDatabase } from '@/lib/models';
import { Op } from 'sequelize';

// GET - Get single product by slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await connectToDatabase();

        const { slug } = await params;

        // Find by Turkish or English slug
        const product = await Product.findOne({
            where: {
                [Op.or]: [
                    { slug: slug },
                    { slugEN: slug }
                ],
                isActive: true
            }
        });

        if (!product) {
            return NextResponse.json({ product: null }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Product GET Error:', error);
        return NextResponse.json({ product: null, error: 'Failed to fetch product' }, { status: 500 });
    }
}
