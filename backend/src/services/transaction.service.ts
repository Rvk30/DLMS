import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { TransactionStatus } from '../types';
import type { IssueBookDTO, ReturnBookDTO } from '../types';
import { format } from 'date-fns';

const MAX_BORROW_LIMIT = Number(process.env.MAX_BORROW_LIMIT) || 3;
const LOAN_DAYS = 14; // default loan period

export class TransactionService {
    // ── Issue Book ────────────────────────────────────────────────────────────
    async issue(dto: IssueBookDTO, issuedById: string) {
        // 1. Fetch student, book, and librarian in parallel
        const [student, book] = await Promise.all([
            prisma.student.findUnique({
                where: { id: dto.studentId },
                include: { account: true },
            }),
            prisma.book.findUnique({ where: { id: dto.bookId } }),
        ]);

        if (!student) throw AppError.notFound('Student not found.');
        if (!book) throw AppError.notFound('Book not found.');

        // 2. Account status check
        if (student.account?.status === 'SUSPENDED') {
            throw AppError.forbidden('Student account is suspended due to unpaid fines.');
        }

        // 3. Borrow limit check
        if (student.borrowedCount >= MAX_BORROW_LIMIT) {
            throw AppError.badRequest(
                `Maximum borrow limit of ${MAX_BORROW_LIMIT} books reached. Please return a book first.`
            );
        }

        // 4. Availability check
        if (book.availableCopies <= 0) {
            throw AppError.badRequest(`"${book.title}" is currently unavailable.`);
        }

        // 5. Check if student already has this book
        const alreadyIssued = await prisma.transaction.findFirst({
            where: { studentId: dto.studentId, bookId: dto.bookId, status: { in: ['ISSUED', 'OVERDUE'] } },
        });
        if (alreadyIssued) throw AppError.conflict('Student already has this book issued.');

        // Calculate due date
        const dueDate = dto.dueDate
            ? new Date(dto.dueDate)
            : new Date(Date.now() + LOAN_DAYS * 24 * 60 * 60 * 1000);

        // 6. Atomic transaction: create transaction record + update book + update student
        const [transaction] = await prisma.$transaction([
            prisma.transaction.create({
                data: {
                    studentId: dto.studentId,
                    bookId: dto.bookId,
                    issuedById,
                    dueDate,
                    remarks: dto.remarks,
                    status: TransactionStatus.ISSUED,
                },
                include: {
                    book: true,
                    student: { include: { user: { select: { name: true, email: true } } } },
                },
            }),
            prisma.book.update({
                where: { id: dto.bookId },
                data: {
                    availableCopies: { decrement: 1 },
                    status: book.availableCopies - 1 === 0
                        ? 'ISSUED'
                        : 'AVAILABLE',
                },
            }),
            prisma.student.update({
                where: { id: dto.studentId },
                data: { borrowedCount: { increment: 1 } },
            }),
            prisma.account.update({
                where: { studentId: dto.studentId },
                data: {
                    totalBorrowed: { increment: 1 },
                    currentlyBorrowed: { increment: 1 },
                },
            }),
        ]);

        return transaction;
    }

