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
];

export async function POST() {
    try {
        await connectToDatabase();

        // Check if templates already exist
        const existingCount = await EmailTemplate.count();
        if (existingCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Şablonlar zaten mevcut. Seed işlemi atlandı.'
            }, { status: 200 });
        }

        // Bulk create all default templates
        await EmailTemplate.bulkCreate(defaultTemplates);

        return NextResponse.json({
            success: true,
            message: `${defaultTemplates.length} e-posta şablonu başarıyla oluşturuldu!`
        }, { status: 201 });
    } catch (error) {
        console.error('Templates Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed templates' }, { status: 500 });
    }
}
