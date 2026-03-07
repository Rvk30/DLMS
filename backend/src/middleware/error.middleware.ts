import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Global error handler — must be registered LAST in Express middleware chain.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
    // Known operational errors
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors?.length ? { errors: err.errors } : {}),
        });
        return;
    }

    // Prisma unique constraint violation (P2002)
    if (err.code === 'P2002') {
        const field = (err.meta?.target as string[])?.join(', ') ?? 'field';
        res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}. Please use a different value.`,
        });
        return;
    }

    // Prisma record not found (P2025)
    if (err.code === 'P2025') {
        res.status(404).json({
            success: false,
            message: err.meta?.cause ?? 'Record not found.',
        });
        return;
    }

    // Prisma foreign key / restrict violation (P2003)
    if (err.code === 'P2003') {
        res.status(400).json({
            success: false,
            message: 'Related record does not exist.',
        });
        return;
    }

    // JWT errors (shouldn't reach here if auth middleware is correct, but just in case)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
        return;
    }

    // Unknown / unexpected errors — never expose internals
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong. Please try again.'
            : err.message,
    });
}

/**
 * 404 handler — mount before errorHandler.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found.`));
}
