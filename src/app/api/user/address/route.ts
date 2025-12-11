import { NextResponse } from 'next/server';
import { Address, connectToDatabase } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { decryptRequest, encryptResponse } from '@/lib/server-secure';

async function getUser(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const decoded = verifyToken(token) as { id: number };
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

        // Use encryptResponse
        return await encryptResponse({ addresses });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Decrypt Request Body
        const { title, address } = await decryptRequest(req);
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

        return await encryptResponse({ address: newAddress }, 201);
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

        return await encryptResponse({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Decrypt Request Body
        const { id, title, address } = await decryptRequest(req);
        if (!id || !title || !address) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        await connectToDatabase();

        const [updated] = await Address.update(
            { title, address },
            { where: { id, userId } }
        );

        if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return await encryptResponse({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Set address as default
export async function PATCH(req: Request) {
    try {
        const userId = await getUser(req);
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Decrypt Request Body
        const { id } = await decryptRequest(req);
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

        return await encryptResponse({ success: true, message: 'Varsayılan adres güncellendi' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
