import { NextResponse } from 'next/server';
import { connectToDatabase, User, Address, Order } from '@/lib/models';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        await connectToDatabase();
        const sequelize = getDb();

        // Ensure connection works
        await sequelize.authenticate();

        // Sync models to create tables if they don't exist
        // alter: true safely updates columns if they exist but don't match
        await User.sync({ alter: true });
        await Address.sync({ alter: true });
        await Order.sync({ alter: true });

        return NextResponse.json({
            status: 'success',
            message: 'Database tables synchronized successfully (User, Address, Order)'
        }, { status: 200 });

    } catch (error) {
        console.error('Setup Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
