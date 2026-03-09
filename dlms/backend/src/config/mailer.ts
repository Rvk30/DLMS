import { Resend } from 'resend';

// ─────────────────────────────────────────────────────────────
//  Singleton Resend client
// ─────────────────────────────────────────────────────────────

let _resend: Resend | null = null;

export function getResendClient(): Resend {
    if (_resend) return _resend;

    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY is not set. Emails will fail to send.');
    }

    _resend = new Resend(process.env.RESEND_API_KEY);
    return _resend;
}

/** 
 * Resend does not require an active socket verification like SMTP.
 * We simply check if the API key is present on startup.
 */
export async function verifyMailConnection(): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY missing — emails will not be sent.');
    } else {
        console.log('✅ Resend email client configured.');
    }
}

/** The "from" display address for all outgoing mail. 
 * Note: Resend's free tier only allows sending from onboarding@resend.dev to your verified email. 
 * If you add a custom domain to Resend, change this to something like "DLMS Library <noreply@yourdomain.com>" 
 */
export const FROM_ADDRESS =
    process.env.EMAIL_FROM || 'DLMS Library <onboarding@resend.dev>';
