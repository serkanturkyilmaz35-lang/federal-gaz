import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ContactRequest, connectToDatabase } from '@/lib/models';
import { decryptRequest } from '@/lib/server-secure';
import { verifyRecaptcha } from '@/lib/recaptcha';

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

        // 2. Send Email via Brevo SMTP
        if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: 'smtp-relay.brevo.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.BREVO_SMTP_USER,
                    pass: process.env.BREVO_SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_FROM || 'bilgi@federalgaz.com',
                to: 'federal.gaz@hotmail.com',
                replyTo: email,
                subject: `İletişim Formu: ${name}`,
                text: `
                İletişim formundan yeni mesaj var!
                
                Ad Soyad: ${name}
                E-posta: ${email}
                Telefon: ${phone || '-'}
                Firma: ${company || '-'}
                
                Mesaj:
                ${message}
            `,
            });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Contact Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
