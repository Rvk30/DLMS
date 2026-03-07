import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import type { WaiveFineDTO } from '../types';

export class FineService {
    /** List fines — student sees own, librarian sees all */
    async getAll(userId: string, role: string, query: any) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Number(query.limit) || 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (role === 'STUDENT') {
            const student = await prisma.student.findUnique({ where: { userId } });
            if (!student) throw AppError.notFound('Student profile not found.');
            where.studentId = student.id;
        }
        if (query.status) where.status = query.status;
        if (query.studentId && role === 'LIBRARIAN') where.studentId = query.studentId;

        const [fines, total] = await Promise.all([
            prisma.fine.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    transaction: {
                        include: { book: { select: { title: true, author: true } } },
                    },
                },
            }),
            prisma.fine.count({ where }),
        ]);

        return { fines, total, page, limit };
    }

    /** Get single fine by ID */
    async getById(id: string) {
        const fine = await prisma.fine.findUnique({
            where: { id },
            include: {
                transaction: {
                    include: {
                        book: true,
                        student: { include: { user: { select: { name: true, email: true } } } },
                    },
                },
                waivedBy: { include: { user: { select: { name: true } } } },
            },
        });
        if (!fine) throw AppError.notFound('Fine not found.');
        return fine;
    }

    /** Calculate / recalculate fine for a transaction */
    async calculate(transactionId: string) {
        const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!transaction) throw AppError.notFound('Transaction not found.');
        if (transaction.status === 'RETURNED' || transaction.status === 'ISSUED') {
            // Re-calculate based on actual return date or today
            const refDate = transaction.returnDate ?? new Date();
            const daysOverdue = Math.max(
                0,
                Math.ceil((refDate.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24))
            );
            const ratePerDay = Number(process.env.FINE_PER_DAY) || 2;
            const totalAmount = daysOverdue * ratePerDay;
            return { transactionId, daysOverdue, ratePerDay, totalAmount };
        }
        return { transactionId, daysOverdue: 0, ratePerDay: 2, totalAmount: 0 };
    }

    /** Pay fine (mark as PAID) */
    async pay(fineId: string, paidAmount?: number) {
        const fine = await this.getById(fineId);
        if (fine.status === 'PAID') throw AppError.badRequest('Fine already paid.');
        if (fine.status === 'WAIVED') throw AppError.badRequest('Fine was waived — no payment needed.');

        const updated = await prisma.fine.update({
            where: { id: fineId },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                paidAmount: paidAmount ?? fine.totalAmount,
            },
        });

        // Update student account
        await prisma.account.update({
            where: { studentId: fine.studentId },
            data: {
                totalFinePaid: { increment: Number(updated.paidAmount) },
                outstandingFine: { decrement: Number(fine.totalAmount) },
            },
        });

        return updated;
    }

    /** Waive fine (librarian only) */
    async waive(dto: WaiveFineDTO, librarianId: string) {
        const fine = await this.getById(dto.fineId);
        if (fine.status !== 'PENDING') {
            throw AppError.badRequest(`Fine is already ${fine.status.toLowerCase()}.`);
        }

        const updated = await prisma.fine.update({
            where: { id: dto.fineId },
            data: {
                status: 'WAIVED',
                waivedById: librarianId,
                waivedAt: new Date(),
                waiverReason: dto.waiverReason,
            },
        });

        await prisma.account.update({
            where: { studentId: fine.studentId },
            data: { outstandingFine: { decrement: Number(fine.totalAmount) } },
        });

        return updated;
    }

    /** Summary for a student */
    async getSummary(userId: string) {
        const student = await prisma.student.findUnique({
            where: { userId },
            include: { account: true },
        });
        if (!student) throw AppError.notFound('Student not found.');

        const [pending, paid, waived] = await Promise.all([
            prisma.fine.aggregate({ where: { studentId: student.id, status: 'PENDING' }, _sum: { totalAmount: true }, _count: true }),
            prisma.fine.aggregate({ where: { studentId: student.id, status: 'PAID' }, _sum: { paidAmount: true }, _count: true }),
            prisma.fine.aggregate({ where: { studentId: student.id, status: 'WAIVED' }, _sum: { totalAmount: true }, _count: true }),
        ]);

        return {
            outstandingFine: student.account?.outstandingFine ?? 0,
            pending: { count: pending._count, amount: pending._sum.totalAmount ?? 0 },
            paid: { count: paid._count, amount: paid._sum.paidAmount ?? 0 },
            waived: { count: waived._count, amount: waived._sum.totalAmount ?? 0 },
        };
    }
}

export const fineService = new FineService();
