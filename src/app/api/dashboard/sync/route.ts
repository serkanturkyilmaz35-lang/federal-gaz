'use server';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST - Sync database (create missing tables manually)
export async function POST() {
    try {
        const db = getDb();

        // 1. MailingCampaigns tablosuna templateSlug ekle
        try {
            // IF NOT EXISTS kullanmadan dene, varsa hata verir, yakalarız (1060)
            await db.query("ALTER TABLE mailing_campaigns ADD COLUMN templateSlug VARCHAR(255) NOT NULL DEFAULT 'modern'");
        } catch (e: any) {
            // 1060: Duplicate column name (MySQL/MariaDB)
            // 42S22: Column already exists (bazı sürümlerde)
            if ((e.original && e.original.errno === 1060) || (e.message && e.message.includes("Duplicate column"))) {
                console.log('TemplateSlug column already exists, skipping.');
            } else {
                console.error('Alter Table Error:', e);
                // Hatayı fırlat ki kullanıcı görsün
                throw new Error(`Tablo güncellenemedi (MailingCampaigns): ${e.message}`);
            }
        }

        // 2. MailingLogs tablosunu oluştur
        // Indexsiz oluştur (Primary Key hariç) - Too many keys hatasını önlemek için
        await db.query(`
            CREATE TABLE IF NOT EXISTS mailing_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                campaignId INT NOT NULL,
                userEmail VARCHAR(255) NOT NULL,
                userId INT,
                status ENUM('sent', 'failed', 'opened', 'clicked') DEFAULT 'sent',
                errorMessage TEXT,
                sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                openedAt DATETIME,
                clickedAt DATETIME,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. EmailTemplates tablosunu oluştur
        await db.query(`
            CREATE TABLE IF NOT EXISTS email_templates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                slug VARCHAR(255) NOT NULL UNIQUE,
                nameTR VARCHAR(255) NOT NULL,
                nameEN VARCHAR(255) NOT NULL,
                category ENUM('general', 'holiday', 'promotion') DEFAULT 'general',
                headerBgColor VARCHAR(255) DEFAULT '#1a2744',
                headerTextColor VARCHAR(255) DEFAULT '#ffffff',
                buttonColor VARCHAR(255) DEFAULT '#b13329',
                bannerImage VARCHAR(255),
                headerHtml LONGTEXT NOT NULL,
                footerHtml LONGTEXT NOT NULL,
                isActive BOOLEAN DEFAULT TRUE,
                sortOrder INT DEFAULT 0,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

        return NextResponse.json({
            success: true,
            message: 'Veritabanı tabloları manuel olarak onarıldı!'
        }, { status: 200 });
    } catch (error) {
        console.error('Manual Sync Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Onarım başarısız',
            details: error
        }, { status: 500 });
    }
}
