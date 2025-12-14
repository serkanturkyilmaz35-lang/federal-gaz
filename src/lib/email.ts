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

    // Use verified sender from env or default
    const senderEmail = process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ||
        process.env.EMAIL_FROM ||
        'noreply@federalgaz.com';
    const senderName = process.env.EMAIL_FROM?.match(/^([^<]+)/)?.[1]?.trim() || 'Federal Gaz';

    // Replace logo placeholder with hosted URL
    const logoUrl = 'https://www.federalgaz.com/logo-clean.png';
    const finalHtml = html.replace(/cid:logo/g, logoUrl);

    // Create text version from HTML
    const textVersion = html.replace(/<[^>]*>?/gm, '');

    console.log(`[Brevo API] Sending to: ${to}, from: ${senderEmail}, subject: ${subject}`);

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
                    name: senderName,
                    email: senderEmail
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
            console.error('[Brevo API] Error:', response.status, JSON.stringify(errorData));
            return { success: false, error: errorData };
        }

        const data = await response.json();
        console.log('[Brevo API] Email sent:', data.messageId);
        return { success: true, data: { id: data.messageId } };
    } catch (error) {
        console.error('[Brevo API] Request failed:', error);
        return { success: false, error };
    }
}

// ==================== BREVO SMTP (FALLBACK) ====================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedTransporter: any = null;
let lastConnectionTime = 0;

const getTransporter = () => {
    const now = Date.now();
    // Recreate transporter if more than 5 minutes since last use (connection may have closed)
    const CONNECTION_TIMEOUT = 5 * 60 * 1000;

    if (cachedTransporter && (now - lastConnectionTime) < CONNECTION_TIMEOUT) {
        lastConnectionTime = now;
        return cachedTransporter;
    }

    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
        return null;
    }

    // Close old transporter if exists
    if (cachedTransporter) {
        try {
            cachedTransporter.close();
        } catch (e) {
            // Ignore close errors
        }
    }

    // Optimized SMTP settings for speed and reliability
    cachedTransporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // Use STARTTLS
        pool: true,
        maxConnections: 3,
        maxMessages: 50,
        connectionTimeout: 5000,  // 5 second connection timeout (was 10)
        greetingTimeout: 5000,    // 5 second greeting timeout (was 10)
        socketTimeout: 10000,     // 10 second socket timeout
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
        tls: {
            rejectUnauthorized: false, // Accept self-signed certs for speed
            ciphers: 'SSLv3'
        }
    });

    lastConnectionTime = now;
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