    // ── Return Book ───────────────────────────────────────────────────────────
    async return(dto: ReturnBookDTO, returnedById: string | null, isStudentInitiated: boolean = false) {
        const transaction = await prisma.transaction.findUnique({
            where: { id: dto.transactionId },
            include: {
                book: true,
                student: { include: { user: { select: { name: true, email: true } } } },
                fine: true
            },
        });

        if (!transaction) throw AppError.notFound('Transaction not found.');
        if (transaction.status === TransactionStatus.RETURNED) {
            throw AppError.badRequest('Book has already been returned.');
        }

        // Security check: Students can only return their own books
        if (isStudentInitiated && transaction.student.userId !== returnedById) {
            throw AppError.forbidden('You can only return your own borrowed books.');
        }

        const returnDate = new Date();
        const isOverdue = returnDate > transaction.dueDate;

        // Calculate fine if overdue
        let fineData = null;
        if (isOverdue) {
            const daysOverdue = Math.ceil(
                (returnDate.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            const ratePerDay = Number(process.env.FINE_PER_DAY) || 2;
            const totalAmount = daysOverdue * ratePerDay;

            const isWaived = dto.waiveFine && !isStudentInitiated; // Only librarians can waive

            fineData = {
                transactionId: dto.transactionId,
                studentId: transaction.studentId,
                daysOverdue,
                ratePerDay,
                totalAmount,
                status: isWaived ? 'WAIVED' : 'PENDING',
                waivedById: isWaived ? returnedById : null,
                waivedAt: isWaived ? returnDate : null,
                waiverReason: isWaived ? dto.waiverReason : null,
            };
        }

        // Atomic update: transaction + book + student + account + fine
        const [updatedTx] = await prisma.$transaction([
            prisma.transaction.update({
                where: { id: dto.transactionId },
                data: {
                    status: TransactionStatus.RETURNED,
                    returnDate,
                    returnedById: isStudentInitiated ? null : returnedById,
                    remarks: dto.remarks,
                },
                include: { book: true, student: { include: { user: true } } }
            }),
            prisma.book.update({
                where: { id: transaction.bookId },
                data: {
                    availableCopies: { increment: 1 },
                    status: 'AVAILABLE',
                },
            }),
            prisma.student.update({
                where: { id: transaction.studentId },
                data: { borrowedCount: { decrement: 1 } },
            }),
            prisma.account.update({
                where: { studentId: transaction.studentId },
                data: {
                    totalReturned: { increment: 1 },
                    currentlyBorrowed: { decrement: 1 },
                    ...(fineData && fineData.status !== 'WAIVED' ? {
                        totalFineAccrued: { increment: fineData.totalAmount },
                        outstandingFine: { increment: fineData.totalAmount },
                    } : {}),
                },
            }),
            ...(fineData ? [
                prisma.fine.upsert({
                    where: { transactionId: dto.transactionId },
                    update: {
                        daysOverdue: fineData.daysOverdue,
                        totalAmount: fineData.totalAmount,
                        status: fineData.status as any,
                        waivedById: fineData.waivedById,
                        waivedAt: fineData.waivedAt,
                        waiverReason: fineData.waiverReason,
                    },
                    create: fineData as any,
                })
            ] : []),
        ]);

        // ── Send Confirmation Email ──────────────────────────────────────────
        try {
            const { getTransporter, FROM_ADDRESS } = await import('../config/mailer');
            const mailer = getTransporter();
            const studentEmail = transaction.student.user.email;
            const studentName = transaction.student.user.name;

            const fineMsg = fineData
                ? fineData.status === 'WAIVED'
                    ? `<p style="color: #059669; font-weight: bold;">Overdue fine of ₹${fineData.totalAmount} was waived by the librarian.</p>`
                    : `<p style="color: #dc2626; font-weight: bold;">An overdue fine of ₹${fineData.totalAmount} has been added to your account.</p>`
                : '<p style="color: #059669; font-weight: bold;">Returned on time. No fines applied.</p>';

            await mailer.sendMail({
                from: FROM_ADDRESS,
                to: studentEmail,
                subject: `Book Returned: ${transaction.book.title}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
                        <h2 style="color: #1e3a8a;">Digital Library Management System</h2>
                        <p>Hi ${studentName},</p>
                        <p>The following book has been successfully returned to the library:</p>
                        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                            <strong style="font-size: 18px;">${transaction.book.title}</strong><br/>
                            <span style="color: #4b5563;">by ${transaction.book.author}</span>
                        </div>
                        <p><strong>Return Date:</strong> ${format(returnDate, 'PPP')}</p>
                        ${fineMsg}
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                        <p style="font-size: 12px; color: #6b7280; text-align: center;">
                            Thank you for using DLMS. Please return your books on time to keep the library moving!
                        </p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Failed to send return confirmation email:', emailErr);
        }

        return { transaction: updatedTx, fine: fineData, daysOverdue: fineData?.daysOverdue ?? 0 };
    }

    // ── History ───────────────────────────────────────────────────────────────
    async getHistory(userId: string, role: string, query: any) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Number(query.limit) || 10);
        const skip = (page - 1) * limit;

        const where: any = {};

        // Students can only see their own history
        if (role === 'STUDENT') {
            const student = await prisma.student.findUnique({ where: { userId } });
            if (!student) throw AppError.notFound('Student profile not found.');
            where.studentId = student.id;
        }
        // Librarians see all by default

        if (query.status) where.status = query.status;
        if (query.studentId && role === 'LIBRARIAN') where.studentId = query.studentId;
        if (query.bookId) where.bookId = query.bookId;

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    book: { select: { title: true, author: true, isbn: true } },
                    student: { include: { user: { select: { name: true, email: true } } } },
                    fine: true,
                },
            }),
            prisma.transaction.count({ where }),
        ]);

        return { transactions, total, page, limit };
    }

    // ── Mark Overdues (cron-compatible) ──────────────────────────────────────
    async markOverdueTransactions(): Promise<number> {
        const now = new Date();
        const result = await prisma.transaction.updateMany({
            where: { status: TransactionStatus.ISSUED, dueDate: { lt: now } },
            data: { status: TransactionStatus.OVERDUE },
        });

        // Create/update fines for newly overdue items
        const overdueTransactions = await prisma.transaction.findMany({
            where: { status: TransactionStatus.OVERDUE },
        });

        for (const t of overdueTransactions) {
            const daysOverdue = Math.ceil((now.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const ratePerDay = Number(process.env.FINE_PER_DAY) || 2;
            await prisma.fine.upsert({
                where: { transactionId: t.id },
                update: { daysOverdue, totalAmount: daysOverdue * ratePerDay },
                create: {
                    transactionId: t.id,
                    studentId: t.studentId,
                    daysOverdue,
                    ratePerDay,
                    totalAmount: daysOverdue * ratePerDay,
                },
            });
        }

        return result.count;
    }
}

export const transactionService = new TransactionService();
