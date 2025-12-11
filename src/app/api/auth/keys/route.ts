import { NextResponse } from 'next/server';
import KeyManager from '@/lib/encryption';

export async function GET() {
    try {
        const keyManager = KeyManager.getInstance();
        const publicKey = keyManager.getPublicKey();
        return NextResponse.json({ publicKey }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to retrieve public key' }, { status: 500 });
    }
}
