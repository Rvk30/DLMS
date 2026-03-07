import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import { AppError } from '../utils/AppError';
import { Role } from '../types';

/**
 * authenticate — verifies JWT in Authorization header.
 * Attaches decoded payload to req.user.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return next(AppError.unauthorized('No token provided. Please login.'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return next(AppError.unauthorized('Session expired. Please login again.'));
        }
        return next(AppError.unauthorized('Invalid token.'));
    }
}

/**
 * authorise — role guard middleware factory.
 * Usage: authorise(Role.LIBRARIAN)
 */
export function authorise(...roles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next(AppError.unauthorized());
        }
        if (!roles.includes(req.user.role)) {
            return next(AppError.forbidden(`Access restricted to: ${roles.join(', ')}`));
        }
        next();
    };
}

/** Convenience: librarian-only guard */
export const librarianOnly = authorise(Role.LIBRARIAN);

/** Convenience: student-only guard */
export const studentOnly = authorise(Role.STUDENT);

/** Convenience: either role */
export const anyRole = authorise(Role.STUDENT, Role.LIBRARIAN);
