'use server';

import { NextResponse } from 'next/server';
import { Service, connectToDatabase } from '@/lib/models';

// Default services data for seeding
const defaultServices = [
    {
        slug: 'medikal-gazlar',
        icon: 'medical_services',
        titleTR: 'Medikal Gazlar',
        titleEN: 'Medical Gases',
        descTR: 'Sağlık sektörünün hassas ihtiyaçlarına yönelik yüksek saflıkta medikal gaz tedariki.',
        descEN: 'High-purity medical gas supply for the sensitive needs of the healthcare sector.',
        contentTR: '',
        contentEN: '',
        sortOrder: 1,
        isActive: true
    },
    {
        slug: 'endustriyel-gaz-dolumu',
        icon: 'propane_tank',
        titleTR: 'Endüstriyel Gaz Dolumu',
        titleEN: 'Industrial Gas Filling',
        descTR: 'Oksijen, azot, argon ve diğer endüstriyel gazların güvenli ve hızlı dolum hizmetleri.',
        descEN: 'Safe and fast filling services for oxygen, nitrogen, argon, and other industrial gases.',
        contentTR: '',
        contentEN: '',
        sortOrder: 2,
        isActive: true
    },
    {
        slug: 'kaynak-gazlari',
        icon: 'construction',
        titleTR: 'Kaynak Gazları',
        titleEN: 'Welding Gases',
        descTR: 'Kaynak işlemleriniz için özel karışım gazlar ve ekipman tedariki.',
        descEN: 'Special mixture gases and equipment supply for your welding operations.',
        contentTR: '',
        contentEN: '',
        sortOrder: 3,
        isActive: true
    },
    {
        slug: 'gida-gazlari',
        icon: 'restaurant',
        titleTR: 'Gıda Gazları',
        titleEN: 'Food Gases',
        descTR: 'Gıda endüstrisi için güvenli ve onaylı gaz çözümleri.',
        descEN: 'Safe and approved gas solutions for the food industry.',
        contentTR: '',
        contentEN: '',
        sortOrder: 4,
        isActive: true
    },
    {
        slug: 'ozel-gaz-karisimlari',
        icon: 'science',
        titleTR: 'Özel Gaz Karışımları',
        titleEN: 'Special Gas Mixtures',
        descTR: 'İhtiyaçlarınıza özel hazırlanan gaz karışımları ve danışmanlık.',
        descEN: 'Custom prepared gas mixtures and consultancy for your needs.',
        contentTR: '',
        contentEN: '',
        sortOrder: 5,
        isActive: true
    },
];

export async function POST() {
    try {
        await connectToDatabase();

        // Check if services already exist
        const existingCount = await Service.count();
        if (existingCount > 0) {
            return NextResponse.json({
                success: false,
                message: 'Hizmetler zaten mevcut. Seed işlemi atlandı.'
            }, { status: 200 });
        }

        // Bulk create all default services
        await Service.bulkCreate(defaultServices);

        return NextResponse.json({
            success: true,
            message: `${defaultServices.length} varsayılan hizmet başarıyla oluşturuldu!`
        }, { status: 201 });
    } catch (error) {
        console.error('Services Seed Error:', error);
        return NextResponse.json({ error: 'Failed to seed services' }, { status: 500 });
    }
}
