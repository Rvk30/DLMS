import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

export class AdminService {
    /** Dashboard stats — aggregated counts for the librarian overview */
    async getDashboardStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalBooks,
            totalBookCopies,
            availableBookCopies,
            totalUsers,
            totalStudents,
            issuedToday,
            returnedToday,
            activeTransactions,
            overdueTransactions,
            pendingFines,
            recentTransactions,
            popularBooks,
            overdueAlerts,
        ] = await Promise.all([
            prisma.book.count(),
            prisma.book.aggregate({ _sum: { totalCopies: true } }),
            prisma.book.aggregate({ _sum: { availableCopies: true } }),
            prisma.user.count(),
            prisma.student.count(),
            prisma.transaction.count({ where: { issueDate: { gte: today }, status: 'ISSUED' } }),
            prisma.transaction.count({ where: { returnDate: { gte: today } } }),
            prisma.transaction.count({ where: { status: { in: ['ISSUED', 'OVERDUE'] } } }),
            prisma.transaction.count({ where: { status: 'OVERDUE' } }),
            prisma.fine.aggregate({ where: { status: 'PENDING' }, _sum: { totalAmount: true }, _count: true }),
            prisma.transaction.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    book: { select: { title: true, author: true } },
                    student: { include: { user: { select: { name: true } } } },
                },
            }),
            // Most borrowed books
            prisma.transaction.groupBy({
                by: ['bookId'],
                _count: { bookId: true },
                orderBy: { _count: { bookId: 'desc' } },
                take: 5,
            }),
            // Overdue alerts with fines
            prisma.fine.findMany({
                where: { status: 'PENDING' },
                orderBy: { totalAmount: 'desc' },
                take: 5,
                include: {
                    transaction: {
                        include: {
                            book: { select: { title: true } },
                            student: { include: { user: { select: { name: true, email: true } } } },
                        },
                    },
                },
            }),
        ]);

        // Resolve popular book titles
        const popularWithTitles = await Promise.all(
            popularBooks.map(async (b: any) => {
                const book = await prisma.book.findUnique({
                    where: { id: b.bookId },
                    select: { title: true, author: true },
                });
                return { ...book, borrowCount: b._count.bookId };
            })
        );

        return {
            books: {
                total: totalBooks,
                totalCopies: totalBookCopies._sum.totalCopies ?? 0,
                available: availableBookCopies._sum.availableCopies ?? 0,
                issued: activeTransactions,
                overdue: overdueTransactions,
            },
            users: {
                total: totalUsers,
                students: totalStudents,
            },
            today: {
                issued: issuedToday,
                returned: returnedToday,
            },
            fines: {
                pendingCount: pendingFines._count,
                pendingAmount: pendingFines._sum.totalAmount ?? 0,
            },
            recentTransactions,
            popularBooks: popularWithTitles,
            overdueAlerts,
        };
    }

    /** List users with optional role filter and search */
    async getUsers(query: any) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Number(query.limit) || 10);
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.role) where.role = query.role;
        if (query.q) {
            where.OR = [
                { name: { contains: query.q, mode: 'insensitive' } },
                { email: { contains: query.q, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    student: {
                        select: {
                            studentId: true,
                            className: true,
                            borrowedCount: true,
                            account: { select: { outstandingFine: true, status: true } },
                        },
                    },
                    librarian: { select: { employeeId: true, department: true } },
                },
            }),
            prisma.user.count({ where }),
        ]);

        const safeUsers = users.map((user: any) => {
            const { password, emailVerifyToken, resetPasswordToken, ...safe } = user;
            return safe;
        });

        return { users: safeUsers, total, page, limit };
    }

    /** Get single user detail */
    async getUserById(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: {
                    include: {
                        account: true,
                        transactions: {
                            take: 10,
                            orderBy: { createdAt: 'desc' },
                            include: {
                                book: { select: { title: true, author: true } },
                                fine: true,
                            },
                        },
                    },
                },
                librarian: true,
            },
        });
        if (!user) throw AppError.notFound('User not found.');
        const { password, emailVerifyToken, resetPasswordToken, ...safe } = user as any;
        return safe;
    }

    /** Suspend / activate a student account */
    async toggleAccountStatus(studentId: string, status: 'ACTIVE' | 'SUSPENDED') {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { account: true },
        });
        if (!student) throw AppError.notFound('Student not found.');
        if (!student.account) throw AppError.notFound('Student account not found.');

        return prisma.account.update({
            where: { studentId },
            data: { status },
        });
    }

    /** Verify / unverify a user's email (admin override) */
    async setEmailVerified(userId: string, verified: boolean) {
        return prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: verified },
        });
    }

    /** Delete a user (only if no active transactions) */
    async deleteUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });
        if (!user) throw AppError.notFound('User not found.');

        if (user.student) {
            const activeCount = await prisma.transaction.count({
                where: { studentId: user.student.id, status: { in: ['ISSUED', 'OVERDUE'] } },
            });
            if (activeCount > 0) {
                throw AppError.badRequest('Cannot delete user with active borrows.');
            }
        }

        return prisma.user.delete({ where: { id: userId } });
    }
}

export const adminService = new AdminService();
