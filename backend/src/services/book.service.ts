import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { BookCategory, BookStatus } from '../types';
import type { CreateBookDTO, UpdateBookDTO, BookSearchQuery } from '../types';

export class BookService {
    // ── Create ────────────────────────────────────────────────────────────────
    async create(dto: CreateBookDTO, addedById: string) {
        const existing = await prisma.book.findUnique({ where: { isbn: dto.isbn } });
        if (existing) throw AppError.conflict(`Book with ISBN "${dto.isbn}" already exists.`);

        return prisma.book.create({
            data: {
                ...dto,
                availableCopies: dto.totalCopies,
                status: BookStatus.AVAILABLE,
                addedById,
            },
        });
    }

    // ── Get All (paginated) ───────────────────────────────────────────────────
    async getAll(query: BookSearchQuery) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Number(query.limit) || 10);
        const skip = (page - 1) * limit;
        const sortBy = query.sortBy || 'createdAt';
        const sortOrder = query.sortOrder || 'desc';

        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.category) where.category = query.category;
        if (query.author) {
            where.author = { contains: query.author, mode: 'insensitive' };
        }
        if (query.q) {
            where.OR = [
                { title: { contains: query.q, mode: 'insensitive' } },
                { author: { contains: query.q, mode: 'insensitive' } },
                { isbn: { contains: query.q, mode: 'insensitive' } },
                { publisher: { contains: query.q, mode: 'insensitive' } },
            ];
        }

        const [books, total] = await Promise.all([
            prisma.book.findMany({ where, skip, take: limit, orderBy: { [sortBy]: sortOrder } }),
            prisma.book.count({ where }),
        ]);

        return { books, total, page, limit };
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────
    async getById(id: string) {
        const book = await prisma.book.findUnique({
            where: { id },
            include: {
                transactions: {
                    where: { status: { in: ['ISSUED', 'OVERDUE'] } },
                    include: { student: { include: { user: { select: { name: true, email: true } } } } },
                    take: 5,
                },
            },
        });
        if (!book) throw AppError.notFound('Book not found.');
        return book;
    }

    // ── Update ────────────────────────────────────────────────────────────────
    async update(id: string, dto: UpdateBookDTO) {
        await this.getById(id); // throws 404 if not found

        // If totalCopies is being reduced, ensure we don't go below currently issued
        if (dto.totalCopies !== undefined) {
            const book = await prisma.book.findUnique({ where: { id } });
            const issued = book!.totalCopies - book!.availableCopies;
            if (dto.totalCopies < issued) {
                throw AppError.badRequest(
                    `Cannot reduce total copies below currently issued count (${issued}).`
                );
            }
            // Adjust available accordingly
            (dto as any).availableCopies = dto.totalCopies - issued;
        }

        return prisma.book.update({ where: { id }, data: dto });
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    async delete(id: string) {
        const book = await this.getById(id);

        // Prevent deletion if copies are currently issued
        if (book.availableCopies < book.totalCopies) {
            throw AppError.badRequest('Cannot delete a book that has copies currently issued.');
        }

        return prisma.book.delete({ where: { id } });
    }

    // ── Search (alias for getAll with query) ──────────────────────────────────
    async search(query: BookSearchQuery) {
        return this.getAll(query);
    }

    // ── Get by Category ───────────────────────────────────────────────────────
    async getByCategory(category: BookCategory) {
        return prisma.book.findMany({
            where: { category },
            orderBy: { title: 'asc' },
        });
    }

    // ── Stats for admin dashboard ─────────────────────────────────────────────
    async getStats() {
        const [total, available, issued, categories] = await Promise.all([
            prisma.book.aggregate({ _sum: { totalCopies: true } }),
            prisma.book.aggregate({ _sum: { availableCopies: true } }),
            prisma.transaction.count({ where: { status: { in: ['ISSUED', 'OVERDUE'] } } }),
            prisma.book.groupBy({ by: ['category'], _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
        ]);
        return {
            totalBooks: total._sum.totalCopies ?? 0,
            availableBooks: available._sum.availableCopies ?? 0,
            issuedBooks: issued,
            categoryBreakdown: categories,
        };
    }
}

export const bookService = new BookService();
