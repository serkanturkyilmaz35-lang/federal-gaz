import forge from 'node-forge';

// Use globalThis to persist across hot-reloads in development
declare global {
    // eslint-disable-next-line no-var
    var _keyManagerInstance: KeyManager | undefined;
}

class KeyManager {
    private static instance: KeyManager;
    private keyPair: forge.pki.KeyPair;

    private constructor() {
        console.log("Generating RSA Key Pair...");
        this.keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
        console.log("RSA Key Pair Generated.");
    }

    public static getInstance(): KeyManager {
        // In development, use globalThis to persist across hot-reloads
        if (process.env.NODE_ENV === 'development') {
            if (!globalThis._keyManagerInstance) {
                globalThis._keyManagerInstance = new KeyManager();
            }
            return globalThis._keyManagerInstance;
        }

        // In production, use regular singleton
        if (!KeyManager.instance) {
            KeyManager.instance = new KeyManager();
        }
        return KeyManager.instance;
    }

    public getPublicKey(): string {
        return forge.pki.publicKeyToPem(this.keyPair.publicKey);
    }

    public decrypt(encryptedData: string): string | null {
        try {
            const decoded = forge.util.decode64(encryptedData);
            const decrypted = this.keyPair.privateKey.decrypt(decoded, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
            });
            return decrypted;
        } catch (error) {
            console.error("Decryption failed:", error);
            return null;
        }
    }

    // --- AES Utilities ---

    public encryptAES(data: string, keyHex: string): string | null {
        try {
            const key = forge.util.hexToBytes(keyHex);
            const iv = forge.random.getBytesSync(12);
            const cipher = forge.cipher.createCipher('AES-GCM', key);
            cipher.start({ iv: iv });
            cipher.update(forge.util.createBuffer(data, 'utf8'));
            cipher.finish();
            const encrypted = cipher.output.getBytes();
            const tag = cipher.mode.tag.getBytes();
            // Format: IV (12) + Tag (16) + EncryptedData
            return forge.util.encode64(iv + tag + encrypted);
        } catch (error) {
            console.error("AES Encryption failed:", error);
            return null;
        }
    }

    public decryptAES(encryptedBase64: string, keyHex: string): string | null {
        try {
            const decoded = forge.util.decode64(encryptedBase64);
            const iv = decoded.slice(0, 12);
            const tag = decoded.slice(12, 28);
            const encrypted = decoded.slice(28);
            const key = forge.util.hexToBytes(keyHex);

            const decipher = forge.cipher.createDecipher('AES-GCM', key);
            decipher.start({ iv: iv, tag: forge.util.createBuffer(tag) });
            decipher.update(forge.util.createBuffer(encrypted));
            const pass = decipher.finish();

            if (pass) {
                return decipher.output.toString();
            } else {
                console.error("AES Decryption: Auth Tag Mismatch");
                return null;
            }
        } catch (error) {
            console.error("AES Decryption failed:", error);
            return null;
        }
    }
}

export default KeyManager;
