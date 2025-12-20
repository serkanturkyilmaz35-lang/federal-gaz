import { NextResponse } from 'next/server';
import { Product, connectToDatabase } from '@/lib/models';

// GET - Get all active products (public endpoint)
export async function GET() {
    try {
        await connectToDatabase();

        const products = await Product.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });

        // Cache for 1 hour, stale-while-revalidate for 1 day
        return NextResponse.json(
            { products },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                }
            }
        );
    } catch (error) {
        console.error('Products GET Error:', error);
        return NextResponse.json({ products: [] });
    }
}
