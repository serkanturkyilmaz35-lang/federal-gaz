'use server';

import { NextResponse } from 'next/server';
import { EmailTemplate, connectToDatabase } from '@/lib/models';

// Default templates including special occasions
const defaultTemplates = [
    // General Templates
    {
        slug: 'modern',
        nameTR: 'Modern',
        nameEN: 'Modern',
        category: 'general' as const,
        headerBgColor: 'linear-gradient(135deg, #1a2744 0%, #0a1628 100%)',
        headerTextColor: '#ffffff',
        buttonColor: 'linear-gradient(135deg, #b13329 0%, #8b1a12 100%)',
        headerHtml: `<div style="padding: 40px 30px; text-align: center;">
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: {{headerTextColor}}; margin: 0; font-size: 28px; font-weight: 600;">{{subject}}</h1>
        </div>`,
        footerHtml: `<div style="background-color: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara | Tüm Hakları Saklıdır</p>
        </div>`,
        sortOrder: 1,
    },
    {
        slug: 'classic',
        nameTR: 'Klasik',
        nameEN: 'Classic',
        category: 'general' as const,
        headerBgColor: '#1a2744',
        headerTextColor: '#ffffff',
        buttonColor: '#b13329',
        headerHtml: `<div style="background-color: #1a2744; padding: 25px; text-align: center; border-bottom: 4px solid #b13329;">
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px;">
        </div>
        <div style="background-color: #f0f4f8; padding: 20px 30px; border-bottom: 1px solid #e0e0e0;">
            <h1 style="color: #1a2744; margin: 0; font-size: 24px; font-weight: normal;">{{subject}}</h1>
        </div>`,
        footerHtml: `<div style="background-color: #f5f5f5; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; margin: 0 0 8px; font-size: 13px;">Federal Gaz - Ankara</p>
            <p style="color: #888; margin: 0 0 8px; font-size: 12px;">Tel: (0312) 395 35 95 | E-posta: federal.gaz@hotmail.com</p>
            <p style="color: #999; margin: 0; font-size: 11px;">© {{year}} Tüm Hakları Saklıdır</p>
        </div>`,
        sortOrder: 2,
    },
    // Holiday Templates
    {
        slug: 'new-year',
        nameTR: 'Yeni Yıl',
        nameEN: 'New Year',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #1e3a5f 0%, #0d1f33 100%)',
        headerTextColor: '#ffd700',
        buttonColor: '#c41e3a',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1f33 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 15px;">🎄✨🎆</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffd700; margin: 0; font-size: 32px; font-weight: 600;">Mutlu Yıllar!</h1>
            <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1f33 100%); padding: 30px; text-align: center;">
            <p style="color: #ffd700; margin: 0 0 10px; font-size: 18px;">🎊 Yeni yılınız kutlu olsun! 🎊</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara</p>
        </div>`,
        sortOrder: 10,
    },
    {
        slug: '23-nisan',
        nameTR: '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı',
        nameEN: '23 April National Sovereignty and Children\'s Day',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #e30a17 0%, #b30813 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #e30a17 0%, #b30813 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🇹🇷🎈🎉</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">23 Nisan Ulusal Egemenlik ve Çocuk Bayramı</h1>
            <p style="color: #ffe4e1; margin: 10px 0 0; font-size: 14px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #e30a17; margin: 0 0 10px; font-size: 16px;">🇹🇷 Egemenlik Kayıtsız Şartsız Milletindir 🇹🇷</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 11,
    },
    {
        slug: '19-mayis',
        nameTR: '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
        nameEN: '19 May Commemoration of Atatürk, Youth and Sports Day',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #e30a17 0%, #b30813 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #e30a17 0%, #b30813 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🇹🇷⚽🏃</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı</h1>
            <p style="color: #ffe4e1; margin: 10px 0 0; font-size: 14px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #e30a17; margin: 0 0 10px; font-size: 16px;">🇹🇷 Gençliğe Hitabe 🇹🇷</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 12,
    },
    {
        slug: '30-agustos',
        nameTR: '30 Ağustos Zafer Bayramı',
        nameEN: '30 August Victory Day',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
        headerTextColor: '#ffd700',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #c41e3a 0%, #8b0000 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🇹🇷🎖️⭐</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 600;">30 Ağustos Zafer Bayramı</h1>
            <p style="color: #ffffff; margin: 10px 0 0; font-size: 14px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #ffd700; margin: 0 0 10px; font-size: 16px;">🇹🇷 Zafer Bayramımız Kutlu Olsun 🇹🇷</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 13,
    },
    {
        slug: '29-ekim',
        nameTR: '29 Ekim Cumhuriyet Bayramı',
        nameEN: '29 October Republic Day',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #e30a17 0%, #8b0000 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #e30a17 0%, #8b0000 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🇹🇷🎆🎊</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">29 Ekim Cumhuriyet Bayramı</h1>
            <p style="color: #ffe4e1; margin: 10px 0 0; font-size: 14px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #e30a17; margin: 0 0 10px; font-size: 18px;">🇹🇷 Cumhuriyetimizin {{year - 1923}}. Yılı Kutlu Olsun! 🇹🇷</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 14,
    },
    // Promotion Template
    {
        slug: 'promotion',
        nameTR: 'Kampanya / İndirim',
        nameEN: 'Promotion / Discount',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🔥💰🎁</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">ÖZEL KAMPANYA!</h1>
            <p style="color: #fff3cd; margin: 10px 0 0; font-size: 18px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #ff6b35; margin: 0 0 10px; font-size: 16px;">🔥 Bu fırsatı kaçırmayın! 🔥</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 20,
    },
    // ==================== MARKETING TEMPLATES ====================
    // Stock Reminder
    {
        slug: 'stock-reminder',
        nameTR: 'Stok Hatırlatma',
        nameEN: 'Stock Reminder',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">⏰🔄📦</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Stok Yenileme Zamanı!</h1>
            <p style="color: #d4edda; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #2ecc71; margin: 0 0 10px; font-size: 16px;">📦 Tüpünüz bitmeden sipariş verin!</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 21,
    },
    // Win-back / Geri Kazanım
    {
        slug: 'win-back',
        nameTR: 'Geri Kazanım',
        nameEN: 'Win-back',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#e74c3c',
        headerHtml: `<div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">💜👋🎁</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Sizi Özledik!</h1>
            <p style="color: #e8daef; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #9b59b6; margin: 0 0 10px; font-size: 16px;">💜 Size özel %10 indirim kodu: HOŞGELDIN</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 22,
    },
    // Review Request
    {
        slug: 'review-request',
        nameTR: 'Değerlendirme İsteği',
        nameEN: 'Review Request',
        category: 'general' as const,
        headerBgColor: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#f39c12',
        headerHtml: `<div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">⭐💬📝</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Fikrinizi Önemsiyoruz</h1>
            <p style="color: #d6eaf8; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #f39c12; margin: 0 0 10px; font-size: 16px;">⭐ Bizi değerlendirin, hediye kazanın!</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 23,
    },
    // Anniversary / Yıldönümü
    {
        slug: 'anniversary',
        nameTR: 'Müşteri Yıldönümü',
        nameEN: 'Customer Anniversary',
        category: 'general' as const,
        headerBgColor: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
        headerTextColor: '#1a2744',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">🎂🎉🎁</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #1a2744; margin: 0; font-size: 28px; font-weight: 600;">Birlikteyiz!</h1>
            <p style="color: #5d4e37; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #f1c40f; margin: 0 0 10px; font-size: 16px;">🎁 Yıldönümünüze özel hediye!</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 24,
    },
    // Season Opening / Sezon Açılış
    {
        slug: 'season-opening',
        nameTR: 'Sezon Açılış',
        nameEN: 'Season Opening',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#1a2744',
        headerHtml: `<div style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">❄️🔥📣</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Kış Sezonu Başladı!</h1>
            <p style="color: #fdebd0; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #e67e22; margin: 0 0 10px; font-size: 16px;">❄️ Sezon kampanyalarını kaçırmayın!</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 25,
    },
    // VIP Customer
    {
        slug: 'vip-customer',
        nameTR: 'VIP Müşteri',
        nameEN: 'VIP Customer',
        category: 'general' as const,
        headerBgColor: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
        headerTextColor: '#ffd700',
        buttonColor: '#c41e3a',
        headerHtml: `<div style="background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%); padding: 40px 30px; text-align: center;">
            <div style="font-size: 50px; margin-bottom: 15px;">👑💎⭐</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 15px;">
            <h1 style="color: #ffd700; margin: 0; font-size: 28px; font-weight: 600;">VIP Müşterimiz</h1>
            <p style="color: #ffffff; margin: 10px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <p style="color: #ffd700; margin: 0 0 10px; font-size: 16px;">👑 Size özel ayrıcalıklar!</p>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 26,
    },
    // ==================== SPECIAL CAMPAIGN TEMPLATES ====================
    // Black Friday / Efsane Cuma
    {
        slug: 'black-friday',
        nameTR: 'Efsane Cuma',
        nameEN: 'Black Friday',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#ff2d2d',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%); padding: 50px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 10px; right: 20px; background: #ff2d2d; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; animation: pulse 1.5s infinite;">CANLI</div>
            <div style="font-size: 70px; margin-bottom: 10px;">🔥💥🛒</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 42px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px;">EFSANE CUMA</h1>
            <div style="background: linear-gradient(90deg, #ff2d2d, #ff6b35, #ff2d2d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 60px; font-weight: 900; margin: 15px 0;">%40'a VARAN</div>
            <p style="color: #ffd700; margin: 0; font-size: 24px; font-weight: 600;">İNDİRİM</p>
            <p style="color: #ffffff; margin: 15px 0 0; font-size: 16px; opacity: 0.9;">{{subject}}</p>
            <div style="margin-top: 25px; display: inline-block; background: rgba(255,255,255,0.1); padding: 15px 30px; border-radius: 10px; border: 2px solid #ff2d2d;">
                <p style="color: #ff2d2d; margin: 0; font-size: 14px;">⏰ SADECE BU HAFTA SONU GEÇERLİ!</p>
            </div>
        </div>`,
        footerHtml: `<div style="background: linear-gradient(135deg, #000000 0%, #1a1a2e 100%); padding: 35px; text-align: center;">
            <div style="margin-bottom: 20px;">
                <img src="https://www.federalgaz.com/images/products/12kg-tup.webp" alt="Tüp" style="height: 80px; margin: 0 10px;">
                <img src="https://www.federalgaz.com/images/products/oksijen-tupu.webp" alt="Oksijen" style="height: 80px; margin: 0 10px;">
            </div>
            <p style="color: #ff2d2d; margin: 0 0 10px; font-size: 20px; font-weight: bold;">🔥 Bu Fırsatı Kaçırmayın! 🔥</p>
            <a href="https://www.federalgaz.com/siparis" style="display: inline-block; background: linear-gradient(135deg, #ff2d2d 0%, #cc0000 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 18px; margin: 15px 0;">HEDİYENİZİ ALIN →</a>
            <p style="color: #ffffff; margin: 20px 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #666; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara</p>
        </div>`,
        sortOrder: 30,
    },
    // Weekend / Sunday Sale
    {
        slug: 'weekend-sale',
        nameTR: 'Hafta Sonu İndirimi',
        nameEN: 'Weekend Sale',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#f093fb',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 45px 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 15px;">🎉🛍️💜</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700;">HAFTA SONU</h1>
            <div style="color: #ffd700; font-size: 48px; font-weight: 800; margin: 10px 0;">ÖZEL İNDİRİM</div>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 18px;">{{subject}}</p>
            <div style="margin-top: 20px; background: rgba(255,255,255,0.2); display: inline-block; padding: 12px 25px; border-radius: 25px;">
                <span style="color: white; font-weight: 600;">⏰ Cumartesi - Pazar Geçerli</span>
            </div>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 30px; text-align: center;">
            <div style="margin-bottom: 15px;">
                <img src="https://www.federalgaz.com/images/products/12kg-tup.webp" alt="Tüp" style="height: 60px; margin: 0 8px;">
            </div>
            <p style="color: #f093fb; margin: 0 0 10px; font-size: 16px;">💜 Hafta sonu alışverişin tadını çıkarın!</p>
            <a href="https://www.federalgaz.com/siparis" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">ŞİMDİ SİPARİŞ VERİN</a>
            <p style="color: #ffffff; margin: 15px 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz</p>
        </div>`,
        sortOrder: 31,
    },
    // Ramazan Bayramı
    {
        slug: 'ramazan-bayrami',
        nameTR: 'Ramazan Bayramı',
        nameEN: 'Eid al-Fitr',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        headerTextColor: '#ffd700',
        buttonColor: '#4ecdc4',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 50px 30px; text-align: center;">
            <div style="font-size: 70px; margin-bottom: 15px;">🌙✨🕌</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <h1 style="color: #ffd700; margin: 0; font-size: 36px; font-weight: 700;">RAMAZAN BAYRAMIMIZ</h1>
            <p style="color: #ffffff; font-size: 28px; margin: 10px 0; font-weight: 600;">MÜBAREK OLSUN</p>
            <div style="width: 100px; height: 3px; background: #ffd700; margin: 20px auto;"></div>
            <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: linear-gradient(135deg, #1a2744 0%, #0a1628 100%); padding: 35px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 15px;">🌙✨</div>
            <p style="color: #ffd700; margin: 0 0 10px; font-size: 18px;">Bayramınız Kutlu, Sofralarınız Bereketli Olsun</p>
            <p style="color: rgba(255,255,255,0.8); margin: 0 0 20px; font-size: 14px;">Sevdiklerinizle birlikte huzurlu bir bayram geçirmenizi dileriz.</p>
            <div style="margin-bottom: 20px;">
                <img src="https://www.federalgaz.com/images/products/12kg-tup.webp" alt="Tüp" style="height: 60px;">
            </div>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara</p>
        </div>`,
        sortOrder: 15,
    },
    // Kurban Bayramı
    {
        slug: 'kurban-bayrami',
        nameTR: 'Kurban Bayramı',
        nameEN: 'Eid al-Adha',
        category: 'holiday' as const,
        headerBgColor: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#b13329',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #2d3436 0%, #000000 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"2\" fill=\"rgba(255,215,0,0.1)\"/></svg>') repeat; opacity: 0.3;"></div>
            <div style="position: relative; z-index: 1;">
                <div style="font-size: 70px; margin-bottom: 15px;">🐑🌙✨</div>
                <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
                <h1 style="color: #ffd700; margin: 0; font-size: 36px; font-weight: 700;">KURBAN BAYRAMIMIZ</h1>
                <p style="color: #ffffff; font-size: 28px; margin: 10px 0; font-weight: 600;">MÜBAREK OLSUN</p>
                <div style="width: 100px; height: 3px; background: linear-gradient(90deg, transparent, #ffd700, transparent); margin: 20px auto;"></div>
                <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0; font-size: 16px;">{{subject}}</p>
            </div>
        </div>`,
        footerHtml: `<div style="background: linear-gradient(135deg, #1a2744 0%, #0a1628 100%); padding: 35px; text-align: center;">
            <div style="font-size: 40px; margin-bottom: 15px;">🐑🌙</div>
            <p style="color: #ffd700; margin: 0 0 10px; font-size: 18px;">Kurbanlarınız Kabul, Bayramınız Kutlu Olsun</p>
            <p style="color: rgba(255,255,255,0.8); margin: 0 0 20px; font-size: 14px;">Tüm İslam aleminin Kurban Bayramını kutlarız.</p>
            <div style="margin-bottom: 20px;">
                <img src="https://www.federalgaz.com/images/products/12kg-tup.webp" alt="Tüp" style="height: 60px;">
            </div>
            <p style="color: #ffffff; margin: 0 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara</p>
        </div>`,
        sortOrder: 16,
    },
    // Winter Campaign / Kış Kampanyası
    {
        slug: 'winter-campaign',
        nameTR: 'Kış Kampanyası',
        nameEN: 'Winter Campaign',
        category: 'promotion' as const,
        headerBgColor: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)',
        headerTextColor: '#1a2744',
        buttonColor: '#1a2744',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%); padding: 50px 30px; text-align: center; position: relative;">
            <div style="font-size: 60px; margin-bottom: 15px;">❄️🔥☃️</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 50px; margin-bottom: 20px;">
            <h1 style="color: #1a2744; margin: 0; font-size: 38px; font-weight: 700;">KIŞ KAMPANYASI</h1>
            <div style="color: #b13329; font-size: 32px; font-weight: 800; margin: 15px 0;">SICAK FİYATLAR!</div>
            <p style="color: #1a2744; margin: 0; font-size: 18px; opacity: 0.8;">{{subject}}</p>
            <div style="margin-top: 25px; background: rgba(26,39,68,0.1); display: inline-block; padding: 15px 30px; border-radius: 10px;">
                <p style="color: #1a2744; margin: 0; font-weight: 600;">❄️ Kış boyunca geçerli avantajlar!</p>
            </div>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 35px; text-align: center;">
            <div style="margin-bottom: 15px;">
                <img src="https://www.federalgaz.com/images/products/12kg-tup.webp" alt="Tüp" style="height: 70px; margin: 0 10px;">
                <img src="https://www.federalgaz.com/images/products/oksijen-tupu.webp" alt="Oksijen" style="height: 70px; margin: 0 10px;">
            </div>
            <p style="color: #74ebd5; margin: 0 0 15px; font-size: 18px;">❄️ Soğuk havalarda sıcacık kalın! ❄️</p>
            <a href="https://www.federalgaz.com/siparis" style="display: inline-block; background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%); color: #1a2744; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">KAMPANYAYI İNCELE</a>
            <p style="color: #ffffff; margin: 20px 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara</p>
        </div>`,
        sortOrder: 32,
    },
    // Welcome / Hoş Geldiniz
    {
        slug: 'welcome',
        nameTR: 'Hoş Geldiniz',
        nameEN: 'Welcome',
        category: 'general' as const,
        headerBgColor: 'linear-gradient(135deg, #1a2744 0%, #2d4a7c 100%)',
        headerTextColor: '#ffffff',
        buttonColor: '#b13329',
        bannerImage: '',
        headerHtml: `<div style="background: linear-gradient(135deg, #1a2744 0%, #2d4a7c 100%); padding: 50px 30px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 15px;">👋🎉💙</div>
            <img src="{{logoUrl}}" alt="Federal Gaz" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700;">HOŞ GELDİNİZ!</h1>
            <p style="color: #ffd700; font-size: 20px; margin: 15px 0;">Federal Gaz Ailesine Katıldınız</p>
            <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">{{subject}}</p>
        </div>`,
        footerHtml: `<div style="background: #1a2744; padding: 35px; text-align: center;">
            <div style="background: rgba(255,255,255,0.1); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
                <p style="color: #ffffff; margin: 0 0 10px; font-size: 16px;">🎁 İlk Siparişinize Özel</p>
                <div style="color: #b13329; font-size: 32px; font-weight: bold;">%10 İNDİRİM</div>
                <p style="color: #ffd700; margin: 10px 0 0; font-size: 14px;">Kod: HOSGELDIN</p>
            </div>
            <div style="margin-bottom: 20px;">
                <img src="https://www.federalgaz.com/images/products/12kg-tup.webp" alt="Tüp" style="height: 60px;">
            </div>
            <a href="https://www.federalgaz.com/siparis" style="display: inline-block; background: #b13329; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">İLK SİPARİŞİNİZİ VERİN</a>
            <p style="color: #ffffff; margin: 20px 0 10px; font-size: 14px;">📞 (0312) 395 35 95 | 📧 federal.gaz@hotmail.com</p>
            <p style="color: #8899aa; margin: 0; font-size: 12px;">© {{year}} Federal Gaz - Ankara</p>
        </div>`,
        sortOrder: 27,
    },
];

export async function POST() {
    try {
        await connectToDatabase();

        let created = 0;
        let updated = 0;

        // Upsert each template - update if exists, create if not
        for (const templateData of defaultTemplates) {
            const existing = await EmailTemplate.findOne({ where: { slug: templateData.slug } });

            if (existing) {
                // Update existing template
                await existing.update(templateData);
                updated++;
            } else {
                // Create new template
                await EmailTemplate.create(templateData as any);
                created++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Şablonlar güncellendi! ${created} yeni eklendi, ${updated} güncellendi.`
        }, { status: 200 });
    } catch (error) {
        console.error('Templates Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed templates' }, { status: 500 });
    }
}
