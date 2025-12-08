import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ContactRequest, connectToDatabase } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { name, email, phone, message, company } = await req.json();

        // 1. Save to Database
        await ContactRequest.create({
            name,
            email,
            phone,
            company,
            message,
            status: 'new'
        });

        // 2. Send Email (if configured)
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
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
