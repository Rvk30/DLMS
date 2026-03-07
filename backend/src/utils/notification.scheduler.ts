/**
 * Notification Scheduler
 * ──────────────────────
 * Runs two background jobs:
 *   1. Due-date reminders  — every day at 09:00 AM
 *   2. Overdue alerts       — every day at 09:15 AM
 *
 * Uses a simple setInterval approach so there is no extra dependency.
 * In production you can replace this with a proper cron library (node-cron)
 * or an external job queue (BullMQ / Agenda).
 */

import { prisma } from '../config/database';
import { emailService } from '../services/email.service';

const REMINDER_DAYS_BEFORE = 3; // send reminder 3 days before due date
const FINE_PER_DAY = Number(process.env.FINE_PER_DAY) || 2;

// ─────────────────────────────────────────────────────────────
//  Job 1: Due-date reminders
// ─────────────────────────────────────────────────────────────
async function sendDueDateReminders(): Promise<void> {
    const now = new Date();
    const targetDay = new Date(now);
    targetDay.setDate(now.getDate() + REMINDER_DAYS_BEFORE);

    // Build date range covering the target day (00:00 → 23:59)
    const startOfDay = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate(), 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
        where: {
            status: 'ISSUED',
            dueDate: { gte: startOfDay, lte: endOfDay },
        },
        include: {
            book: { select: { title: true, author: true } },
            student: { include: { user: { select: { name: true, email: true } } } },
        },
    });

    console.log(`🔔 Due-date reminder job: ${transactions.length} student(s) to notify.`);

    for (const t of transactions) {
        const daysLeft = Math.ceil((t.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await emailService.sendDueDateReminder(t.student.user.email, {
            studentName: t.student.user.name,
            bookTitle: t.book.title,
            bookAuthor: t.book.author,
            dueDate: t.dueDate,
            daysLeft,
            transactionId: t.id,
        });
    }
}

// ─────────────────────────────────────────────────────────────
//  Job 2: Overdue alerts  (also marks ISSUED → OVERDUE)
// ─────────────────────────────────────────────────────────────
async function sendOverdueAlerts(): Promise<void> {
    const now = new Date();

    // Mark any still-ISSUED transactions past their due date
    await prisma.transaction.updateMany({
        where: { status: 'ISSUED', dueDate: { lt: now } },
        data: { status: 'OVERDUE' },
    });

    const overdueTransactions = await prisma.transaction.findMany({
        where: { status: 'OVERDUE' },
        include: {
            book: { select: { title: true, author: true } },
            student: { include: { user: { select: { name: true, email: true } } } },
        },
    });

    console.log(`🚨 Overdue alert job: ${overdueTransactions.length} transaction(s) overdue.`);

    for (const t of overdueTransactions) {
        const daysOverdue = Math.max(
            1,
            Math.ceil((now.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        const fineAmount = daysOverdue * FINE_PER_DAY;

        // Upsert the fine record with latest calculation
        await prisma.fine.upsert({
            where: { transactionId: t.id },
            update: { daysOverdue, totalAmount: fineAmount },
            create: {
                transactionId: t.id,
                studentId: t.studentId,
                daysOverdue,
                ratePerDay: FINE_PER_DAY,
                totalAmount: fineAmount,
            },
        });

        // Update account outstanding fine
        await prisma.account.updateMany({
            where: { studentId: t.studentId },
            data: { outstandingFine: fineAmount }, // set to current total (not accumulate)
        });

        await emailService.sendOverdueAlert(t.student.user.email, {
            studentName: t.student.user.name,
            bookTitle: t.book.title,
            bookAuthor: t.book.author,
            dueDate: t.dueDate,
            daysOverdue,
            fineAmount,
            transactionId: t.id,
        });
    }
}

// ─────────────────────────────────────────────────────────────
//  Scheduler bootstrap
// ─────────────────────────────────────────────────────────────

/** Convert HH:MM to ms delay from now to next occurrence */
function msUntilTime(hour: number, minute: number): number {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
    if (target <= now) target.setDate(target.getDate() + 1); // schedule for tomorrow if past
    return target.getTime() - now.getTime();
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function startNotificationScheduler(): void {
    if (process.env.NODE_ENV === 'test') return; // skip in tests

    // Due-date reminder — 09:00 AM daily
    setTimeout(() => {
        sendDueDateReminders().catch(console.error);
        setInterval(() => sendDueDateReminders().catch(console.error), ONE_DAY_MS);
    }, msUntilTime(9, 0));

    // Overdue alert — 09:15 AM daily
    setTimeout(() => {
        sendOverdueAlerts().catch(console.error);
        setInterval(() => sendOverdueAlerts().catch(console.error), ONE_DAY_MS);
    }, msUntilTime(9, 15));

    console.log('⏰ Notification scheduler started (reminders: 09:00 | overdue: 09:15)');
}
