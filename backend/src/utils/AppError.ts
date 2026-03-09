/**
 * Custom application error class — gives every thrown error
 * a consistent shape: HTTP status code + message array + optional data.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errors?: string[];

    constructor(
        message: string,
        statusCode: number = 500,
        errors?: string[],
        isOperational = true,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;

        // Maintain proper prototype chain
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }

    // ── Static helpers ──────────────────────────────────────────
    static badRequest(msg: string, errors?: string[]): AppError {
        return new AppError(msg, 400, errors);
    }
    static unauthorized(msg = 'Unauthorized'): AppError {
        return new AppError(msg, 401);
    }
    static forbidden(msg = 'Access denied'): AppError {
        return new AppError(msg, 403);
    }
    static notFound(msg = 'Resource not found'): AppError {
        return new AppError(msg, 404);
    }
    static conflict(msg: string): AppError {
        return new AppError(msg, 409);
    }
    static internal(msg = 'Internal server error'): AppError {
        return new AppError(msg, 500, undefined, false);
    }
}
