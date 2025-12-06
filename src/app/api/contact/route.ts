import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        return NextResponse.json({ message: 'SMTP not configured, but received.' }, { status: 200 });
    }

    try {
        const { name, email, phone, message } = await req.json();

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
            subject: `İletişim Formu: ${name}`,
            text: `
                İletişim formundan yeni mesaj var!
                
                Ad Soyad: ${name}
                E-posta: ${email}
                Telefon: ${phone || '-'}
                
                Mesaj:
                ${message}
            `,
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Contact Email Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
