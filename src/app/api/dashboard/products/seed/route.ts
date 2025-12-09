import { NextResponse } from 'next/server';
import { Product, connectToDatabase } from '@/lib/models';

// Default products from current website
const defaultProducts = [
    {
        slug: 'medikal-gazlar',
        slugEN: 'medical-gases',
        titleTR: 'Medikal Gazlar',
        titleEN: 'Medical Gases',
        descTR: 'Oksijen, Azot Protoksit, Medikal Hava',
        descEN: 'Oxygen, Nitrous Oxide, Medical Air',
        contentTR: 'Hastaneler ve sağlık kuruluşları için yüksek saflıkta medikal gazlar.',
        contentEN: 'High purity medical gases for hospitals and healthcare facilities.',
        image: '/products/medikal-gazlar-custom.jpg',
        sortOrder: 1,
    },
    {
        slug: 'endustriyel-gazlar',
        slugEN: 'industrial-gases',
        titleTR: 'Endüstriyel Gazlar',
        titleEN: 'Industrial Gases',
        descTR: 'Oksijen, Azot, Argon, Karbondioksit',
        descEN: 'Oxygen, Nitrogen, Argon, Carbon Dioxide',
        contentTR: 'Endüstriyel üretim ve imalat süreçleri için gazlar.',
        contentEN: 'Gases for industrial production and manufacturing processes.',
        image: '/products/endustriyel-gazlar-custom.jpg',
        sortOrder: 2,
    },
    {
        slug: 'kaynak-gazlari',
        slugEN: 'welding-gases',
        titleTR: 'Kaynak Gazları',
        titleEN: 'Welding Gases',
        descTR: 'Asetilen, Propan, Karışım Gazlar',
        descEN: 'Acetylene, Propane, Mixture Gases',
        contentTR: 'Kaynak ve kesme işlemleri için özel gazlar.',
        contentEN: 'Special gases for welding and cutting operations.',
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=60',
        sortOrder: 3,
    },
    {
        slug: 'gida-gazlari',
        slugEN: 'food-gases',
        titleTR: 'Gıda Gazları',
        titleEN: 'Food Gases',
        descTR: 'CO2, N2, Karışım Gazlar',
        descEN: 'CO2, N2, Mixture Gases',
        contentTR: 'Gıda ambalajlama ve işleme için gazlar.',
        contentEN: 'Gases for food packaging and processing.',
        image: '/products/gida-gazlari-custom.jpg',
        sortOrder: 4,
    },
    {
        slug: 'ozel-gazlar',
        slugEN: 'special-gases',
        titleTR: 'Özel Gazlar',
        titleEN: 'Special Gases',
        descTR: 'Kalibrasyon, Analitik Gazlar',
        descEN: 'Calibration, Analytical Gases',
        contentTR: 'Laboratuvar ve kalibrasyon işlemleri için özel gazlar.',
        contentEN: 'Special gases for laboratory and calibration operations.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60',
        sortOrder: 5,
    },
    {
        slug: 'kriyojenik-sivilar',
        slugEN: 'cryogenic-liquids',
        titleTR: 'Kriyojenik Sıvılar',
        titleEN: 'Cryogenic Liquids',
        descTR: 'Sıvı Azot, Sıvı Oksijen, Sıvı Argon',
        descEN: 'Liquid Nitrogen, Liquid Oxygen, Liquid Argon',
        contentTR: 'Düşük sıcaklık uygulamaları için kriyojenik sıvılar.',
        contentEN: 'Cryogenic liquids for low temperature applications.',
        image: '/products/kriyojenik-sivilar-custom.jpg',
        sortOrder: 6,
    },
];

// POST - Seed default products
export async function POST() {
    try {
        await connectToDatabase();

        const existingCount = await Product.count();

        if (existingCount > 0) {
            return NextResponse.json({
                message: 'Products already exist, skipping seed',
                count: existingCount
            });
        }

        for (const product of defaultProducts) {
            await Product.create(product);
        }

        return NextResponse.json({
            success: true,
            message: `${defaultProducts.length} products seeded successfully`
        });
    } catch (error) {
        console.error('Seed Products Error:', error);
        return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 });
    }
}
