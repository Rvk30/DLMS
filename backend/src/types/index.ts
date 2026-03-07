// ============================================================
//  Shared TypeScript types derived from Prisma schema
//  These are used across controllers, services, and middleware
// ============================================================

import { Role, BookStatus, BookCategory, TransactionStatus, FineStatus, AccountStatus } from '@prisma/client';

// Re-export Prisma enums for convenience
export { Role, BookStatus, BookCategory, TransactionStatus, FineStatus, AccountStatus };

// ─────────────────────────────────────────────────────────────
//  Auth / JWT
// ─────────────────────────────────────────────────────────────
export interface TokenPayload {
    userId: string;
    email: string;
    role: Role;
    studentId?: string;    // only for STUDENT
    librarianId?: string;  // only for LIBRARIAN
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// ─────────────────────────────────────────────────────────────
//  Request DTOs  (Data Transfer Objects)
// ─────────────────────────────────────────────────────────────

// Auth
export interface RegisterStudentDTO {
    name: string;
    email: string;
    password: string;
    studentId: string;
    className: string;
    department?: string;
    semester?: number;
    phone?: string;
}

export interface RegisterLibrarianDTO {
    name: string;
    email: string;
    password: string;
    employeeId: string;
    department: string;
    phone?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

// Books
export interface CreateBookDTO {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publicationYear?: number;
    edition?: string;
    category: BookCategory;
    language?: string;
    description?: string;
    coverImageUrl?: string;
    location?: string;
    totalCopies: number;
}

export interface UpdateBookDTO extends Partial<Omit<CreateBookDTO, 'isbn'>> { }

export interface BookSearchQuery {
    q?: string;           // full-text search term
    author?: string;
    category?: BookCategory;
    status?: BookStatus;
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'author' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

// Transactions
export interface IssueBookDTO {
    studentId: string;  // Student model id
    bookId: string;
    dueDate?: string;  // ISO date string; defaults to +14 days
    remarks?: string;
}

export interface ReturnBookDTO {
    transactionId: string;
    remarks?: string;
}

// Fines
export interface WaiveFineDTO {
    fineId: string;
    waiverReason?: string;
}

// ─────────────────────────────────────────────────────────────
//  API Response shape
// ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = void> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ─────────────────────────────────────────────────────────────
//  Express extensions
// ─────────────────────────────────────────────────────────────
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
