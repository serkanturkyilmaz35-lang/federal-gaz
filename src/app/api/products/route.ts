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

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Products GET Error:', error);
        return NextResponse.json({ products: [] });
    }
}
