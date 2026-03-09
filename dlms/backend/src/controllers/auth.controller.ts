import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.utils';

export class AuthController {
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await authService.registerStudent(req.body);
            sendSuccess(res, result, 'Registration successful. Please verify your email.', 201);
        } catch (err) { next(err); }
    };

    registerLibrarian = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await authService.registerLibrarian(req.body);
            sendSuccess(res, result, 'Librarian account created.', 201);
        } catch (err) { next(err); }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await authService.login(req.body);
            sendSuccess(res, result, 'Login successful.');
        } catch (err) { next(err); }
    };

    logout = (_req: Request, res: Response): void => {
        // JWT is stateless — client discards the token
        // If using refresh token cookie, clear it here
        res.clearCookie('refreshToken');
        sendSuccess(res, null, 'Logged out successfully.');
    };

    verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await authService.verifyEmail(req.query.token as string);
            sendSuccess(res, null, 'Email verified successfully. You can now login.');
        } catch (err) { next(err); }
    };

    refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshTokens(refreshToken);
            sendSuccess(res, tokens, 'Token refreshed.');
        } catch (err) { next(err); }
    };

    resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await authService.resendVerification(req.body.email);
            sendSuccess(res, null, 'Verification email sent. Please check your inbox.');
        } catch (err) { next(err); }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await authService.forgotPassword(req.body.email);
            sendSuccess(res, null, 'If that email exists, a password reset link has been sent.');
        } catch (err) { next(err); }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await authService.resetPassword(req.body.token, req.body.newPassword);
            sendSuccess(res, null, 'Password reset successful. Please login.');
        } catch (err) { next(err); }
    };

    getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { prisma } = await import('../config/database');
            const user = await prisma.user.findUnique({
                where: { id: req.user!.userId },
                include: { student: { include: { account: true } }, librarian: true },
            });
            const { password, emailVerifyToken, resetPasswordToken, ...safe } = user as any;
            sendSuccess(res, safe, 'User profile fetched.');
        } catch (err) { next(err); }
    };
}

export const authController = new AuthController();
