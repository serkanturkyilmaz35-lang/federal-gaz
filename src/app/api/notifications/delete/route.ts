import { NextResponse } from 'next/server';
import { connectToDatabase, NotificationRead } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
        }

        const payload = verifyToken(token) as { id: number } | null;
        if (!payload || !payload.id) {
            return NextResponse.json({ error: 'Geçersiz token' }, { status: 401 });
        }

        const { notificationIds } = await request.json();

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json({ error: 'notificationIds array required' }, { status: 400 });
        }

        await connectToDatabase();

        // Mark notifications as deleted for this user
        for (const notificationId of notificationIds) {
            const [record] = await NotificationRead.findOrCreate({
                where: { userId: payload.id, notificationId },
                defaults: { userId: payload.id, notificationId }
            });
            // Update deletedAt
            await record.update({ deletedAt: new Date() });
        }

        return NextResponse.json({ success: true, message: 'Bildirimler silindi' });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
