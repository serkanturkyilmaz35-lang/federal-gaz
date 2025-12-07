import { NextResponse } from 'next/server';
import { Order, connectToDatabase } from '@/lib/models';
import { sendEmail, getOrderNotificationEmail, getCustomerOrderConfirmationEmail } from '@/lib/email';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, company, email, phone, product, amount, unit, address, notes } = body;

        // Validate required fields
        if (!name || !company || !email || !phone || !product || !amount || !address) {
            return NextResponse.json({ error: 'Tüm zorunlu alanları doldurunuz.' }, { status: 400 });
        }

        // Check if user is logged in
        let userId: number | null = null;
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get('auth_token')?.value;
            if (token) {
                const decoded = verifyToken(token) as { id: number };
                if (decoded?.id) {
                    userId = decoded.id;
                }
            }
        } catch (e) {
            // Not logged in, continue with null userId
        }

        await connectToDatabase();

        // Create order details string
        const details = `
Müşteri: ${name}
Firma: ${company}
E-posta: ${email}
Telefon: ${phone}
Ürün: ${product}
Miktar: ${amount} ${unit}
Adres: ${address}
${notes ? `Notlar: ${notes}` : ''}
        `.trim();

        // Create order in database
        const order = await Order.create({
            userId,
            details,
            status: 'PENDING'
        });

        // Send email notification to Federal Gaz
        try {
            await sendEmail({
                to: 'federal.gaz@hotmail.com',
                replyTo: email,
                subject: `🛒 Yeni Sipariş #${order.id} - ${name} (${company})`,
                html: getOrderNotificationEmail({
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone,
                    address: address,
                    products: `${product} - ${amount} ${unit}`,
                    notes: notes
                })
            });
            console.log(`✅ Order notification email sent to admin for #${order.id}`);
        } catch (emailError) {
            console.error('Failed to send admin order email:', emailError);
        }

        // Send confirmation email to customer
        try {
            await sendEmail({
                to: email,
                subject: `✅ Siparişiniz Alındı - Federal Gaz #${order.id}`,
                html: getCustomerOrderConfirmationEmail({
                    orderId: order.id,
                    customerName: name,
                    products: `${product} - ${amount} ${unit}`,
                    address: address,
                    notes: notes
                })
            });
            console.log(`✅ Order confirmation email sent to customer for #${order.id}`);
        } catch (emailError) {
            console.error('Failed to send customer confirmation email:', emailError);
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            message: 'Siparişiniz başarıyla alındı!'
        }, { status: 201 });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'Sipariş oluşturulurken bir hata oluştu.' }, { status: 500 });
    }
}
