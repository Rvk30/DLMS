import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload, AuthTokens } from '../types';

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRY = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
const REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as SignOptions['expiresIn'];

/** Sign a short-lived access token */
export function signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/** Sign a long-lived refresh token */
export function signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

/** Sign both tokens at once */
export function signTokenPair(payload: TokenPayload): AuthTokens {
    return {
        accessToken: signAccessToken(payload),
        refreshToken: signRefreshToken(payload),
    };
}

/** Verify & decode an access token — throws if invalid/expired */
export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

/** Verify & decode a refresh token — throws if invalid/expired */
export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

/** Generate a random hex token for email verification / password reset */
export function generateSecureToken(): string {
    const { randomBytes } = require('crypto') as typeof import('crypto');
    return randomBytes(32).toString('hex');
}

/** Expiry date N hours from now */
export function expiresInHours(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}
