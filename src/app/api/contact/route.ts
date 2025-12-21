import { NextResponse } from 'next/server';
import { ContactRequest, connectToDatabase } from '@/lib/models';
import { decryptRequest } from '@/lib/server-secure';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { name, email, phone, message, company, recaptchaToken } = await decryptRequest(req);

        // Verify reCAPTCHA
        const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'contact_form');
        if (!recaptchaResult.success) {
            console.warn('reCAPTCHA failed for contact form:', recaptchaResult.error);
            return NextResponse.json({
                error: 'Güvenlik doğrulaması başarısız. Lütfen sayfayı yenileyip tekrar deneyin.'
            }, { status: 400 });
        }

        // 1. Save to Database
        await ContactRequest.create({
            name,
            email,
            phone,
            company,
            message,
            status: 'new'
        });

        // 2. Send Email using centralized email function
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>İletişim Formu - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://www.federalgaz.com/logo-clean.png" alt="Federal Gaz" style="max-width: 60px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #b13329; margin: 10px 0 5px 0;">📬 Yeni İletişim Mesajı</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">${new Date().toLocaleString('tr-TR')}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Gönderen Bilgileri</h3>
            <p style="margin: 8px 0;"><strong>Ad Soyad:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong>E-posta:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 8px 0;"><strong>Telefon:</strong> ${phone || '-'}</p>
            <p style="margin: 8px 0;"><strong>Firma:</strong> ${company || '-'}</p>
        </div>
        
        <div style="background-color: #f0f7f0; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">Mesaj</h3>
            <p style="margin: 5px 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            Bu e-posta ${email} adresinden gönderilen iletişim formu aracılığıyla otomatik oluşturulmuştur.<br>
            Yanıtlamak için doğrudan bu e-postayı yanıtlayabilirsiniz.
        </p>
    </div>
</body>
</html>
        `;

        try {
            const emailResult = await sendEmail({
                to: 'federal.gaz@hotmail.com',
                subject: `İletişim Formu: ${name}`,
                html: emailHtml,
                replyTo: email
            });

            if (!emailResult.success) {
                console.error('Contact form email failed:', emailResult.error);
                // Don't fail the request - form was saved to database
            }
        } catch (emailError) {
            console.error('Contact form email error:', emailError);
            // Don't fail the request - form was saved to database
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Contact Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

