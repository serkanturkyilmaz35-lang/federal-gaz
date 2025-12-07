import { NextRequest, NextResponse } from "next/server";
import { Order, User, connectToDatabase } from "@/lib/models";
import { sendEmail } from "@/lib/email";

type OrderStatus = "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";

// Status labels for email
const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Beklemede",
    PREPARING: "Hazırlanıyor",
    DELIVERED: "Teslim Edildi",
    CANCELLED: "İptal Edildi",
};

// Status colors for email
const statusColors: Record<OrderStatus, string> = {
    PENDING: "#3b82f6",
    PREPARING: "#eab308",
    DELIVERED: "#22c55e",
    CANCELLED: "#ef4444",
};

function getOrderStatusEmail(params: {
    customerName: string;
    orderId: number;
    status: OrderStatus;
    trackingNumber?: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const { customerName, orderId, status, trackingNumber } = params;

    const statusLabel = statusLabels[status];
    const statusColor = statusColors[status];

    let statusMessage = "";
    let statusIcon = "";

    switch (status) {
        case "PREPARING":
            statusIcon = "📦";
            statusMessage = "Siparişiniz hazırlanmaya başlandı. En kısa sürede teslim edilecektir.";
            break;
        case "DELIVERED":
            statusIcon = "✅";
            statusMessage = "Siparişiniz başarıyla teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz!";
            break;
        case "CANCELLED":
            statusIcon = "❌";
            statusMessage = "Siparişiniz iptal edildi. Sorularınız için bizimle iletişime geçebilirsiniz.";
            break;
        default:
            statusIcon = "⏳";
            statusMessage = "Siparişiniz değerlendiriliyor.";
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sipariş Durumu Güncellendi - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/logo.jpg" alt="Federal Gaz Logo" style="max-width: 150px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: ${statusColor}; margin: 10px 0 5px 0;">${statusIcon} Sipariş Durumu Güncellendi</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Sipariş No: #${orderId}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; text-align: center;">
            Sayın <strong>${customerName}</strong>,<br>
            Siparişinizin durumu güncellendi.
        </p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor}; text-align: center;">
            <p style="margin: 0; font-size: 18px; color: ${statusColor}; font-weight: bold;">
                ${statusLabel}
            </p>
        </div>
        
        <p style="font-size: 16px; color: #333; text-align: center; line-height: 1.6;">
            ${statusMessage}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/profil" style="background-color: #8B0000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Siparişimi Görüntüle
            </a>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">Bizimle iletişime geçmek için:</p>
            <p style="margin: 5px 0;">📞 (0312) 395 35 95</p>
            <p style="margin: 5px 0;">📧 federal.gaz@hotmail.com</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            Bizi tercih ettiğiniz için teşekkür ederiz!<br>
            <strong>Federal Gaz</strong> - Güvenilir Gaz Çözümleri
        </p>
    </div>
</body>
</html>
    `;
}

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
        const validStatuses: OrderStatus[] = ["PENDING", "PREPARING", "DELIVERED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Geçersiz durum" },
                { status: 400 }
            );
        }

        // Find the order
        const order = await Order.findByPk(orderId, {
            include: [{ model: User, as: "User" }],
        });

        if (!order) {
            return NextResponse.json(
                { error: "Sipariş bulunamadı" },
                { status: 404 }
            );
        }

        // Update order
        const updateData: { status: OrderStatus; trackingNumber?: string } = { status };
        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        await order.update(updateData);

        // Send email notification to customer
        if (order.userId) {
            const user = await User.findByPk(order.userId);
            if (user?.email) {
                const emailHtml = getOrderStatusEmail({
                    customerName: user.name,
                    orderId: order.id,
                    status,
                    trackingNumber,
                });

                await sendEmail({
                    to: user.email,
                    subject: `Sipariş Durumu: ${statusLabels[status]} - Federal Gaz`,
                    html: emailHtml,
                });
            }
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
