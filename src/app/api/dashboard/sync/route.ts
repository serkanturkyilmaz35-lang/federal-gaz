'use server';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST - Sync database (create missing tables)
export async function POST() {
    try {
        const db = getDb();

        // Import models to register them
        await import('@/lib/models');

        // Sync all models - alter: true will add missing columns without dropping data
        await db.sync({ alter: true });

        return NextResponse.json({
            success: true,
            message: 'Veritabanı tabloları senkronize edildi!'
        }, { status: 200 });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({
            error: 'Senkronizasyon başarısız',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
