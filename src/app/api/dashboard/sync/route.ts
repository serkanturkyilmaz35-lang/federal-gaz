'use server';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { QueryTypes } from 'sequelize';

export async function POST() {
    try {
        const db = getDb();

        // 1. Tablo yapısını incele
        const columns: any[] = await db.query("SHOW COLUMNS FROM mailing_campaigns", { type: QueryTypes.SELECT });
        const existingColumns = columns.map((c: any) => c.Field);

        let message = `Tablo kolonları: ${existingColumns.join(', ')}. `;
        let actionTaken = '';

        // 2. templateSlug kontrolü ve ekleme
        const hasTemplateSlug = existingColumns.includes('templateSlug');

        if (!hasTemplateSlug) {
            try {
                await db.query("ALTER TABLE mailing_campaigns ADD COLUMN templateSlug VARCHAR(255) NOT NULL DEFAULT 'modern'");
                actionTaken = "Kolon eklendi (templateSlug).";
            } catch (e: any) {
                actionTaken = `Kolon ekleme hatası: ${e.message}`;
            }
        } else {
            actionTaken = "Kolon zaten var.";
        }

        // 3. MailingLogs
        try {
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
        } catch (e: any) {
            console.error('MailingLogs Create Error:', e);
        }

        return NextResponse.json({
            success: true,
            message: `${message} ${actionTaken}`
        }, { status: 200 });

    } catch (error) {
        console.error('Manual Sync Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Onarım başarısız',
            details: error
        }, { status: 500 });
    }
}
