import nodemailer, { Transporter } from 'nodemailer';

// ─────────────────────────────────────────────────────────────
//  Singleton mail transporter
// ─────────────────────────────────────────────────────────────

let _transporter: Transporter | null = null;

export function getTransporter(): Transporter {
    if (_transporter) return _transporter;

    _transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
    });

    return _transporter;
}

/** Verify SMTP connection on startup */
export async function verifyMailConnection(): Promise<void> {
    try {
        await getTransporter().verify();
        console.log('✅ SMTP connection verified.');
    } catch (err) {
        console.warn('⚠️  SMTP connection failed — emails will not be sent.', err);
    }
}

/** The "from" display address for all outgoing mail */
export const FROM_ADDRESS =
    process.env.EMAIL_FROM || `"DLMS Library" <${process.env.SMTP_USER}>`;