export function getPasswordResetEmail(resetLink: string, language: 'TR' | 'EN' = 'TR') {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

    const texts = {
        TR: {
            title: 'Şifre Sıfırlama - Federal Gaz',
            subtitle: 'Şifre Sıfırlama Talebi',
            greeting: 'Merhaba,',
            message: 'Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:',
            button: 'Şifremi Sıfırla',
            expiry: 'Bu bağlantı 1 saat geçerlidir. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.',
            footer: 'Federal Gaz - Teknik ve Tıbbi Gaz Tedarikçiniz',
            rights: '© 2014 Tüm hakları saklıdır.'
        },
        EN: {
            title: 'Password Reset - Federal Gaz',
            subtitle: 'Password Reset Request',
            greeting: 'Hello,',
            message: 'You have requested a password reset for your account. Click the button below to reset your password:',
            button: 'Reset Password',
            expiry: 'This link is valid for 1 hour. If you did not request this, you can ignore this email.',
            footer: 'Federal Gaz - Your Technical and Medical Gas Supplier',
            rights: '© 2014 All rights reserved.'
        }
    };

    const t = texts[language];

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${t.title}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
            <p style="color: #666; margin-top: 5px; font-size: 14px;">${t.subtitle}</p>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">${t.greeting}</p>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
            ${t.message}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #8B0000; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                ${t.button}
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
            ${t.expiry}
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            ${t.footer}<br>
            ${t.rights}
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
    language?: 'TR' | 'EN';
}) {
    const language = orderDetails.language || 'TR';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

    const texts = {
        TR: {
            title: 'Siparişiniz Alındı - Federal Gaz',
            heading: '✅ Siparişiniz Alındı!',
            orderNo: 'Sipariş No',
            dear: 'Sayın',
            message: 'Siparişiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.',
            summary: '📦 Sipariş Özeti',
            product: 'Ürün',
            deliveryAddress: 'Teslimat Adresi',
            notesLabel: 'Notlar',
            statusLabel: 'Durumu',
            statusMessage: 'Siparişiniz değerlendiriliyor. Size en kısa sürede dönüş yapacağız.',
            contactUs: 'Bizimle iletişime geçmek için:',
            thanks: 'Bizi tercih ettiğiniz için teşekkür ederiz!',
            footer: 'Federal Gaz - Güvenilir Gaz Çözümleri'
        },
        EN: {
            title: 'Order Received - Federal Gaz',
            heading: '✅ Order Received!',
            orderNo: 'Order No',
            dear: 'Dear',
            message: 'Your order has been successfully received. We will contact you shortly.',
            summary: '📦 Order Summary',
            product: 'Product',
            deliveryAddress: 'Delivery Address',
            notesLabel: 'Notes',
            statusLabel: 'Status',
            statusMessage: 'Your order is being reviewed. We will get back to you shortly.',
            contactUs: 'To contact us:',
            thanks: 'Thank you for choosing us!',
            footer: 'Federal Gaz - Reliable Gas Solutions'
        }
    };

    const t = texts[language];

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${t.title}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="Federal Gaz" style="max-width: 40px; height: auto; margin-bottom: 15px;" />
            <h2 style="color: #28a745; margin: 10px 0 5px 0;">${t.heading}</h2>
            <p style="color: #666; margin-top: 5px; font-size: 14px;">${t.orderNo}: #${orderDetails.orderId}</p>
        </div>
        
        <p style="font-size: 16px; color: #333; text-align: center;">
            ${t.dear} <strong>${orderDetails.customerName}</strong>,<br>
            ${t.message}
        </p>
        
        <div style="background-color: #f0f7f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #333; margin-top: 0;">${t.summary}</h3>
            <p style="margin: 5px 0;"><strong>${t.product}:</strong> ${orderDetails.products}</p>
            <p style="margin: 5px 0;"><strong>${t.deliveryAddress}:</strong> ${orderDetails.address}</p>
            ${orderDetails.notes ? `<p style="margin: 5px 0;"><strong>${t.notesLabel}:</strong> ${orderDetails.notes}</p>` : ''}
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
                ⏳ <strong>${t.statusLabel}:</strong> ${t.statusMessage}
            </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; font-size: 14px;">${t.contactUs}</p>
            <p style="margin: 5px 0;">📞 (0312) 395 35 95</p>
            <p style="margin: 5px 0;">📧 federal.gaz@hotmail.com</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
            ${t.thanks}<br>
            <strong>${t.footer}</strong>
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

// ==================== CAMPAIGN EMAIL TEMPLATES ====================

interface CampaignTemplateOptions {
    subject: string;
    content: string;
    recipientName?: string;
    customLogoUrl?: string;  // Optional: Override default logo
    customProductImageUrl?: string; // Optional: Override product image
    campaignTitle?: string; // Optional: Banner title
    campaignHighlight?: string; // Optional: Highlight/Discount text
    // Template styling options
    headerBgColor?: string;
    headerTextColor?: string;
    headerImage?: string;
    bodyBgColor?: string;
    bodyTextColor?: string;
    buttonColor?: string;
    footerBgColor?: string;
    footerTextColor?: string;
    footerImage?: string;
    headerHtml?: string;
    footerHtml?: string;
    footerContact?: string;
}

// Default professional content for each template type (Used when content is empty)
const defaultTemplateContent: { [key: string]: string } = {
    'modern': `Federal Gaz olarak 30 yılı aşkın tecrübemizle Ankara'nın en güvenilir endüstriyel gaz tedarikçisiyiz.

🔹 Oksijen, Argon, Azot, Asetilen, CO2
🔹 Kaynak gazları ve gaz karışımları
🔹 Medikal ve gıda sınıfı gazlar
🔹 Aynı gün teslimat imkanı

Tüm gaz ihtiyaçlarınız için bizi tercih ettiğiniz için teşekkür ederiz.`,

    'black-friday': `🔥 EFSANE CUMA BAŞLADI!

Yılın en büyük indirim kampanyası Federal Gaz'da!

✅ Tüm kaynak gazlarında %50'ye varan indirim
✅ Argon, Asetilen, CO2 karışımlarında özel fiyatlar
✅ Toplu alımlarda ekstra avantajlar
✅ Ücretsiz teslimat fırsatı

Stoklarla sınırlı bu fırsatı kaçırmayın!`,

    'new-year': `Yeni yılda işinizi Federal Gaz kalitesiyle büyütün!

2025 yılında sizlere daha iyi hizmet vermek için hazırız. Yeni yıl fiyat listemiz ve kampanyalarımız için bizimle iletişime geçin.

✨ Yeni yıl özel fiyatları
✨ Yıllık sözleşme avantajları
✨ Öncelikli teslimat imkanı

Mutlu, sağlıklı ve başarılı bir yıl diliyoruz!`,

    'ramazan-bayrami': `Ramazan Bayramınızı en içten dileklerimizle kutlarız.

Bu mübarek bayramda sevdiklerinizle huzurlu vakitler geçirmenizi dileriz.

Federal Gaz olarak bayram süresince de işletmenizin gaz ihtiyaçlarını karşılamaya devam ediyoruz. Acil talepleriniz için 7/24 hizmetinizdeyiz.`,

    'kurban-bayrami': `Kurban Bayramınız mübarek olsun!

Paylaşmanın ve birlik olmanın sembolü olan bu bayramda tüm müşterilerimize sağlık ve mutluluk diliyoruz.

Bayram boyunca LPG ve tüp siparişleriniz için nöbet hizmetimiz devam etmektedir.`,

    'winter-campaign': `❄️ KIŞ KAMPANYASI BAŞLADI!

Soğuk kış aylarına hazır mısınız?

🔥 LPG ve Propan tüplerinde kış indirimi
🏠 Isınma gazlarında toptan fiyat avantajı
🚚 Ankara geneli aynı gün teslimat
⚡ Acil siparişlerde öncelikli hizmet

Kışa hazırlıklı girin, Federal Gaz yanınızda!`,

    'weekend-sale': `🎉 HAFTA SONU ÖZEL FİYATLARI!

Sadece bu hafta sonu geçerli:

✅ Tüm endüstriyel gazlarda %30 indirim
✅ Argon ve CO2'de özel fiyatlar
✅ Minimum sipariş limiti yok
✅ Ücretsiz teslimat

Pazartesi'den önce siparişinizi verin!`,

    'welcome': `Federal Gaz ailesine hoş geldiniz! 🎉

Bizi tercih ettiğiniz için teşekkür ederiz. Üyeliğinizle birlikte şu avantajlardan yararlanabilirsiniz:

🚚 Hızlı Teslimat - Siparişleriniz aynı gün kapınızda
💰 Özel Fiyatlar - Üyelere özel indirimli fiyatlar
🎁 Kampanyalar - İlk siparişte %10 indirim kodu: HOSGELDIN
📞 7/24 Destek - Her an yanınızdayız

İlk siparişinizi vermek için hemen sitemizi ziyaret edin!`,

    'classic': `Sayın Müşterimiz,

Federal Gaz olarak endüstriyel gaz sektöründe Ankara'nın lider tedarikçisi olarak hizmet vermekteyiz.

Geniş ürün yelpazemiz:
• Medikal Gazlar (Oksijen, Azot)
• Kaynak Gazları (Argon, Asetilen, CO2 karışımları)
• Endüstriyel Gazlar (Hidrojen, Helyum, Propan)
• Özel Gaz Karışımları

Kalite ve güvenilirlik için Federal Gaz'ı tercih edin.

Saygılarımızla,
Federal Gaz Ekibi`,

    '23-nisan': `🇹🇷 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı Kutlu Olsun!

Ulu Önder Mustafa Kemal Atatürk'ün çocuklara armağan ettiği bu özel günde, geleceğimizin teminatı olan çocuklarımızın bayramını en içten dileklerimizle kutlarız.

Federal Gaz olarak, ülkemizin sanayisine hizmet etmekten gurur duyuyoruz.

Bayramınız kutlu olsun! 🎈`,

    '29-ekim': `🇹🇷 29 Ekim Cumhuriyet Bayramı Kutlu Olsun!

Cumhuriyetimizin ${new Date().getFullYear() - 1923}. yılını gururla kutluyoruz!

Ulu Önder Mustafa Kemal Atatürk ve silah arkadaşlarını saygı ve minnetle anıyoruz.

Federal Gaz olarak, Cumhuriyetimizin değerlerine sahip çıkarak Türk sanayisine hizmet etmeye devam ediyoruz.

Yaşasın Cumhuriyet! 🇹🇷`,

    '19-mayis': `🇹🇷 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı Kutlu Olsun!

Ulu Önder Mustafa Kemal Atatürk'ün Samsun'a çıkarak başlattığı Kurtuluş Savaşı'nın yıl dönümünde, gençlerimizin bayramını kutlarız.

"Gençler, Cumhuriyeti biz kurduk, onu yükseltecek ve sürdürecek olan sizlersiniz." - M. Kemal Atatürk

Federal Gaz olarak gençlerimize güveniyoruz! ⚽🏆`,

    '30-agustos': `🇹🇷 30 Ağustos Zafer Bayramı Kutlu Olsun!

Büyük Taarruz'un ${new Date().getFullYear() - 1922}. yıl dönümünde, bu zaferi bize armağan eden başta Gazi Mustafa Kemal Atatürk olmak üzere tüm şehitlerimizi saygı ve minnetle anıyoruz.

Bu zafer, milletimizin bağımsızlık aşkının en büyük kanıtıdır.

Zafer Bayramınız kutlu olsun! 🎖️`,

    'stock-reminder': `📦 STOK HATIRLATMASI

Sayın Müşterimiz,

Kayıtlarımıza göre düzenli olarak kullandığınız gazların stok tazeleme zamanı gelmiş olabilir.

Mevcut stoklarınız:
• Argon • Oksijen • Asetilen • CO2

Kesintisiz üretim için siparişinizi şimdiden verin!

📞 Hemen Sipariş: (0312) 395 35 95
🚚 Aynı gün teslimat garantisi`,

    'promotion': `🎁 ÖZEL KAMPANYA!

Federal Gaz'dan size özel fırsat!

Bu ay boyunca geçerli avantajlar:
✅ Toplu alımlarda %20 indirim
✅ Yeni müşterilere özel fiyatlar
✅ Ücretsiz tüp teslim/teslimat
✅ Esnek ödeme seçenekleri

Kampanya stoklarla sınırlıdır.
Fırsatı kaçırmayın!`,

    'vip-customer': `⭐ VIP MÜŞTERİMİZ

Değerli İş Ortağımız,

Federal Gaz VIP müşterisi olarak size özel ayrıcalıklarınız:

👑 Öncelikli Teslimat - Siparişleriniz en önce
💎 Özel Fiyatlandırma - Size özel indirimli fiyatlar  
📞 Dedicated Destek - Özel müşteri temsilcisi
🎁 Sürpriz Hediyeler - Dönemsel özel hediyeler

VIP müşterimiz olduğunuz için teşekkür ederiz.`
};

export function getCampaignEmailTemplate(templateSlug: string, options: CampaignTemplateOptions): string {
    const {
        subject,
        content,
        recipientName = 'Değerli Müşterimiz',
        customLogoUrl,
        customProductImageUrl,
        campaignTitle,
        campaignHighlight,
        // Template styling options with defaults
        headerBgColor = '#1a2744',
        headerTextColor = '#ffffff',
        headerImage,
        bodyBgColor = '#ffffff',
        bodyTextColor = '#333333',
        buttonColor = '#b13329',
        footerBgColor = '#1a2744',
        footerTextColor = '#888888',
        footerImage,
        headerHtml,
        footerHtml,
        footerContact
    } = options;

    const logoUrl = customLogoUrl || 'https://www.federalgaz.com/logo-clean.png';
    const websiteUrl = 'https://www.federalgaz.com';
    const year = 2014;

    // Use default content if provided content is empty
    const templateContent = content?.trim() || defaultTemplateContent[templateSlug] || defaultTemplateContent['modern'];

    // Federal Gaz Product Images
    const productImages = {
        'modern': 'https://placehold.co/600x200/1a2744/ffffff?text=MODERN',
        'black-friday': 'https://placehold.co/600x200/000000/ff2d2d?text=EFSANE+CUMA',
        'new-year': 'https://placehold.co/600x200/1e3a5f/ffd700?text=MUTLU+YILLAR',
        'winter-campaign': 'https://placehold.co/600x200/74ebd5/1a2744?text=KIS+KAMPANYASI',
        'weekend-sale': 'https://placehold.co/600x200/667eea/ffffff?text=HAFTA+SONU',
        'ramazan-bayrami': 'https://placehold.co/600x200/1e3c72/ffd700?text=IYI+BAYRAMLAR',
        'kurban-bayrami': 'https://placehold.co/600x200/2d3436/ffffff?text=KURBAN+BAYRAMI',
        'hero': 'https://placehold.co/600x200/1a2744/ffffff?text=FEDERAL+GAZ',
        'kaynakGazi': 'https://placehold.co/600x200/333333/ffffff?text=KAYNAK+GAZI',
        'oksijen': 'https://placehold.co/600x200/1a2744/ffffff?text=OKSIJEN',
        'propan': 'https://placehold.co/600x200/ff6b35/ffffff?text=PROPAN',
        'argon': 'https://placehold.co/600x200/667eea/ffffff?text=ARGON',
        'azot': 'https://placehold.co/600x200/1e3c72/ffffff?text=AZOT',
        'asetilen': 'https://placehold.co/600x200/ffffff/000000?text=ASETILEN',
        'ataturkFlag': 'https://placehold.co/600x200/e30a17/ffffff?text=29+EKIM',
        'christmasTree': 'https://placehold.co/600x200/1e3a5f/ffd700?text=MUTLU+YILLAR',
        'ramazan': 'https://placehold.co/600x200/1e3c72/ffd700?text=IYI+BAYRAMLAR',
    };

    // Determine which image to use
    let defaultImageForTemplate = productImages.hero;
    if (templateSlug === 'black-friday') defaultImageForTemplate = productImages.kaynakGazi;
    else if (templateSlug === 'new-year') defaultImageForTemplate = productImages.christmasTree;
    else if (templateSlug === 'winter-campaign') defaultImageForTemplate = productImages.propan;
    else if (templateSlug === 'weekend-sale') defaultImageForTemplate = productImages.argon;
    else if (templateSlug === '29-ekim') defaultImageForTemplate = productImages.ataturkFlag;
    else if (templateSlug === 'ramazan-bayrami') defaultImageForTemplate = productImages.ramazan;

    // Logic: customProductImageUrl > defaultImageForTemplate
    // Note: If templateSlug is not in the list above, it defaults to productImages.hero
    const mainProductImage = customProductImageUrl || defaultImageForTemplate;

    // Use template colors from database or defaults
    const colors = {
        headerBg: headerBgColor,
        headerText: headerTextColor,
        bodyBg: bodyBgColor,
        bodyText: bodyTextColor,
        button: buttonColor,
        footerBg: footerBgColor,
        footerText: footerTextColor,
        white: '#ffffff',
        gray: '#f5f5f5'
    };

    // Keep brandColors for backward compatibility with existing templates
    const brandColors = {
        navyDark: headerBgColor || '#1a2744',
        navyLight: '#2d4a7c',
        red: buttonColor || '#b13329',
        redDark: '#8b1a12',
        gold: '#ffd700',
        white: '#ffffff',
        gray: '#f5f5f5'
    };

    // Template-specific HTML generators
    const templates: { [key: string]: () => string } = {

        // ==================== MODERN TEMPLATE ====================
        'modern': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: ${brandColors.gray};">
    <div style="max-width: 600px; margin: 0 auto; background-color: ${brandColors.white};">
        <!-- Header with Dynamic Background -->
        <div style="background-color: ${brandColors.navyDark}; padding: 40px 30px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: ${brandColors.white}; margin: 0; font-size: 28px; font-weight: 600;">${campaignTitle || subject}</h1>
        </div>
        
        <!-- Product Image Banner -->
        <div style="background: linear-gradient(135deg, ${brandColors.red} 0%, ${brandColors.redDark} 100%); padding: 20px; text-align: center;">
            <img src="${mainProductImage}" alt="Endüstriyel Gazlar" style="height: 120px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Merhaba <strong>${recipientName}</strong>,
            </p>
            <div style="color: #444; font-size: 15px; line-height: 1.8; background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${brandColors.red};">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: linear-gradient(135deg, ${brandColors.red} 0%, ${brandColors.redDark} 100%); color: ${brandColors.white}; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(177, 51, 41, 0.3);">
                    🛒 Sipariş Ver
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Saygılarımızla,<br><strong>Federal Gaz Ekibi</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: ${brandColors.navyDark}; padding: 30px; text-align: center;">
            <p style="color: ${brandColors.white}; margin: 0 0 10px; font-size: 14px;">
                ${footerContact || '📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com'}
            </p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara | Tüm Hakları Saklıdır
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== BLACK FRIDAY ====================
        'black-friday': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #000000;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a;">
        <!-- Black Friday Header -->
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%); padding: 40px 30px; text-align: center; position: relative;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <div style="background: #ff2d2d; color: #ffffff; display: inline-block; padding: 8px 25px; border-radius: 4px; font-size: 12px; font-weight: bold; letter-spacing: 2px; margin-bottom: 15px;">
                🔥 ${campaignTitle || 'EFSANE CUMA'} 🔥
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; text-shadow: 0 0 20px rgba(255,45,45,0.5);">${subject}</h1>
            <p style="color: #ff2d2d; font-size: 48px; font-weight: 900; margin: 15px 0 0;">${campaignHighlight || '%50 İNDİRİM'}</p>
        </div>
        
        <!-- Products Section -->
        <div style="background: linear-gradient(180deg, #1a1a2e 0%, #000000 100%); padding: 30px; text-align: center;">
            <img src="${mainProductImage}" alt="Kaynak Gazları" style="height: 150px; filter: drop-shadow(0 0 30px rgba(255,45,45,0.5));">
            <div style="background: rgba(255,45,45,0.2); border: 2px solid #ff2d2d; border-radius: 8px; padding: 20px; margin-top: 20px;">
                <p style="color: #ffffff; font-size: 18px; margin: 0 0 10px;">Tüm Ürünlerde Geçerli!</p>
                <p style="color: #ffd700; font-size: 14px; margin: 0;">Stoklarla sınırlı • Kaçırmayın!</p>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #111111;">
            <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">
                Merhaba <strong style="color: #ffffff;">${recipientName}</strong>,
            </p>
            <div style="color: #aaaaaa; font-size: 15px; line-height: 1.8;">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: #ff2d2d; color: #ffffff; padding: 16px 50px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 30px rgba(255,45,45,0.5);">
                    FIRSATI YAKALA
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #000000; padding: 25px; text-align: center; border-top: 1px solid #333;">
            <p style="color: #888; margin: 0; font-size: 12px;">
                📞 (0312) 395 35 95 | © ${year} Federal Gaz
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== NEW YEAR ====================
        'new-year': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0d1f33;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1e3a5f 0%, #0d1f33 100%);">
        <!-- New Year Header -->
        <div style="padding: 40px 30px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <p style="color: #ffd700; font-size: 18px; letter-spacing: 3px; margin: 0;">✨ ${campaignHighlight || (year + 1)} ✨</p>
            <h1 style="color: #ffffff; margin: 15px 0; font-size: 36px; font-weight: 300;">${campaignTitle || 'YENİ YIL'}</h1>
            <p style="color: #ffd700; font-size: 28px; font-weight: 600; margin: 0;">MUTLU YILLAR!</p>
        </div>
        
        <!-- Decorative Banner -->
        <div style="background: linear-gradient(90deg, #c41e3a 0%, #ffd700 50%, #c41e3a 100%); height: 4px;"></div>
        
        <!-- Celebration Image -->
        <div style="padding: 30px; text-align: center;">
             <img src="${mainProductImage}" alt="Yeni Yıl" style="height: 180px; border-radius: 12px; box-shadow: 0 0 20px rgba(255,215,0,0.2);">
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6; text-align: center;">
                Sevgili <strong style="color: #ffd700;">${recipientName}</strong>,
            </p>
            <div style="color: #cccccc; font-size: 15px; line-height: 1.8; text-align: center; background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; margin: 20px 0;">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <p style="color: #ffd700; font-size: 18px; text-align: center; margin: 25px 0;">
                🎄 Yeni yılda sağlık, mutluluk ve başarı dileriz! 🎄
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 25px; font-weight: 600;">
                    🎁 Yeni Yıl Fırsatları
                </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
                Sevgilerimizle,<br><strong style="color: #ffd700;">Federal Gaz Ailesi</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: rgba(0,0,0,0.3); padding: 25px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara | federalgaz.com
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== RAMAZAN BAYRAMI ====================
        'ramazan-bayrami': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #1e3c72;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #2a5298 0%, #1e3c72 100%);">
        <!-- Bayram Header -->
        <div style="padding: 40px 30px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <p style="color: #ffd700; font-size: 40px; margin: 0;">☪</p>
            <h1 style="color: #ffd700; margin: 15px 0; font-size: 32px; font-weight: 600;">${campaignTitle || 'RAMAZAN BAYRAMINIZ'}</h1>
            <p style="color: #ffffff; font-size: 24px; margin: 0;">${campaignHighlight || 'MÜBAREK OLSUN'}</p>
        </div>
        
        <!-- Image -->
        <div style="background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%); text-align: center; padding: 0 0 20px;">
             <img src="${mainProductImage}" alt="Ramazan" style="height: 150px; filter: drop-shadow(0 0 15px rgba(255,215,0,0.3));">
        </div>
        
        <!-- Decorative Pattern -->
        <div style="background: linear-gradient(90deg, transparent, #ffd700, transparent); height: 2px; margin: 0 30px;"></div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; backdrop-filter: blur(10px);">
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
                    Değerli <strong style="color: #ffd700;">${recipientName}</strong>,
                </p>
                <div style="color: #e0e0e0; font-size: 15px; line-height: 1.8;">
                    ${templateContent.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #ffd700; font-size: 18px;">
                    🌙 Bu mübarek bayramda ailenizle birlikte sağlık ve huzur dolu günler geçirmenizi dileriz.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: #4ecdc4; color: #1a2744; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Sipariş Ver
                </a>
            </div>
            
            <p style="color: #cccccc; font-size: 14px; text-align: center;">
                En içten bayram dileklerimizle,<br><strong style="color: #ffd700;">Federal Gaz Ailesi</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: rgba(0,0,0,0.2); padding: 25px; text-align: center;">
            <p style="color: #aaa; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== KURBAN BAYRAMI ====================
        'kurban-bayrami': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #1a2744;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #2d3436 0%, #000000 100%);">
        <!-- Bayram Header -->
        <div style="padding: 40px 30px; text-align: center; border-bottom: 3px solid ${brandColors.red};">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <p style="color: #ffd700; font-size: 36px; margin: 0;">🕌</p>
            <h1 style="color: #ffffff; margin: 15px 0; font-size: 32px; font-weight: 600;">${campaignTitle || 'KURBAN BAYRAMINIZ'}</h1>
            <p style="color: ${brandColors.red}; font-size: 24px; margin: 0; font-weight: 300;">${campaignHighlight || 'KUTLU OLSUN'}</p>
        </div>
        
        <!-- Image -->
        <div style="background: #000000; text-align: center; padding: 20px;">
             <img src="${mainProductImage}" alt="Kurban Bayramı" style="height: 150px; border-radius: 8px;">
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 25px; border: 1px solid rgba(255,255,255,0.1);">
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6;">
                    Değerli <strong style="color: ${brandColors.red};">${recipientName}</strong>,
                </p>
                <div style="color: #cccccc; font-size: 15px; line-height: 1.8;">
                    ${templateContent.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #aaaaaa; font-size: 16px; font-style: italic;">
                    "Kurban, paylaşmanın ve dayanışmanın sembolüdür."
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: ${brandColors.red}; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Sipariş Ver
                </a>
            </div>
            
            <p style="color: #888; font-size: 14px; text-align: center;">
                Bayramınız mübarek olsun,<br><strong style="color: #ffffff;">Federal Gaz Ailesi</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: ${brandColors.navyDark}; padding: 25px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== WINTER CAMPAIGN ====================
        'winter-campaign': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #e8f4f8;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Winter Header -->
        <div style="background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%); padding: 40px 30px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <p style="font-size: 40px; margin: 0;">❄️</p>
            <h1 style="color: ${brandColors.navyDark}; margin: 15px 0; font-size: 28px; font-weight: 600;">${subject}</h1>
            <p style="color: #2d4a7c; font-size: 16px; margin: 0;">Kışa hazır mısınız?</p>
        </div>
        
        <!-- Product Banner -->
        <div style="background: ${brandColors.navyDark}; padding: 25px; text-align: center;">
            <img src="${mainProductImage}" alt="LPG Tüpü" style="height: 130px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">
            <p style="color: #ffffff; font-size: 18px; margin: 15px 0 0;">Kış boyunca kesintisiz ısınma!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Merhaba <strong>${recipientName}</strong>,
            </p>
            <div style="color: #444; font-size: 15px; line-height: 1.8; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px;">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="color: #856404; font-size: 14px; margin: 0;">
                    🔥 <strong>Kış Kampanyası:</strong> Toplu siparişlerde özel indirimler!
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: ${brandColors.navyDark}; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Şimdi Sipariş Ver
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                Saygılarımızla,<br><strong>Federal Gaz</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: ${brandColors.navyDark}; padding: 25px; text-align: center;">
            <p style="color: #ffffff; margin: 0 0 8px; font-size: 13px;">
                📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com
            </p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== WEEKEND SALE ====================
        'weekend-sale': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Weekend Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.2); display: inline-block; padding: 8px 20px; border-radius: 20px; margin-bottom: 15px;">
                <span style="color: #ffffff; font-size: 14px; font-weight: 600;">🎉 HAFTA SONU ÖZEL 🎉</span>
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">${subject}</h1>
        </div>
        
        <!-- Discount Banner -->
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
            <p style="color: #ffffff; font-size: 48px; font-weight: 900; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">${campaignHighlight || '%30 İNDİRİM'}</p>
            <p style="color: #ffffff; font-size: 18px; margin: 5px 0 0;">TÜM ÜRÜNLERDE</p>
        </div>
        
        <!-- Product -->
        <div style="padding: 30px; text-align: center; background: #fafafa;">
            <img src="${mainProductImage}" alt="Argon Tüpü" style="height: 120px;">
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Merhaba <strong>${recipientName}</strong>,
            </p>
            <div style="color: #444; font-size: 15px; line-height: 1.8;">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 50px; text-decoration: none; border-radius: 25px; font-weight: 700; font-size: 16px;">
                    Hemen Al
                </a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center;">
                * Kampanya sadece bu hafta sonu geçerlidir.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: ${brandColors.navyDark}; padding: 25px; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== WELCOME ====================
        'welcome': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Welcome Header -->
        <div style="background: linear-gradient(135deg, ${brandColors.navyDark} 0%, ${brandColors.navyLight} 100%); padding: 50px 30px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 300;">Hoş Geldiniz!</h1>
            <p style="color: #aabbcc; font-size: 16px; margin: 15px 0 0;">Federal Gaz ailesine katıldınız</p>
        </div>
        
        <!-- Icon -->
        <div style="text-align: center; margin-top: -30px;">
            <div style="background: ${brandColors.red}; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(177, 51, 41, 0.3);">
                <span style="color: #ffffff; font-size: 28px;">✓</span>
            </div>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
                Merhaba <strong>${recipientName}</strong>,
            </p>
            <div style="color: #444; font-size: 15px; line-height: 1.8; text-align: center;">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <!-- Features -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <p style="color: ${brandColors.navyDark}; font-size: 16px; font-weight: 600; margin: 0 0 15px; text-align: center;">
                    Üyelik Avantajlarınız
                </p>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 10px; text-align: center;">
                            <div style="background: ${brandColors.red}; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px;">🚚</div>
                            <p style="color: #666; font-size: 13px; margin: 0;">Hızlı Teslimat</p>
                        </td>
                        <td style="padding: 10px; text-align: center;">
                            <div style="background: ${brandColors.red}; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px;">💰</div>
                            <p style="color: #666; font-size: 13px; margin: 0;">Özel Fiyatlar</p>
                        </td>
                        <td style="padding: 10px; text-align: center;">
                            <div style="background: ${brandColors.red}; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px;">🎁</div>
                            <p style="color: #666; font-size: 13px; margin: 0;">Kampanyalar</p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background: ${brandColors.red}; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    İlk Siparişinizi Verin
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
                Aramıza hoş geldiniz!<br><strong>Federal Gaz Ailesi</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: ${brandColors.navyDark}; padding: 25px; text-align: center;">
            <p style="color: #ffffff; margin: 0 0 8px; font-size: 13px;">
                📞 (0312) 395 35 95
            </p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">
                © ${year} Federal Gaz - Ankara
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== CLASSIC ====================
        'classic': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f8f8f8;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
        <!-- Classic Header -->
        <div style="background-color: ${brandColors.navyDark}; padding: 25px; text-align: center; border-bottom: 4px solid ${brandColors.red};">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 50px;">
        </div>
        
        <!-- Subject Banner -->
        <div style="background-color: #f0f4f8; padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
            <h1 style="color: ${brandColors.navyDark}; margin: 0; font-size: 24px; font-weight: normal;">${subject}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 35px 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                Sayın <strong>${recipientName}</strong>,
            </p>
            
            <div style="color: #444; font-size: 15px; line-height: 1.7; border-left: 3px solid ${brandColors.red}; padding-left: 20px; margin: 25px 0;">
                ${templateContent.replace(/\n/g, '<br>')}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${websiteUrl}" style="display: inline-block; background-color: ${brandColors.red}; color: #ffffff; padding: 12px 35px; text-decoration: none; font-size: 15px; border-radius: 4px;">
                    Web Sitemizi Ziyaret Edin →
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Saygılarımızla,<br><strong>Federal Gaz</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f5f5f5; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; margin: 0 0 8px; font-size: 13px;">Federal Gaz - Ankara</p>
            <p style="color: #888; margin: 0; font-size: 12px;">
                Tel: (0312) 395 35 95 | © ${year}
            </p>
        </div>
    </div>
</body>
</html>`,

        // ==================== 29 EKIM TEMPLATE ====================
        '29-ekim': () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; border: 1px solid #e0e0e0;">
        <!-- Header -->
        <div style="background: #e30a17; padding: 40px 20px; text-align: center;">
            <img src="${logoUrl}" alt="Federal Gaz" style="height: 60px; filter: brightness(0) invert(1);">
            <div style="margin-top: 30px; border: 2px solid #fff; padding: 15px; display: inline-block;">
                <h1 style="color: #fff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">${campaignTitle || '29 EKİM'}</h1>
                <p style="color: #fff; margin: 5px 0 0; font-size: 18px;">${campaignHighlight || 'CUMHURİYET BAYRAMI'}</p>
            </div>
        </div>

        <!-- Image -->
        <div style="background: #fff; text-align: center; padding: 0;">
             <img src="${mainProductImage}" alt="Atatürk ve Bayrak" style="width: 100%; height: auto; display: block;">
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; line-height: 1.6; color: #333; text-align: center;">
                <strong>${recipientName}</strong>,
            </p>
            <div style="color: #555; font-size: 16px; line-height: 1.8; text-align: center;">
                 ${templateContent.replace(/\n/g, '<br>')}
            </div>
             <p style="text-align: center; font-size: 20px; font-weight: bold; color: #e30a17; margin-top: 30px;">
                NE MUTLU TÜRKÜM DİYENE!
            </p>
        </div>
        
        <!-- Footer -->
         <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #aaa; margin: 0; font-size: 12px;">© ${year} Federal Gaz</p>
        </div>
    </div>
</body>
</html>
`
    };

    // Return the template or default to modern
    const templateFn = templates[templateSlug] || templates['modern'];
    return templateFn();
}
