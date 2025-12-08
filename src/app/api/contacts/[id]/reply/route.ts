import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

function getContactReplyEmail(params: {
    customerName: string;
    originalSubject: string;
    reply: string;
}) {
    // Use environment variable, or auto-detect based on NODE_ENV
    // Use environment variable, or auto-detect based on NODE_ENV
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

    // Ensure logo is always pulled from a public source to avoid broken images in emails
    // If testing locally, localhost won't work in Gmail/Outlook.
    const logoUrl = 'https://www.federalgaz.com/dashboard-logo.png'; // Assuming this exists or using a known placeholder
    // Alternatively, if the file is local to the project public folder, we should use the domain.
    // For now, let's stick to the domain logic but if we are local, and sending to real email, we can't show local image.
    // So we'll try to use the production domain for the LOGO Specifically if possible.
    const imageBase = 'https://www.federalgaz.com';
    const { customerName, originalSubject, reply } = params;

    // Convert newlines to <br> for HTML
    const formattedReply = reply.replace(/\n/g, '<br>');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Yanıt: ${originalSubject} - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.federalgaz.com/logo-clean.png" alt="Federal Gaz" style="max-width: 60px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #8B0000; margin: 10px 0 5px 0;">Mesajınıza Yanıt</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Konu: ${originalSubject}</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">
            Sayın <strong>${customerName}</strong>,
        </p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B0000;">
            <p style="margin: 0; color: #333; line-height: 1.8;">
                ${formattedReply}
            </p>
        </div>
        
        <p style="font-size: 14px; color: #666;">
            Başka sorularınız varsa aşağıdaki butona tıklayarak iletişim formumuzdan bize ulaşabilirsiniz.
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="${baseUrl}/iletisim" style="background-color: #8B0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Yanıt Gönder
            </a>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">Bizimle iletişime geçmek için:</p>
            <p style="margin: 5px 0;">📞 (0312) 395 35 95</p>
            <p style="margin: 5px 0;">📧 federal.gaz@hotmail.com</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            Saygılarımızla,<br>
            <strong>Federal Gaz Ekibi</strong>
        </p>
    </div>
</body>
</html>
    `;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contactId = parseInt(id, 10);

        if (isNaN(contactId)) {
            return NextResponse.json(
                { error: "Geçersiz iletişim ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { reply, customerEmail, customerName, originalSubject } = body;

        if (!reply || !customerEmail) {
            return NextResponse.json(
                { error: "Yanıt ve müşteri e-postası gerekli" },
                { status: 400 }
            );
        }

        // Generate email HTML
        const emailHtml = getContactReplyEmail({
            customerName: customerName || "Değerli Müşterimiz",
            originalSubject: originalSubject || "İletişim Formu",
            reply,
        });

        // Send email
        const result = await sendEmail({
            to: customerEmail,
            subject: `Re: ${originalSubject || "İletişim Formu"} - Federal Gaz`,
            html: emailHtml,
        });

        if (!result.success) {
            console.error("Email send failed:", result.error);
            return NextResponse.json(
                { error: "E-posta gönderilirken bir hata oluştu" },
                { status: 500 }
            );
        }

        // Update contact status in database to "replied"
        const { ContactRequest, connectToDatabase } = await import('@/lib/models');
        await connectToDatabase();
        await ContactRequest.update({ status: 'replied' }, { where: { id: contactId } });

        return NextResponse.json({
            success: true,
            message: "Yanıt başarıyla gönderildi",
        });
    } catch (error) {
        console.error("Contact reply error:", error);
        return NextResponse.json(
            { error: "Yanıt gönderilirken bir hata oluştu" },
            { status: 500 }
        );
    }
}
