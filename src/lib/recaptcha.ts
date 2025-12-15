// Server-side reCAPTCHA v3 verification

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || '';
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

// Minimum score threshold (0.0 = bot, 1.0 = human)
const MIN_SCORE_THRESHOLD = 0.5;

interface RecaptchaVerifyResponse {
    success: boolean;
    score?: number;
    action?: string;
    challenge_ts?: string;
    hostname?: string;
    'error-codes'?: string[];
}

interface VerificationResult {
    success: boolean;
    score: number;
    action: string;
    error?: string;
}

/**
 * Verify reCAPTCHA v3 token on server side
 * @param token - The reCAPTCHA token from client
 * @param expectedAction - Expected action name to verify
 * @returns Verification result with score
 */
export async function verifyRecaptcha(
    token: string | null | undefined,
    expectedAction: string
): Promise<VerificationResult> {
    // If no secret key configured, allow all requests (dev mode)
    if (!RECAPTCHA_SECRET_KEY) {
        console.warn('reCAPTCHA secret key not configured - allowing request');
        return { success: true, score: 1.0, action: expectedAction };
    }

    // If no token provided, deny
    if (!token) {
        return { success: false, score: 0, action: '', error: 'No reCAPTCHA token provided' };
    }

    try {
        const response = await fetch(RECAPTCHA_VERIFY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: RECAPTCHA_SECRET_KEY,
                response: token,
            }),
        });

        const data: RecaptchaVerifyResponse = await response.json();

        if (!data.success) {
            console.error('reCAPTCHA verification failed:', data['error-codes']);
            return {
                success: false,
                score: 0,
                action: '',
                error: 'reCAPTCHA verification failed'
            };
        }

        // Check if action matches
        if (data.action !== expectedAction) {
            console.warn(`reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`);
            return {
                success: false,
                score: data.score || 0,
                action: data.action || '',
                error: 'Action mismatch'
            };
        }

        // Check score threshold
        const score = data.score || 0;
        if (score < MIN_SCORE_THRESHOLD) {
            console.warn(`reCAPTCHA low score: ${score} < ${MIN_SCORE_THRESHOLD}`);
            return {
                success: false,
                score,
                action: data.action || '',
                error: 'Suspicious activity detected'
            };
        }

        return {
            success: true,
            score,
            action: data.action || expectedAction
        };

    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return {
            success: false,
            score: 0,
            action: '',
            error: 'Verification request failed'
        };
    }
}

/**
 * Check if reCAPTCHA is configured
 */
export function isRecaptchaConfigured(): boolean {
    return !!RECAPTCHA_SECRET_KEY;
}
