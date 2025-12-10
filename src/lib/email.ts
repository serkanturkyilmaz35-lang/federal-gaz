import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}

// ==================== BREVO HTTP API (FASTEST) ====================
// HTTP API is much faster than SMTP because it doesn't require TCP handshake
async function sendEmailViaAPI({ to, subject, html, replyTo }: EmailOptions): Promise<{ success: boolean; data?: { id: string }; error?: unknown }> {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'BREVO_API_KEY is missing' };
    }

    // Replace logo placeholder with hosted URL
    const logoUrl = 'https://www.federalgaz.com/logo-clean.png';
    const finalHtml = html.replace(/cid:logo/g, logoUrl);

    // Create text version from HTML
    const textVersion = html.replace(/<[^>]*>?/gm, '');

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                sender: {
                    name: 'Federal Gaz',
                    email: 'noreply@federalgaz.com'
                },
                to: [{ email: to }],
                subject,
                htmlContent: finalHtml,
                textContent: textVersion,
                replyTo: replyTo ? { email: replyTo } : undefined,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Brevo API error:', response.status, errorData);
            return { success: false, error: errorData };
        }

        const data = await response.json();
        console.log('Email sent via Brevo API:', data.messageId);
        return { success: true, data: { id: data.messageId } };
    } catch (error) {
        console.error('Brevo API request failed:', error);
        return { success: false, error };
    }
}

// ==================== BREVO SMTP (FALLBACK) ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedTransporter: any = null;

const getTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
        return null;
    }

    // Use port 587 with STARTTLS (more compatible)
    cachedTransporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // Use STARTTLS
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        connectionTimeout: 10000, // 10 second connection timeout
        greetingTimeout: 10000,   // 10 second greeting timeout
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    return cachedTransporter;
};

async function sendEmailViaSMTP({ to, subject, html, replyTo }: EmailOptions): Promise<{ success: boolean; data?: { id: string }; error?: unknown }> {
    const transporter = getTransporter();

    if (!transporter) {
        return { success: false, error: 'Missing SMTP credentials' };
    }

    try {
        const fromEmail = process.env.EMAIL_FROM || 'Federal Gaz <noreply@federalgaz.com>';
        const logoUrl = 'https://www.federalgaz.com/logo-clean.png';
        const finalHtml = html.replace(/cid:logo/g, logoUrl);
        const textVersion = html.replace(/<[^>]*>?/gm, '');

        const info = await transporter.sendMail({
            from: fromEmail,
            to,
            subject,
            html: finalHtml,
            text: textVersion,
            replyTo,
            headers: {
                'X-Entity-Ref-ID': new Date().getTime().toString(),
                'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`,
                'Precedence': 'bulk',
            }
        });

        console.log('Email sent via SMTP:', info.messageId);
        return { success: true, data: { id: info.messageId } };
    } catch (error) {
        console.error('SMTP email error:', error);
        return { success: false, error };
    }
}

// ==================== MAIN SEND EMAIL FUNCTION ====================
// Uses HTTP API first (fastest), falls back to SMTP if API fails
export async function sendEmail(options: EmailOptions) {
    const emailStartTime = Date.now();
    const apiKey = process.env.BREVO_API_KEY;

    console.log(`[EMAIL] Starting email send to ${options.to}`);
    console.log(`[EMAIL] BREVO_API_KEY present: ${!!apiKey}, length: ${apiKey?.length || 0}`);

    // Try HTTP API first (much faster - no TCP handshake needed)
    if (apiKey) {
        console.log('[EMAIL] Using Brevo HTTP API...');
        const apiStartTime = Date.now();
        const apiResult = await sendEmailViaAPI(options);
        console.log(`[EMAIL] API call completed in ${Date.now() - apiStartTime}ms, success: ${apiResult.success}`);

        if (apiResult.success) {
            console.log(`[EMAIL] Total email time: ${Date.now() - emailStartTime}ms via API`);
            return apiResult;
        }
        console.warn('[EMAIL] Brevo API failed, error:', apiResult.error, 'falling back to SMTP...');
    } else {
        console.log('[EMAIL] No API key, using SMTP directly...');
    }

    // Fallback to SMTP
    return sendEmailViaSMTP(options);
}

