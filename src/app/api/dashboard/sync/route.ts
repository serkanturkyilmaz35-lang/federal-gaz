'use server';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST - Sync database (create missing tables manually)
export async function POST() {
    try {
        const db = getDb();
        const queryInterface = db.getQueryInterface();

        // 1. MailingCampaigns tablosuna templateSlug ekle
        try {
            await db.query(`
                ALTER TABLE mailing_campaigns 
                ADD COLUMN IF NOT EXISTS templateSlug VARCHAR(255) NOT NULL DEFAULT 'modern';
            `);
        } catch (e: any) {
            // IF NOT EXISTS desteklenmiyorsa veya başka hata varsa logla ama devam et (kolon zaten olabilir)
            console.log('Column add warning:', e.message);
        }

        // 2. MailingLogs tablosunu oluştur
        // Basit haliyle, indexsiz (PK hariç)
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

        // 3. EmailTemplates tablosunu oluştur (Eğer yoksa)
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
