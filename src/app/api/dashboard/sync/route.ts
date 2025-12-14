'use server';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { QueryTypes } from 'sequelize';

// Eksik kolon ekleme yardımcı fonksiyonu
async function addColumnIfMissing(db: any, existingColumns: string[], columnName: string, columnDef: string): Promise<string> {
    if (!existingColumns.includes(columnName)) {
        try {
            await db.query(`ALTER TABLE mailing_campaigns ADD COLUMN ${columnName} ${columnDef}`);
            return `${columnName}(eklendi)`;
        } catch (e: any) {
            if (e.original?.errno === 1060) {
                return `${columnName}(zaten var)`;
            }
            return `${columnName}(HATA: ${e.message})`;
        }
    }
    return `${columnName}(var)`;
}

export async function POST() {
    try {
        const db = getDb();

        // 1. Tablo yapısını incele
        const columns: any[] = await db.query("SHOW COLUMNS FROM mailing_campaigns", { type: QueryTypes.SELECT });
        const existingColumns = columns.map((c: any) => c.Field);

        const results: string[] = [];

        // 2. Tüm eksik kolonları ekle
        results.push(await addColumnIfMissing(db, existingColumns, 'templateSlug', "VARCHAR(255) NOT NULL DEFAULT 'modern'"));
        results.push(await addColumnIfMissing(db, existingColumns, 'recipientType', "ENUM('all', 'members', 'guests', 'custom', 'external') DEFAULT 'all'"));
        results.push(await addColumnIfMissing(db, existingColumns, 'recipientIds', "TEXT"));
        results.push(await addColumnIfMissing(db, existingColumns, 'externalRecipients', "LONGTEXT"));
        results.push(await addColumnIfMissing(db, existingColumns, 'status', "ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled') DEFAULT 'draft'"));
        results.push(await addColumnIfMissing(db, existingColumns, 'scheduledAt', "DATETIME"));
        results.push(await addColumnIfMissing(db, existingColumns, 'sentAt', "DATETIME"));
        results.push(await addColumnIfMissing(db, existingColumns, 'recipientCount', "INT DEFAULT 0"));
        results.push(await addColumnIfMissing(db, existingColumns, 'sentCount', "INT DEFAULT 0"));
        results.push(await addColumnIfMissing(db, existingColumns, 'failedCount', "INT DEFAULT 0"));
        results.push(await addColumnIfMissing(db, existingColumns, 'openCount', "INT DEFAULT 0"));
        results.push(await addColumnIfMissing(db, existingColumns, 'clickCount', "INT DEFAULT 0"));
        results.push(await addColumnIfMissing(db, existingColumns, 'errorLog', "LONGTEXT"));
        results.push(await addColumnIfMissing(db, existingColumns, 'customLogoUrl', "VARCHAR(255)"));
        results.push(await addColumnIfMissing(db, existingColumns, 'customProductImageUrl', "VARCHAR(255)"));
        results.push(await addColumnIfMissing(db, existingColumns, 'campaignTitle', "VARCHAR(255)"));
        results.push(await addColumnIfMissing(db, existingColumns, 'campaignHighlight', "VARCHAR(255)"));

        // 2.5 Update recipientType ENUM to include 'external' if it exists but doesn't have 'external'
        try {
            await db.query(`ALTER TABLE mailing_campaigns MODIFY COLUMN recipientType ENUM('all', 'members', 'guests', 'custom', 'external') DEFAULT 'all'`);
            results.push('recipientType(ENUM güncellendi)');
        } catch (e: any) {
            results.push(`recipientType(ENUM: ${e.message.substring(0, 50)})`);
        }

        // Add logoUrl to email_templates if it doesn't exist
        try {
            const emailTemplatesColumns: any[] = await db.query("SHOW COLUMNS FROM email_templates", { type: QueryTypes.SELECT });
            const existingEmailTemplatesColumns = emailTemplatesColumns.map((c: any) => c.Field);

            // Add missing columns
            const columnsToAdd = [
                { name: 'logoUrl', type: 'VARCHAR(255)' },
                { name: 'bodyBgColor', type: "VARCHAR(50) DEFAULT '#ffffff'" },
                { name: 'bodyTextColor', type: "VARCHAR(50) DEFAULT '#333333'" },
                { name: 'footerBgColor', type: "VARCHAR(50) DEFAULT '#1a2744'" },
                { name: 'footerTextColor', type: "VARCHAR(50) DEFAULT '#888888'" },
            ];

            for (const col of columnsToAdd) {
                if (!existingEmailTemplatesColumns.includes(col.name)) {
                    await db.query(`ALTER TABLE email_templates ADD COLUMN ${col.name} ${col.type}`);
                    results.push(`email_templates.${col.name}(eklendi)`);
                } else {
                    results.push(`email_templates.${col.name}(var)`);
                }
            }
        } catch (e: any) {
            if (e.original?.errno === 1060) {
                results.push('email_templates columns(zaten var)');
            } else {
                results.push(`email_templates columns(HATA: ${e.message})`);
            }
        }

        // 3. MailingLogs tablosunu oluştur
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
            results.push('mailing_logs(tablo hazır)');
        } catch (e: any) {
            results.push(`mailing_logs(HATA: ${e.message})`);
        }

        return NextResponse.json({
            success: true,
            message: `Veritabanı güncellendi. Sonuçlar: ${results.join(', ')}`
        }, { status: 200 });

    } catch (error) {
        console.error('Manual Sync Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Onarım başarısız',
            details: error
        }, { status: 500 });
    }
}
