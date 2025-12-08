import { NextResponse } from 'next/server';
import { Order, connectToDatabase } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendEmail, getOrderStatusUpdateEmail, getOrderUpdateEmail } from '@/lib/email';

// Helper to verify admin - Rebuild Trigger
async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    return verifyToken(token) as { id: number; role?: string };
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        if (!await checkAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const order = await Order.findByPk(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Parse details
        let detailsObj = {};
        try {
            detailsObj = JSON.parse(order.details);
        } catch (e) {
            detailsObj = { raw: order.details };
        }

        const parsedOrder = {
            id: order.id,
            userId: order.userId,
            status: order.status,
            trackingNumber: order.trackingNumber,
            createdAt: order.createdAt,
            details: detailsObj
        };

        return NextResponse.json({ success: true, order: parsedOrder });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        if (!await checkAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { details, status } = body;

        await connectToDatabase();
        const order = await Order.findByPk(id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Parse current details to get customer info for emails
        let currentDetails: any = {};
        try {
            currentDetails = JSON.parse(order.details);
        } catch (e) {
            currentDetails = { raw: order.details };
        }

        // Handle nested customer object or flat fields
        const customer = currentDetails.customer || currentDetails;
        const customerEmail = customer.email || customer.customerEmail;
        const customerName = customer.name || customer.customerName || 'Sayın Müşteri';

        // 1. Status Update Logic
        const originalStatus = order.status;
        if (status && status !== originalStatus) {
            order.status = status;
        }

        // 2. Details Update Logic
        let detailsUpdated = false;
        if (details) {
            const detailsString = typeof details === 'string' ? details : JSON.stringify(details);
            order.details = detailsString;
            detailsUpdated = true;
        }

        // SAVE FIRST to ensure DB validation passes
        await order.save();

        // 3. Send Emails AFTER Save (Fail-safe)
        if (customerEmail) {
            // Status Email
            if (status && status !== originalStatus) {
                try {
                    const statusSubjects: Record<string, string> = {
                        PENDING: "Siparişiniz Alındı",
                        PREPARING: "Siparişiniz Hazırlanıyor",
                        SHIPPING: "Siparişiniz Yola Çıktı",
                        COMPLETED: "Siparişiniz Teslim Edildi",
                        CANCELLED: "Siparişiniz İptal Edildi"
                    };
                    const subject = `${statusSubjects[status] || 'Sipariş Durumu Güncellendi'} #${order.id} - Federal Gaz`;

                    // Detached sending for speed, but after DB commit
                    sendEmail({
                        to: customerEmail,
                        subject: subject,
                        html: getOrderStatusUpdateEmail({
                            orderId: order.id,
                            customerName,
                            newStatus: status,
                            notes: currentDetails.notes
                        })
                    }).catch(console.error);

                    console.log(`✅ Status email triggered for ${customerEmail}`);
                } catch (emailErr) {
                    console.error('Failed to trigger status email:', emailErr);
                }
            }

            // Update Email (if details changed)
            if (detailsUpdated) {
                try {
                    const newDetails = typeof details === 'string' ? JSON.parse(details) : details;

                    // --- Change Detection Logic ---
                    const changes: string[] = [];
                    const oldItems = currentDetails.items || [];
                    const newItems = newDetails.items || [];

                    const oldMap = new Map();
                    oldItems.forEach((i: any) => oldMap.set(i.product, i));

                    const newMap = new Map();
                    newItems.forEach((i: any) => newMap.set(i.product, i));

                    // Check for removals and updates
                    oldMap.forEach((oldItem, key) => {
                        const newItem = newMap.get(key);
                        if (!newItem) {
                            changes.push(`❌ <strong>${key}</strong> siparişinizden kaldırıldı (İsteğiniz üzerine).`);
                        } else if (oldItem.amount !== newItem.amount) {
                            changes.push(`✏️ <strong>${key}</strong> miktarı güncellendi: ${oldItem.amount} ${oldItem.unit} → ${newItem.amount} ${newItem.unit}`);
                        }
                    });

                    // Check for additions
                    newMap.forEach((newItem, key) => {
                        if (!oldMap.has(key)) {
                            changes.push(`✅ <strong>${key}</strong> siparişinize eklendi: ${newItem.amount} ${newItem.unit}`);
                        }
                    });

                    if (changes.length === 0) {
                        changes.push("Sipariş detaylarınız güncellendi.");
                    }
                    // -----------------------------

                    const listItems = newItems.length > 0 ? newItems : oldItems; // Fallback
                    const productsList = listItems.map((i: any) => `${i.product} (${i.amount} ${i.unit})`).join(', ');

                    sendEmail({
                        to: customerEmail,
                        subject: `Siparişiniz Güncellendi #${order.id}`,
                        html: getOrderUpdateEmail({
                            orderId: order.id,
                            customerName,
                            products: productsList,
                            changes: changes,
                            notes: newDetails.notes // Use new notes
                        })
                    }).catch(console.error);
                } catch (emailErr) { console.error(emailErr); }
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
