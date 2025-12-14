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
                { name: 'headerImage', type: 'VARCHAR(255)' },
                { name: 'footerImage', type: 'VARCHAR(255)' },
                { name: 'headerTitle', type: 'VARCHAR(255)' },
                { name: 'bodyContent', type: 'LONGTEXT' },
                { name: 'footerContact', type: 'VARCHAR(255)' },
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

        // 4. Seed email templates if missing
        try {
            const { EmailTemplate } = await import('@/lib/models');

            const allTemplates = [
                // Genel
                { slug: 'modern', nameTR: 'Modern', nameEN: 'Modern', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#1a2744', footerTextColor: '#888888', headerTitle: "Federal Gaz'dan Önemli Duyuru", bodyContent: "Değerli müşterimiz,\n\nFederal Gaz olarak 30 yılı aşkın tecrübemizle Ankara'nın en güvenilir endüstriyel gaz tedarikçisiyiz.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 1 },
                { slug: 'classic', nameTR: 'Klasik', nameEN: 'Classic', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#1a2744', footerTextColor: '#888888', headerTitle: 'Federal Gaz Bilgilendirme', bodyContent: "Değerli müşterimiz,\n\nSize en kaliteli hizmeti sunmak için çalışıyoruz.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 2 },
                { slug: 'welcome', nameTR: 'Hoş Geldiniz', nameEN: 'Welcome', category: 'general', headerBgColor: '#1a2744', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#1a2744', footerTextColor: '#888888', headerTitle: 'Federal Gaz Ailesine Hoş Geldiniz!', bodyContent: "Değerli müşterimiz,\n\nFederal Gaz ailesine hoş geldiniz!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 3 },
                { slug: 'vip-customer', nameTR: 'VIP Müşteri', nameEN: 'VIP Customer', category: 'general', headerBgColor: '#2c3e50', headerTextColor: '#ffd700', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#c41e3a', footerBgColor: '#2c3e50', footerTextColor: '#888888', headerTitle: 'VIP Müşterimize Özel', bodyContent: "Değerli VIP müşterimiz,\n\nSizin için özel avantajlarımız var!", footerContact: 'Federal Gaz VIP Hattı | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 4 },
                { slug: 'order-confirmation', nameTR: 'Sipariş Onayı', nameEN: 'Order Confirmation', category: 'general', headerBgColor: '#27ae60', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#27ae60', footerBgColor: '#27ae60', footerTextColor: '#ffffff', headerTitle: 'Siparişiniz Alındı!', bodyContent: "Değerli müşterimiz,\n\nSiparişiniz başarıyla alındı.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 5 },
                { slug: 'shipping-notification', nameTR: 'Kargo Bildirimi', nameEN: 'Shipping Notification', category: 'general', headerBgColor: '#3498db', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#3498db', footerBgColor: '#3498db', footerTextColor: '#ffffff', headerTitle: 'Siparişiniz Yola Çıktı!', bodyContent: "Değerli müşterimiz,\n\nSiparişiniz kargoya verildi.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 6 },
                // Bayram/Kutlama
                { slug: 'new-year', nameTR: 'Yeni Yıl', nameEN: 'New Year', category: 'holiday', headerBgColor: '#1e3a5f', headerTextColor: '#ffd700', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#c41e3a', footerBgColor: '#1e3a5f', footerTextColor: '#888888', headerTitle: '🎄 Mutlu Yıllar!', bodyContent: "Değerli müşterimiz,\n\nYeni yılınız kutlu olsun!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 10 },
                { slug: 'ramazan-bayrami', nameTR: 'Ramazan Bayramı', nameEN: 'Eid al-Fitr', category: 'holiday', headerBgColor: '#1e3c72', headerTextColor: '#ffd700', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#4ecdc4', footerBgColor: '#1e3c72', footerTextColor: '#888888', headerTitle: '🌙 Ramazan Bayramınız Mübarek Olsun!', bodyContent: "Değerli müşterimiz,\n\nRamazan Bayramınızı en içten dileklerimizle kutluyoruz.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 11 },
                { slug: 'kurban-bayrami', nameTR: 'Kurban Bayramı', nameEN: 'Eid al-Adha', category: 'holiday', headerBgColor: '#2d3436', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#b13329', footerBgColor: '#2d3436', footerTextColor: '#888888', headerTitle: '🕌 Kurban Bayramınız Kutlu Olsun!', bodyContent: "Değerli müşterimiz,\n\nKurban Bayramınızı en içten dileklerimizle kutluyoruz.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32 | www.federalgaz.com', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 12 },
                { slug: '23-nisan', nameTR: '23 Nisan', nameEN: '23 April', category: 'holiday', headerBgColor: '#e30a17', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#e30a17', footerTextColor: '#ffffff', headerTitle: '🇹🇷 23 Nisan Kutlu Olsun!', bodyContent: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı kutlu olsun!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 13 },
                { slug: '19-mayis', nameTR: '19 Mayıs', nameEN: '19 May', category: 'holiday', headerBgColor: '#e30a17', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#e30a17', footerTextColor: '#ffffff', headerTitle: '🇹🇷 19 Mayıs Kutlu Olsun!', bodyContent: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı kutlu olsun!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 14 },
                { slug: '29-ekim', nameTR: '29 Ekim', nameEN: '29 October', category: 'holiday', headerBgColor: '#e30a17', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#e30a17', footerTextColor: '#ffffff', headerTitle: '🇹🇷 29 Ekim Cumhuriyet Bayramı Kutlu Olsun!', bodyContent: "Cumhuriyetimizin kuruluşunu kutluyoruz!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 15 },
                { slug: '30-agustos', nameTR: '30 Ağustos', nameEN: '30 August', category: 'holiday', headerBgColor: '#e30a17', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#e30a17', footerTextColor: '#ffffff', headerTitle: '🇹🇷 30 Ağustos Zafer Bayramı Kutlu Olsun!', bodyContent: "Büyük Zaferin yıl dönümünü kutluyoruz!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 16 },
                { slug: '10-kasim', nameTR: '10 Kasım', nameEN: '10 November', category: 'holiday', headerBgColor: '#1a1a1a', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a1a1a', footerBgColor: '#1a1a1a', footerTextColor: '#888888', headerTitle: '10 Kasım - Atatürk\'ü Anıyoruz', bodyContent: "Ulu Önder Mustafa Kemal Atatürk'ü saygı ve minnetle anıyoruz.", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 17 },
                // Promosyon
                { slug: 'black-friday', nameTR: 'Efsane Cuma', nameEN: 'Black Friday', category: 'promotion', headerBgColor: '#000000', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#ff2d2d', footerBgColor: '#000000', footerTextColor: '#888888', headerTitle: '🔥 EFSANE CUMA BAŞLADI!', bodyContent: "Yılın en büyük indirim kampanyası Federal Gaz'da!", footerContact: 'Hemen sipariş verin! Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 20 },
                { slug: 'weekend-sale', nameTR: 'Hafta Sonu İndirimi', nameEN: 'Weekend Sale', category: 'promotion', headerBgColor: '#667eea', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#f093fb', footerBgColor: '#667eea', footerTextColor: '#ffffff', headerTitle: '🎉 Hafta Sonu Özel İndirimi!', bodyContent: "Sadece bu hafta sonu geçerli özel fiyatlar!", footerContact: 'Sipariş için: Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 21 },
                { slug: 'winter-campaign', nameTR: 'Kış Kampanyası', nameEN: 'Winter Campaign', category: 'promotion', headerBgColor: '#74ebd5', headerTextColor: '#1a2744', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#74ebd5', footerTextColor: '#1a2744', headerTitle: '❄️ Kış Kampanyası Başladı!', bodyContent: "Kış aylarına özel kampanyamızdan yararlanın!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 22 },
                { slug: 'summer-campaign', nameTR: 'Yaz Kampanyası', nameEN: 'Summer Campaign', category: 'promotion', headerBgColor: '#f39c12', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#e74c3c', footerBgColor: '#f39c12', footerTextColor: '#ffffff', headerTitle: '☀️ Yaz Kampanyası!', bodyContent: "Yaz aylarına özel fırsatlar!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 23 },
                { slug: 'promotion', nameTR: 'Kampanya / İndirim', nameEN: 'Promotion', category: 'promotion', headerBgColor: '#ff6b35', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#ff6b35', footerTextColor: '#ffffff', headerTitle: '🎁 Özel Kampanya Fırsatı!', bodyContent: "Size özel kampanyamızı duyurmaktan mutluluk duyuyoruz!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 24 },
                { slug: 'stock-reminder', nameTR: 'Stok Hatırlatma', nameEN: 'Stock Reminder', category: 'promotion', headerBgColor: '#2ecc71', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#1a2744', footerBgColor: '#2ecc71', footerTextColor: '#ffffff', headerTitle: '📦 Stok Hatırlatması', bodyContent: "Gaz stoklarınızın azaldığını fark ettik.", footerContact: 'Sipariş için: Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 25 },
                { slug: 'flash-sale', nameTR: 'Flaş İndirim', nameEN: 'Flash Sale', category: 'promotion', headerBgColor: '#9b59b6', headerTextColor: '#ffffff', bodyBgColor: '#ffffff', bodyTextColor: '#333333', buttonColor: '#8e44ad', footerBgColor: '#9b59b6', footerTextColor: '#ffffff', headerTitle: '⚡ Flaş İndirim!', bodyContent: "Sınırlı süre, sınırlı stok!", footerContact: 'Federal Gaz | Tel: 0312 354 32 32', headerHtml: '', footerHtml: '', isActive: true, sortOrder: 26 },
            ];

            let seededCount = 0;
            for (const tmpl of allTemplates) {
                const exists = await EmailTemplate.findOne({ where: { slug: tmpl.slug } });
                if (!exists) {
                    await EmailTemplate.create(tmpl as any);
                    seededCount++;
                }
            }
            results.push(`email_templates(${seededCount} yeni şablon eklendi)`);
        } catch (e: any) {
            results.push(`email_templates seed(HATA: ${e.message})`);
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
