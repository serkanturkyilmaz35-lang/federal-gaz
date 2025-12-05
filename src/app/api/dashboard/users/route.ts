import { NextResponse } from 'next/server';

export async function GET() {
    // TODO: Implement with database
    return NextResponse.json({
        users: [],
        total: 0,
    });
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // TODO: Save to database
        return NextResponse.json({ message: 'User created', data });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
