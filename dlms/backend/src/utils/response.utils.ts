import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send a standardised JSON success response.
 */
export function sendSuccess<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: ApiResponse<T>['meta'],
): Response {
    const body: ApiResponse<T> = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
}

/**
 * Send a standardised JSON error response.
 */
export function sendError(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: string[],
): Response {
    const body: ApiResponse = { success: false, message };
    if (errors?.length) body.errors = errors;
    return res.status(statusCode).json(body);
}

/**
 * Build pagination meta from raw counts.
 */
export function buildMeta(
    total: number,
    page: number,
    limit: number,
): ApiResponse['meta'] {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
