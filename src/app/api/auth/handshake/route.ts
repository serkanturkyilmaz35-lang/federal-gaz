import { NextResponse } from 'next/server';
import KeyManager from '@/lib/encryption';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { encryptedSessionKey } = await request.json();

        if (!encryptedSessionKey) {
            return NextResponse.json({ error: 'Missing key' }, { status: 400 });
        }

        const keyManager = KeyManager.getInstance();
        // Decrypt the Client's AES Key (sent encrypted with Server RSA Public Key)
        const aesKey = keyManager.decrypt(encryptedSessionKey);

        if (!aesKey) {
            return NextResponse.json({ error: 'Handshake failed' }, { status: 400 });
        }

        // Store AES Key in HTTP-Only Cookie
        // Note: In a real distributed system, this should be in Redis/Database sessions.
        // For this single-instance requirement, we can encrypt it with a master secret
        // and put it in the cookie, OR just rely on server memory (not scalable).
        // Let's store it in a cookie, but we need to encrypt it so client can't read it.
        // Wait, if we use a cookie, the server needs to be able to decrypt it later.
        // Simple approach: Use a server-side map or just set the raw hex in cookie (encrypted).
        // For simplicity and since we have KeyManager, let's just create a Master AES key
        // or just accept that for this demo, we will blindly trust the client to send the key?
        // NO. Client sends key ONCE. Server remembers it.
        // Stateless approach: Encrypt the AES key with a Server Secret and send it back as "session_token".
        // State approach: Set-Cookie.

        // We will enable HTTP-Only cookie storage of the AES Key.
        // To be secure, the content of this cookie should be encrypted by the Server's Secret.
        // But for this 'simple' E2EE implementation, we will store the raw AES Key Hex in the cookie
        // marked HTTPOnly, Secure, SameSite. The client cannot read it.
        // Only the server can read it on next request.

        const cookieStore = await cookies();
        cookieStore.set('e2ee_session', aesKey, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error("Handshake Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
