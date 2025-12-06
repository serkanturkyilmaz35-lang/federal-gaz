import { Resend } from 'resend';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    // Lazy initialization to prevent build-time error if env var is missing
    const apiKey = process.env.RESEND_API_KEY;

    // During build or if key is missing, return error or mock success
    if (!apiKey) {
        console.warn('RESEND_API_KEY is missing. Email sending skipped.');
        return { success: false, error: 'Missing API Key' };
    }

    const resend = new Resend(apiKey);

    try {
        // Use verified domain email - falls back to resend.dev for testing
        const fromEmail = process.env.EMAIL_FROM || 'Federal Gaz <onboarding@resend.dev>';

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [to],
            subject,
            html,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }

        console.log('Email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error };
    }
}

export function getPasswordResetEmail(resetLink: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Şifre Sıfırlama - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/logo.jpg" alt="Federal Gaz Logo" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Şifre Sıfırlama Talebi</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">Merhaba,</p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #8B0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Şifremi Sıfırla
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Bu bağlantı 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            Federal Gaz - Teknik ve Tıbbi Gaz Tedarikçiniz<br>
            © ${new Date().getFullYear()} Tüm hakları saklıdır.
        </p>
    </div>
</body>
</html>
    `;
}

export function getOrderNotificationEmail(orderDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    products: string;
    notes?: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Yeni Sipariş - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/logo.jpg" alt="Federal Gaz Logo" style="max-width: 150px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #8B0000; margin: 10px 0 5px 0;">🛒 Yeni Sipariş!</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">${new Date().toLocaleString('tr-TR')}</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Müşteri Bilgileri</h3>
            <p style="margin: 5px 0;"><strong>İsim:</strong> ${orderDetails.customerName}</p>
            <p style="margin: 5px 0;"><strong>E-posta:</strong> ${orderDetails.customerEmail}</p>
            <p style="margin: 5px 0;"><strong>Telefon:</strong> ${orderDetails.customerPhone}</p>
            <p style="margin: 5px 0;"><strong>Adres:</strong> ${orderDetails.address}</p>
        </div>
        
        <div style="background-color: #f0f7f0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Sipariş Detayları</h3>
            <p style="margin: 5px 0;"><strong>Ürünler:</strong> ${orderDetails.products}</p>
            ${orderDetails.notes ? `<p style="margin: 5px 0;"><strong>Notlar:</strong> ${orderDetails.notes}</p>` : ''}
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            Bu e-posta otomatik olarak gönderilmiştir.<br>
            Federal Gaz Sipariş Sistemi
        </p>
    </div>
</body>
</html>
    `;
}

// Customer order confirmation email
export function getCustomerOrderConfirmationEmail(orderDetails: {
    orderId: number;
    customerName: string;
    products: string;
    address: string;
    notes?: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Siparişiniz Alındı - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/logo.jpg" alt="Federal Gaz Logo" style="max-width: 150px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #28a745; margin: 10px 0 5px 0;">✅ Siparişiniz Alındı!</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Sipariş No: #${orderDetails.orderId}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; text-align: center;">
            Sayın <strong>${orderDetails.customerName}</strong>,<br>
            Siparişiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.
        </p>
        
        <div style="background-color: #f0f7f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">📦 Sipariş Özeti</h3>
            <p style="margin: 5px 0;"><strong>Ürün:</strong> ${orderDetails.products}</p>
            <p style="margin: 5px 0;"><strong>Teslimat Adresi:</strong> ${orderDetails.address}</p>
            ${orderDetails.notes ? `<p style="margin: 5px 0;"><strong>Notlar:</strong> ${orderDetails.notes}</p>` : ''}
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏳ <strong>Durumu:</strong> Siparişiniz değerlendiriliyor. Size en kısa sürede dönüş yapacağız.
            </p>
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
