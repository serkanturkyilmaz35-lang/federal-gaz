import { NextRequest, NextResponse } from 'next/server';
import { Order, connectToDatabase } from '@/lib/models';
import { sendEmail, getOrderCancelledEmail } from '@/lib/email';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Initialize database connection
        await connectToDatabase();

        const { id } = await params;
        const orderId = parseInt(id, 10);

        if (isNaN(orderId)) {
            return NextResponse.json({ success: false, error: 'Invalid order ID' }, { status: 400 });
        }

        const body = await request.json();
        const { reason, note } = body;

        if (!reason) {
            return NextResponse.json({ success: false, error: 'Cancellation reason is required' }, { status: 400 });
        }

        // Find the order
        const order = await Order.findByPk(orderId);

        if (!order) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
        }

        // Get customer email from order details
        // Details is stored as JSON string, need to parse it
        const detailsRaw = order.get('details') as string;
        let details: any = {};

        try {
            details = typeof detailsRaw === 'string' ? JSON.parse(detailsRaw) : detailsRaw || {};
        } catch (e) {
            console.error('Failed to parse order details:', e);
            details = { raw: detailsRaw };
        }

        let customerEmail = '';
        let customerName = 'Müşteri';

        if (details?.customer) {
            customerEmail = details.customer.email || '';
            customerName = details.customer.name || 'Müşteri';
        } else if (details?.raw) {
            // Parse legacy format
            const lines = String(details.raw).split('\n');
            const map: any = {};
            lines.forEach((l: string) => {
                const parts = l.split(':');
                if (parts.length >= 2) {
                    map[parts[0].trim()] = parts.slice(1).join(':').trim();
                }
            });
            customerEmail = map['E-posta'] || '';
            customerName = map['Müşteri'] || 'Müşteri';
        }

        console.log('Cancel order - Customer:', customerName, 'Email:', customerEmail);

        // Update order status to CANCELLED and add cancellation info
        // Preserve ALL existing details and just add cancellation info
        const updatedDetails = {
            ...details,
            cancellation: {
                reason,
                note: note || null,
                cancelledAt: new Date().toISOString(),
            }
        };

        await order.update({
            status: 'CANCELLED',
            details: JSON.stringify(updatedDetails),
        });

        // Send email notification to customer if email exists
        let emailSent = false;
        if (customerEmail) {
            try {
                const emailHtml = getOrderCancelledEmail({
                    orderId,
                    customerName,
                    reason,
                    note: note || undefined,
                });

                await sendEmail({
                    to: customerEmail,
                    subject: `Sipariş İptal Edildi - #${orderId}`,
                    html: emailHtml,
                    replyTo: 'federal.gaz@hotmail.com',
                });
                emailSent = true;
                console.log('✅ Cancellation email sent to:', customerEmail);
            } catch (emailError) {
                console.error('❌ Failed to send cancellation email:', emailError);
            }
        } else {
            console.log('⚠️ No customer email found, skipping email notification');
        }

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
            emailSent,
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, error: `Failed to cancel order: ${errorMessage}` },
            { status: 500 }
        );
    }
}
