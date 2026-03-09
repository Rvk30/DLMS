import { getTransporter, FROM_ADDRESS } from '../config/mailer';
import {
    emailVerificationTemplate,
    bookIssuedTemplate,
    dueDateReminderTemplate,
    overdueAlertTemplate,
    passwordResetTemplate,
    type BookIssuedParams,
    type DueDateReminderParams,
    type OverdueAlertParams,
} from './email.templates';

// ─────────────────────────────────────────────────────────────
//  Core send helper
// ─────────────────────────────────────────────────────────────
async function send(to: string, subject: string, html: string): Promise<void> {
    try {
        await getTransporter().sendMail({
            from: FROM_ADDRESS,
            to,
            subject,
            html,
        });
        console.log(`📧 Email sent to ${to} — "${subject}"`);
    } catch (err) {
        // Log but don't crash the caller — email is non-critical
        console.error(`❌ Failed to send email to ${to}:`, err);
    }
}

// ─────────────────────────────────────────────────────────────
//  Public email service methods
// ─────────────────────────────────────────────────────────────
export const emailService = {

    /** 1. Welcome / email verification */
    async sendVerification(name: string, email: string, token: string): Promise<void> {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const { subject, html } = emailVerificationTemplate(name, verifyUrl);
        await send(email, subject, html);
    },

    /** 2. Password reset link */
    async sendPasswordReset(name: string, email: string, token: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        const { subject, html } = passwordResetTemplate(name, resetUrl);
        await send(email, subject, html);
    },

    /** 3. Book issued confirmation */
    async sendBookIssued(params: BookIssuedParams): Promise<void> {
        const { subject, html } = bookIssuedTemplate(params);
        await send(params.studentEmail, subject, html);
    },

    /** 4. Due date reminder */
    async sendDueDateReminder(email: string, params: DueDateReminderParams): Promise<void> {
        const { subject, html } = dueDateReminderTemplate(params);
        await send(email, subject, html);
    },

    /** 5. Overdue alert with fine */
    async sendOverdueAlert(email: string, params: OverdueAlertParams): Promise<void> {
        const { subject, html } = overdueAlertTemplate(params);
        await send(email, subject, html);
    },
};
