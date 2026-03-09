import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { signTokenPair, verifyRefreshToken, generateSecureToken, expiresInHours } from '../utils/jwt.utils';
import { emailService } from './email.service';
import type { RegisterStudentDTO, RegisterLibrarianDTO, LoginDTO, TokenPayload, AuthTokens } from '../types';
import { Role } from '../types';

export class AuthService {
    // ── Register Student ─────────────────────────────────────────────────────
    async registerStudent(dto: RegisterStudentDTO): Promise<{ user: object; tokens: AuthTokens }> {
        // Check duplicate email
        const existing = await prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw AppError.conflict('Email already registered.');

        // Check duplicate studentId
        const existingStudent = await prisma.student.findUnique({ where: { studentId: dto.studentId } });
        if (existingStudent) throw AppError.conflict('Student ID already registered.');

        const hashed = await bcrypt.hash(dto.password, 12);
        const verifyToken = generateSecureToken();

        const user = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
                role: Role.STUDENT,
                phone: dto.phone,
                emailVerifyToken: verifyToken,
                emailVerifyExpiry: expiresInHours(24),
                student: {
                    create: {
                        studentId: dto.studentId,
                        className: dto.className,
                        department: dto.department,
                        semester: dto.semester,
                        account: { create: {} },
                    },
                },
            },
            include: { student: { include: { account: true } } },
        });

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            studentId: user.student?.id,
        };

        // Send verification email (non-blocking)
        emailService
            .sendVerification(user.name, user.email, verifyToken)
            .catch(console.error);

        return {
            user: this._safeUser(user),
            tokens: signTokenPair(payload),
        };
    }

    // ── Register Librarian ───────────────────────────────────────────────────
    async registerLibrarian(dto: RegisterLibrarianDTO): Promise<{ user: object; tokens: AuthTokens }> {
        const existing = await prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw AppError.conflict('Email already registered.');

        const hashed = await bcrypt.hash(dto.password, 12);
        const verifyToken = generateSecureToken();

        const user = await prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: hashed,
                role: Role.LIBRARIAN,
                phone: dto.phone,
                emailVerifyToken: verifyToken,
                emailVerifyExpiry: expiresInHours(24),
                librarian: {
                    create: {
                        employeeId: dto.employeeId,
                        department: dto.department,
                    },
                },
            },
            include: { librarian: true },
        });

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            librarianId: user.librarian?.id,
        };

        return {
            user: this._safeUser(user),
            tokens: signTokenPair(payload),
        };
    }

    // ── Login ────────────────────────────────────────────────────────────────
    async login(dto: LoginDTO): Promise<{ user: object; tokens: AuthTokens }> {
        const user = await prisma.user.findUnique({
            where: { email: dto.email },
            include: { student: true, librarian: true },
        });
        if (!user) throw AppError.unauthorized('Invalid email or password.');

        const match = await bcrypt.compare(dto.password, user.password);
        if (!match) throw AppError.unauthorized('Invalid email or password.');

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            studentId: user.student?.id,
            librarianId: user.librarian?.id,
        };

        return {
            user: this._safeUser(user),
            tokens: signTokenPair(payload),
        };
    }

    // ── Verify Email ─────────────────────────────────────────────────────────
    async verifyEmail(token: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { emailVerifyToken: token },
        });

        if (!user) throw AppError.badRequest('Invalid verification link.');
        if (user.emailVerifyExpiry && user.emailVerifyExpiry < new Date()) {
            throw AppError.badRequest('Verification link has expired. Please request a new one.');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                emailVerifyToken: null,
                emailVerifyExpiry: null,
            },
        });
    }

    // ── Refresh Token ────────────────────────────────────────────────────────
    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        let payload: TokenPayload;
        try {
            payload = verifyRefreshToken(refreshToken);
        } catch {
            throw AppError.unauthorized('Invalid or expired refresh token.');
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            include: { student: true, librarian: true },
        });
        if (!user) throw AppError.unauthorized('User no longer exists.');

        const newPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            studentId: user.student?.id,
            librarianId: user.librarian?.id,
        };
        return signTokenPair(newPayload);
    }

    // ── Resend Verification Email ─────────────────────────────────────────────
    async resendVerification(email: string): Promise<{ token: string }> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw AppError.notFound('No account found with that email.');
        if (user.isEmailVerified) throw AppError.badRequest('Email already verified.');

        const token = generateSecureToken();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerifyToken: token,
                emailVerifyExpiry: expiresInHours(24),
            },
        });
        return { token };
    }

    // ── Forgot / Reset Password ───────────────────────────────────────────────
    async forgotPassword(email: string): Promise<{ token: string }> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Return success even if not found — security best practice
            return { token: '' };
        }
        const token = generateSecureToken();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpiry: expiresInHours(1),
            },
        });

        // Send the password reset email (non-blocking)
        emailService
            .sendPasswordReset(user.name, user.email, token)
            .catch(console.error);

        return { token };
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { resetPasswordToken: token } });
        if (!user) throw AppError.badRequest('Invalid or expired reset link.');
        if (user.resetPasswordExpiry && user.resetPasswordExpiry < new Date()) {
            throw AppError.badRequest('Reset link expired. Please request a new one.');
        }
        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashed,
                resetPasswordToken: null,
                resetPasswordExpiry: null,
            },
        });
    }

    // ── Strip sensitive fields ───────────────────────────────────────────────
    private _safeUser(user: any): object {
        const { password, emailVerifyToken, emailVerifyExpiry,
            resetPasswordToken, resetPasswordExpiry, ...safe } = user;
        return safe;
    }
}

export const authService = new AuthService();
