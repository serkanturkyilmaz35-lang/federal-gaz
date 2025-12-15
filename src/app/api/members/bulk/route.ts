import { NextResponse } from 'next/server';
import { User, connectToDatabase } from '@/lib/models';
import crypto from 'crypto';
import * as XLSX from 'xlsx';

interface MemberRow {
    name: string;
    email: string;
    phone?: string;
}

interface ImportResult {
    success: number;
    failed: number;
    errors: { row: number; email: string; reason: string }[];
    added: string[];
}

// POST: Bulk import members from CSV/Excel file
export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const sendWelcomeEmail = formData.get('sendWelcomeEmail') === 'true';

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'Dosya yüklenmedi.'
            }, { status: 400 });
        }

        // Validate file type
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.csv') && !fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
            return NextResponse.json({
                success: false,
                error: 'Desteklenmeyen dosya formatı. Lütfen CSV, XLS veya XLSX dosyası yükleyin.'
            }, { status: 400 });
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON - expecting headers: Ad Soyad, E-posta, Telefon (or English variants)
        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawData.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Dosya boş veya geçerli veri içermiyor.'
            }, { status: 400 });
        }

        // Map column names (support both Turkish and English)
        const members: MemberRow[] = rawData.map(row => {
            // Find name column
            const name = row['Ad Soyad'] || row['Name'] || row['ad soyad'] || row['name'] || row['İsim'] || row['isim'] || '';
            // Find email column
            const email = row['E-posta'] || row['Email'] || row['e-posta'] || row['email'] || row['E-mail'] || row['e-mail'] || '';
            // Find phone column
            const phone = row['Telefon'] || row['Phone'] || row['telefon'] || row['phone'] || row['Tel'] || row['tel'] || '';

            return { name: String(name).trim(), email: String(email).trim(), phone: String(phone).trim() };
        });

        const result: ImportResult = {
            success: 0,
            failed: 0,
            errors: [],
            added: []
        };

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (process.env.NODE_ENV === 'production' ? 'https://www.federalgaz.com' : 'http://localhost:3000');

        // Process each member
        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const rowNum = i + 2; // +2 for header row and 1-indexed

            // Skip empty rows
            if (!member.name && !member.email) {
                continue;
            }

            // Validate required fields
            if (!member.name) {
                result.failed++;
                result.errors.push({ row: rowNum, email: member.email || '-', reason: 'Ad Soyad eksik' });
                continue;
            }

            if (!member.email) {
                result.failed++;
                result.errors.push({ row: rowNum, email: '-', reason: 'E-posta eksik' });
                continue;
            }

            // Validate email format
            if (!emailRegex.test(member.email)) {
                result.failed++;
                result.errors.push({ row: rowNum, email: member.email, reason: 'Geçersiz e-posta formatı' });
                continue;
            }

            try {
                // Check if email already exists
                const existing = await User.findOne({ where: { email: member.email.toLowerCase() } });
                if (existing) {
                    result.failed++;
                    result.errors.push({ row: rowNum, email: member.email, reason: 'E-posta zaten kayıtlı' });
                    continue;
                }

                // Generate random password
                const randomPassword = crypto.randomBytes(32).toString('hex');

                // Create member
                await User.create({
                    name: member.name,
                    email: member.email.toLowerCase(),
                    password_hash: randomPassword,
                    phone: member.phone || undefined,
                    role: 'user'
                });

                result.success++;
                result.added.push(member.email);

                // Send welcome email if requested (don't await, send in background)
                if (sendWelcomeEmail) {
                    fetch(`${baseUrl}/api/auth/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: member.email.toLowerCase(), language: 'TR' })
                    }).catch(err => console.error('Bulk welcome email failed:', err));
                }

            } catch (createError: any) {
                result.failed++;
                result.errors.push({ row: rowNum, email: member.email, reason: createError?.message || 'Bilinmeyen hata' });
            }
        }

        return NextResponse.json({
            success: true,
            result,
            message: `${result.success} üye başarıyla eklendi${result.failed > 0 ? `, ${result.failed} başarısız` : ''}.`
        });

    } catch (error) {
        console.error('Bulk import failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Toplu içe aktarma sırasında bir hata oluştu.'
        }, { status: 500 });
    }
}