export function getPasswordResetEmail(resetLink: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');
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
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
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
            © 2014 Tüm hakları saklıdır.
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');
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
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');
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
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
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

// Order Status Update Email
export function getOrderStatusUpdateEmail(orderDetails: {
    orderId: number;
    customerName: string;
    newStatus: string;
    notes?: string;
}) {
    let statusText = '';
    let statusColor = '#666';
    let statusMessage = '';

    switch (orderDetails.newStatus) {
        case 'PENDING':
            statusText = 'Beklemede';
            statusColor = '#eab308'; // Yellow
            statusMessage = 'Siparişiniz alındı ve onay bekliyor.';
            break;
        case 'PREPARING':
            statusText = 'Hazırlanıyor';
            statusColor = '#3b82f6'; // Blue
            statusMessage = 'Siparişiniz hazırlanmaya başlandı.';
            break;
        case 'SHIPPING':
            statusText = 'Yola Çıktı';
            statusColor = '#a855f7'; // Purple
            statusMessage = 'Siparişiniz dağıtıma çıkarıldı ve yola çıktı.';
            break;
        case 'COMPLETED':
            statusText = 'Teslim Edildi';
            statusColor = '#22c55e'; // Green
            statusMessage = 'Siparişiniz başarıyla teslim edildi. Bizi tercih ettiğiniz için teşekkür ederiz.';
            break;
        case 'CANCELLED':
            statusText = 'İptal Edildi';
            statusColor = '#ef4444'; // Red
            statusMessage = 'Siparişiniz iptal edildi.';
            break;
        default:
            statusText = orderDetails.newStatus;
            statusMessage = 'Sipariş durumunuz güncellendi.';
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

    return `
<!DOCTYPE html>
<html>
<head> <meta charset="UTF-8"> <title>Sipariş Durumu Güncellendi - Federal Gaz</title> </head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: ${statusColor}; margin: 10px 0 5px 0;">Sipariş Durumu: ${statusText}</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Sipariş No: #${orderDetails.orderId}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; text-align: center;">
            Sayın <strong>${orderDetails.customerName}</strong>,<br>
            ${statusMessage}
        </p>

        ${orderDetails.notes ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Not:</strong> ${orderDetails.notes}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
             <a href="${baseUrl}/profil?tab=orders" style="background-color: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Siparişimi Görüntüle
            </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Federal Gaz Bilgilendirme Servisi</p>
    </div>
</body>
</html>
    `;
}

// Order Content Edit Email
export function getOrderUpdateEmail(orderDetails: {
    orderId: number;
    customerName: string;
    products: string;
    changes: string[];
    notes?: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

    const changesHtml = orderDetails.changes.length > 0
        ? `
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 5px 0; color: #856404; font-weight: bold;">Yapılan Değişiklikler:</p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
                ${orderDetails.changes.map(change => `<li style="margin-bottom: 5px;">${change}</li>`).join('')}
            </ul>
        </div>
        `
        : '';

    return `
<!DOCTYPE html>
<html>
<head> <meta charset="UTF-8"> <title>Sipariş Güncellemesi - Federal Gaz</title> </head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #17a2b8; margin: 10px 0 5px 0;">✏️ Siparişiniz Düzenlendi</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Sipariş No: #${orderDetails.orderId}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; text-align: center;">
            Sayın <strong>${orderDetails.customerName}</strong>,<br>
            Siparişinizin içeriğinde tarafımızca güncelleme yapılmıştır. <br>
            Yeni sipariş içeriğiniz aşağıdaki gibidir:
        </p>

        ${changesHtml}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <p style="margin: 5px 0;"><strong>Güncel Ürün Listesi:</strong> ${orderDetails.products}</p>
            ${orderDetails.notes ? `<p style="margin: 5px 0; margin-top: 10px;"><strong>Notlar:</strong> ${orderDetails.notes}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
             <a href="${process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000')}/profil?tab=orders" style="background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Detayları Görüntüle
            </a>
        </div>
        
         <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">Federal Gaz Bilgilendirme Servisi</p>
    </div>
</body>
</html>
    `;
}

// OTP Email Template
export function getOTPEmailTemplate(name: string, otp: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Giriş Doğrulama - Federal Gaz</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="cid:logo" alt="Federal Gaz" style="max-width: 60px; height: auto; margin-bottom: 15px;" />
                <h2 style="color: #111418; margin: 10px 0 5px 0;">Yönetim Paneli Giriş</h2>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Merhaba <strong>${name}</strong>,</p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Yönetim paneline giriş yapmak için talep ettiğiniz tek kullanımlık doğrulama kodu aşağıdadır:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #b13329; background-color: #fdf2f2; padding: 15px 30px; border-radius: 8px; display: inline-block;">${otp}</span>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                Bu kod <strong>2 dakika</strong> süreyle geçerlidir.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
                Eğer bu işlemi siz yapmadıysanız, hesabınızın güvenliği için lütfen bizimle iletişime geçin.<br><br>
                Federal Gaz - Teknik ve Tıbbi Gaz Tedarikçiniz<br>
                © 2014 Tüm hakları saklıdır.
            </p>
        </div>
    </body>
    </html>
    `;
}

// Order cancelled notification email for customer
export function getOrderCancelledEmail(orderDetails: {
    orderId: number;
    customerName: string;
    reason: string;
    note?: string;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sipariş İptal Edildi - Federal Gaz</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 60px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #dc2626; margin: 10px 0 5px 0;">❌ Sipariş İptal Edildi</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">Sipariş No: #${orderDetails.orderId}</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">
            Sayın <strong>${orderDetails.customerName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Aşağıda belirtilen nedenle siparişinizi iptal etmek zorunda kaldığımız için özür dileriz.
        </p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin-top: 0;">📋 İptal Nedeni</h3>
            <p style="margin: 5px 0; color: #333; font-size: 15px;"><strong>${orderDetails.reason}</strong></p>
            ${orderDetails.note ? `
            <hr style="border: none; border-top: 1px solid #fecaca; margin: 15px 0;">
            <p style="margin: 5px 0; color: #666;"><strong>Ek Açıklama:</strong><br>${orderDetails.note}</p>
            ` : ''}
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0369a1; font-size: 14px;">
                💬 <strong>Sorularınız mı var?</strong><br>
                Lütfen bu e-postayı yanıtlayarak veya aşağıdaki iletişim bilgilerinden bize ulaşabilirsiniz.
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">Bizimle iletişime geçmek için:</p>
            <p style="margin: 5px 0;">📞 (0312) 395 35 95</p>
            <p style="margin: 5px 0;">📧 federal.gaz@hotmail.com</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            Anlayışınız için teşekkür ederiz.<br>
            <strong>Federal Gaz</strong> - Güvenilir Gaz Çözümleri
        </p>
    </div>
</body>
</html>
    `;
}

