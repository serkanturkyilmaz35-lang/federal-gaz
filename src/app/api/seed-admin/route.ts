import { NextResponse } from 'next/server';
import { connectToDatabase, AdminUser } from '@/lib/models';

export async function GET() {
    try {
        await connectToDatabase();

        const [user, created] = await AdminUser.findOrCreate({
            where: { email: 'serkanturkyilmaz35@gmail.com' },
            defaults: {
                name: 'Serkan Türkyılmaz',
                email: 'serkanturkyilmaz35@gmail.com',
                role: 'admin',
                isActive: true
            }
        });

        if (created) {
            return NextResponse.json({ message: 'Admin user created successfully', user });
        } else {
            return NextResponse.json({ message: 'Admin user already exists', user });
        }
    } catch (error) {
        console.error('Seeding Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
