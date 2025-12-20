"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import forge from 'node-forge';

interface EncryptionContextType {
    isReady: boolean;
    encrypt: (data: any) => Promise<string | null>;
    decrypt: (encrypted: string) => Promise<any | null>;
    secureFetch: (url: string, options?: RequestInit) => Promise<Response>;
    refreshSession: () => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextType>({
    isReady: false,
    encrypt: async () => null,
    decrypt: async () => null,
    secureFetch: async () => new Response(),
    refreshSession: async () => { },
});

export const useEncryption = () => useContext(EncryptionContext);

export const EncryptionProvider = ({ children }: { children: React.ReactNode }) => {
    const [isReady, setIsReady] = useState(false);
    const [aesKey, setAesKey] = useState<string | null>(null);

    // Initial Handshake with retry
    useEffect(() => {
        performHandshake();
    }, []);

    const performHandshake = async (retryCount = 0) => {
        const maxRetries = 3;

        try {
            // 1. Generate AES Key (32 bytes = 256 bit)
            const keyBytes = forge.random.getBytesSync(32);
            const keyHex = forge.util.bytesToHex(keyBytes);

            // 2. Fetch Server Public Key with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const keyRes = await fetch('/api/auth/keys', { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!keyRes.ok) {
                console.warn("Failed to get public key, proceeding without E2EE");
                setIsReady(true);
                return;
            }
            const { publicKey } = await keyRes.json();

            // 3. Encrypt AES Key with RSA Public Key
            const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);
            const encryptedKey = rsaPublicKey.encrypt(keyHex, 'RSA-OAEP', {
                md: forge.md.sha256.create(),
                mgf1: {
                    md: forge.md.sha1.create()
                }
            });
            const encryptedKeyBase64 = forge.util.encode64(encryptedKey);

            // 4. Send to Server
            const shakeRes = await fetch('/api/auth/handshake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encryptedSessionKey: encryptedKeyBase64 })
            });

            if (!shakeRes.ok) {
                // Retry with fresh key fetch if handshake fails
                if (retryCount < maxRetries) {
                    console.warn(`Handshake failed, retrying (${retryCount + 1}/${maxRetries})...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    return performHandshake(retryCount + 1);
                }
                console.warn("Handshake failed after retries, proceeding without E2EE");
                setIsReady(true);
                return;
            }

            setAesKey(keyHex);
            setIsReady(true);
            console.log("E2EE Session Established");

        } catch (error) {
            console.error("E2EE Handshake Error:", error);
            // Still set isReady to true to allow form submission (graceful degradation)
            setIsReady(true);
        }
    };

    const encryptAES = (data: string, keyHex: string): string => {
        const key = forge.util.hexToBytes(keyHex);
        const iv = forge.random.getBytesSync(12);
        const cipher = forge.cipher.createCipher('AES-GCM', key);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(data, 'utf8'));
        cipher.finish();
        const encrypted = cipher.output.getBytes();
        const tag = cipher.mode.tag.getBytes();
        return forge.util.encode64(iv + tag + encrypted);
    };

    const decryptAES = (encryptedBase64: string, keyHex: string): string | null => {
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
            }
            return null;
        } catch (e) {
            console.error("AES Decryption Error", e);
            return null;
        }
    };

    const encrypt = async (data: any): Promise<string | null> => {
        if (!aesKey) return null;
        const json = JSON.stringify(data);
        return encryptAES(json, aesKey);
    };

    const decrypt = async (encrypted: string): Promise<any | null> => {
        if (!aesKey) return null;
        const json = decryptAES(encrypted, aesKey);
        if (json) {
            try {
                return JSON.parse(json);
            } catch (e) {
                console.error("JSON Parse Error after decryption", e);
                return null;
            }
        }
        return null;
    };

    const secureFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        // Graceful degradation: if E2EE not available, use regular fetch
        if (!isReady) {
            throw new Error("Encryption Session not ready");
        }

        if (!aesKey) {
            // E2EE not available, use regular fetch
            console.warn("E2EE not available, using unencrypted fetch");
            return fetch(url, options);
        }

        let body = options.body;
        // Encrypt body if it exists and is not GET/HEAD
        if (body && typeof body === 'string' && options.method && !['GET', 'HEAD'].includes(options.method)) {
            const encryptedBody = encryptAES(body, aesKey);
            body = JSON.stringify({ encryptedData: encryptedBody });
        }

        const headers = new Headers(options.headers);
        headers.set('Content-Type', 'application/json');

        const newOptions = { ...options, body, headers };

        const res = await fetch(url, newOptions);

        // Check if response is encrypted
        const clone = res.clone();
        try {
            const data = await clone.json();
            if (data.encryptedData) {
                const decryptedJson = decryptAES(data.encryptedData, aesKey);
                if (decryptedJson) {
                    // Create a new Response with decrypted body
                    return new Response(decryptedJson, {
                        status: res.status,
                        statusText: res.statusText,
                        headers: res.headers
                    });
                }
            }
        } catch (e) {
            // Not JSON or Not Encrypted, return original response
        }

        return res;
    };

    return (
        <EncryptionContext.Provider value={{ isReady, encrypt, decrypt, secureFetch, refreshSession: performHandshake }}>
            {children}
        </EncryptionContext.Provider>
    );
};
