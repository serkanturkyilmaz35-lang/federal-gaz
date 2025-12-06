import { NextResponse } from 'next/server';
import { Order, User, connectToDatabase } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendEmail, getOrderNotificationEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token) as { id: number; email: string };
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { details, address, products, notes } = await req.json();
        if (!details) return NextResponse.json({ error: 'Missing details' }, { status: 400 });

        await connectToDatabase();

        // Fetch user for email info
        const user = await User.findByPk(decoded.id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const order = await Order.create({
            userId: decoded.id,
            details,
            status: 'PENDING'
        });

        // Send Email notification to Federal Gaz
        try {
            await sendEmail({
                to: 'federal.gaz@hotmail.com',
                subject: `🛒 Yeni Sipariş #${order.id} - ${user.name}`,
                html: getOrderNotificationEmail({
                    customerName: user.name,
                    customerEmail: user.email,
                    customerPhone: user.phone || '-',
                    address: address || details,
                    products: products || details,
                    notes: notes
                })
            });
            console.log(`✅ Order notification email sent for #${order.id}`);
        } catch (emailError) {
            console.error('Failed to send order email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
