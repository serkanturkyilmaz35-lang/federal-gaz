import { NextRequest, NextResponse } from "next/server";
import { Order, User, connectToDatabase } from "@/lib/models";
import { sendEmail, getOrderStatusUpdateEmail } from "@/lib/email";

type OrderStatus = "PENDING" | "PREPARING" | "SHIPPING" | "COMPLETED" | "CANCELLED";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const orderId = parseInt(id, 10);

        if (isNaN(orderId)) {
            return NextResponse.json(
                { error: "Geçersiz sipariş ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { status, trackingNumber } = body;

        // Validate status
        const validStatuses: OrderStatus[] = ["PENDING", "PREPARING", "SHIPPING", "COMPLETED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Geçersiz durum" },
                { status: 400 }
            );
        }

        // Find the order
        const order = await Order.findByPk(orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Sipariş bulunamadı" },
                { status: 404 }
            );
        }

        // Parse details to get customer info
        let currentDetails: any = {};
        try {
            currentDetails = JSON.parse(order.details);
        } catch (e) {
            currentDetails = { raw: order.details };
        }

        const customer = currentDetails.customer || currentDetails;
        const customerEmail = customer.email || customer.customerEmail;
        const customerName = customer.name || customer.customerName || 'Sayın Müşteri';

        // Update order
        const updateData: { status: OrderStatus; trackingNumber?: string } = { status };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        await order.update(updateData);

        // Send email notification to customer
        if (customerEmail) {
            // Determine Subject based on Status
            const statusSubjects: Record<string, string> = {
                PENDING: "Siparişiniz Alındı",
                PREPARING: "Siparişiniz Hazırlanıyor",
                SHIPPING: "Siparişiniz Yola Çıktı",
                COMPLETED: "Siparişiniz Teslim Edildi",
                CANCELLED: "Siparişiniz İptal Edildi"
            };

            const subject = `${statusSubjects[status] || 'Sipariş Durumu Güncellendi'} #${order.id} - Federal Gaz`;

            await sendEmail({
                to: customerEmail,
                subject: subject,
                html: getOrderStatusUpdateEmail({
                    orderId: order.id,
                    customerName,
                    newStatus: status,
                    notes: currentDetails.notes
                }),
            });
            console.log(`✅ Status email sent to ${customerEmail}`);
        }

        return NextResponse.json({
            success: true,
            message: "Sipariş durumu güncellendi",
            order: {
                id: order.id,
                status: order.status,
                trackingNumber: order.trackingNumber,
            },
        });
    } catch (error) {
        console.error("Order status update error:", error);
        return NextResponse.json(
            { error: "Sipariş durumu güncellenirken bir hata oluştu" },
            { status: 500 }
        );
    }
}
