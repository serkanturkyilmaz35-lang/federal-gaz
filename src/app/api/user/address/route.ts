import { NextResponse } from 'next/server';
import { Address, connectToDatabase } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token) as any;
    return decoded ? decoded.id : null;
}

export async function GET(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const addresses = await Address.findAll({
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { title, address } = await req.json();
        if (!title || !address) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        await connectToDatabase();

        // Count existing addresses
        const count = await Address.count({ where: { userId } });
        if (count >= 3) {
            return NextResponse.json({ error: 'Maksimum 3 adres ekleyebilirsiniz.' }, { status: 400 });
        }

        // Unset previous defaults
        await Address.update({ isDefault: false }, { where: { userId } });

        const newAddress = await Address.create({
            userId,
            title,
            address,
            isDefault: true // New address is always default
        });

        return NextResponse.json({ address: newAddress }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await connectToDatabase();
        const deleted = await Address.destroy({ where: { id, userId } });

        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id, title, address } = await req.json();
        if (!id || !title || !address) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        await connectToDatabase();

        const [updated] = await Address.update(
            { title, address },
            { where: { id, userId } }
        );

        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Set address as default
export async function PATCH(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'Missing address ID' }, { status: 400 });

        await connectToDatabase();

        // First, unset all addresses as non-default
        await Address.update({ isDefault: false }, { where: { userId } });

        // Then set the selected address as default
        const [updated] = await Address.update(
            { isDefault: true },
            { where: { id, userId } }
        );

        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Varsayılan adres güncellendi' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
