import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Reads express-validator errors from the request and short-circuits
 * with a 400 if any exist. Place after validator rule arrays.
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const messages = errors.array().map((e) => e.msg as string);
    res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: messages,
    });
}
