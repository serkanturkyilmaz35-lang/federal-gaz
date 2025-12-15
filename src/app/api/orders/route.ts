import { NextResponse } from 'next/server';
import { Order, connectToDatabase } from '@/lib/models';
import { sendEmail, getOrderNotificationEmail, getCustomerOrderConfirmationEmail } from '@/lib/email';
import { verifyToken } from '@/lib/auth';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { cookies } from 'next/headers';

// GET: Fetch all orders (Admin only)
export async function GET(req: Request) {
    try {
        await connectToDatabase();

        // Verify Admin Token
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // Fetch orders sorted by newest first - LIMIT 50 for performance
        const limit = Number(new URL(req.url).searchParams.get('limit')) || 50;
        const offset = Number(new URL(req.url).searchParams.get('offset')) || 0;

        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            // attributes: ['id', 'userId', 'status', 'trackingNumber', 'createdAt', 'details'] // Select only needed
        });

        // Parse 'details' if it's JSON, otherwise return as is (Legacy support)
        const parsedOrders = orders.map(order => {
            let detailsObj = {};
            try {
                detailsObj = JSON.parse(order.details);
            } catch (e) {
                // If parsing fails, it's a legacy string. Wrap it.
                detailsObj = { raw: order.details };
            }

            return {
                id: order.id,
                userId: order.userId,
                status: order.status,
                trackingNumber: order.trackingNumber,
                createdAt: order.createdAt,
                details: detailsObj
            };
        });

        return NextResponse.json({ success: true, orders: parsedOrders });

    } catch (error) {
        console.error('Fetch Orders Error:', error);
        return NextResponse.json({ error: 'Siparişler getirilemedi.' }, { status: 500 });
    }
}

// POST: Create a new order (Public)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, company, email, phone, address, items, products: legacyProduct, amount: legacyAmount, unit: legacyUnit, notes, language = 'TR', recaptchaToken } = body;

        // Verify reCAPTCHA
        const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'order_form');
        if (!recaptchaResult.success) {
            console.warn('reCAPTCHA failed for order form:', recaptchaResult.error);
            return NextResponse.json({
                error: 'Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.'
            }, { status: 400 });
        }

        // Validation
        // Support both new 'items' array OR legacy single product fields (for backward compat if needed, but UI will send items)
        const hasItems = Array.isArray(items) && items.length > 0;
        const hasLegacy = legacyProduct && legacyAmount;

        if (!name || !company || !email || !phone || !address || (!hasItems && !hasLegacy)) {
            return NextResponse.json({ error: 'Tüm zorunlu alanları ve en az bir ürün giriniz.' }, { status: 400 });
        }

        if (hasItems && items.length > 5) {
            return NextResponse.json({ error: 'Tek seferde en fazla 5 ürün sipariş edebilirsiniz.' }, { status: 400 });
        }

        // Check if user is logged in (optional)
        let userId: number | null = null;
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get('auth_token')?.value;
            if (token) {
                const decoded = verifyToken(token) as { id: number };
                if (decoded?.id) userId = decoded.id;
            }
        } catch (e) { }

        await connectToDatabase();

        // Construct structured data object
        const orderData = {
            customer: {
                name,
                company,
                email,
                phone,
                address
            },
            items: hasItems ? items : [{ product: legacyProduct, amount: legacyAmount, unit: legacyUnit }],
            notes: notes || '',
            date: new Date().toISOString()
        };

        // Save as JSON string in 'details' column
        // This is the key change: We store structured data instead of a text blob
        const detailsJson = JSON.stringify(orderData);

        // Create order
        const order = await Order.create({
            userId,
            details: detailsJson,
            status: 'PENDING'
        });

        // Prepare info for emails
        // Format items list for HTML
        const itemsListHtml = orderData.items.map((item: any) =>
            `<li>${item.product} - ${item.amount} ${item.unit}</li>`
        ).join('');

        const itemsString = orderData.items.map((item: any) =>
            `${item.product} (${item.amount} ${item.unit})`
        ).join(', ');

        // Send Admin Email
        try {
            await sendEmail({
                to: 'federal.gaz@hotmail.com',
                replyTo: email,
                subject: `${userId ? '[ÜYE]' : '[MİSAFİR]'} Yeni Sipariş #${order.id} - ${name} (${company})`,
                html: getOrderNotificationEmail({
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone,
                    address: address,
                    products: hasItems ? `<ul>${itemsListHtml}</ul>` : itemsString, // Pass HTML UL or String
                    notes: notes
                })
            });
            console.log(`✅ Order notification email sent to admin for #${order.id}`);
        } catch (emailError) {
            console.error('Failed to send admin order email:', emailError);
        }

        // Send Customer Email with language
        try {
            await sendEmail({
                to: email,
                subject: language === 'EN' ? `✅ Order Received - Federal Gaz #${order.id}` : `✅ Siparişiniz Alındı - Federal Gaz #${order.id}`,
                html: getCustomerOrderConfirmationEmail({
                    orderId: order.id,
                    customerName: name,
                    products: hasItems ? `<ul>${itemsListHtml}</ul>` : itemsString,
                    address: address,
                    notes: notes,
                    language: language as 'TR' | 'EN'
                })
            });
            console.log(`✅ Order confirmation email sent to customer for #${order.id}`);
        } catch (emailError) {
            console.error('Failed to send customer confirmation email:', emailError);
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            message: language === 'EN' ? 'Your order has been received!' : 'Siparişiniz başarıyla alındı!'
        }, { status: 201 });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: 'Sipariş oluşturulurken bir hata oluştu.' }, { status: 500 });
    }
}
