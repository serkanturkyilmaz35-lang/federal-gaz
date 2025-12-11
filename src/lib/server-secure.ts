import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import KeyManager from '@/lib/encryption';

export async function decryptRequest(request: Request) {
    const cookieStore = await cookies();
    const sessionKeyHex = cookieStore.get('e2ee_session')?.value;

    if (!sessionKeyHex) {
        throw new Error("E2EE Session Missing");
    }

    const payload = await request.json();
    const { encryptedData } = payload;

    if (!encryptedData) {
        throw new Error("Missing encrypted data");
    }

    const keyManager = KeyManager.getInstance();
    const decryptedJson = keyManager.decryptAES(encryptedData, sessionKeyHex);

    if (!decryptedJson) {
        throw new Error("Decryption Failed on Server");
    }

    return JSON.parse(decryptedJson);
}

export async function encryptResponse(data: any, status: number = 200) {
    const cookieStore = await cookies();
    const sessionKeyHex = cookieStore.get('e2ee_session')?.value;

    if (!sessionKeyHex) {
        return NextResponse.json({ error: "E2EE Session Missing During Response" }, { status: 500 });
    }

    const keyManager = KeyManager.getInstance();
    const json = JSON.stringify(data);
    const encryptedData = keyManager.encryptAES(json, sessionKeyHex);

    if (!encryptedData) {
        return NextResponse.json({ error: "Encryption Failed on Server" }, { status: 500 });
    }

    return NextResponse.json({ encryptedData }, { status });
}
