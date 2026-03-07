import { Router } from 'express';
import { body, query } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// ─── POST /api/auth/register ──────────────────────────────────────────────
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
        body('password')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase, and a number.'),
        body('studentId').trim().notEmpty().withMessage('Student ID is required.'),
        body('className').trim().notEmpty().withMessage('Class name is required.'),
        body('semester').optional().isInt({ min: 1, max: 12 }).withMessage('Semester must be 1–12.'),
        body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number.'),
    ],
    validate,
    authController.register,
);

// ─── POST /api/auth/register-librarian  (librarian-only in production) ───
router.post(
    '/register-librarian',
    [
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
        body('employeeId').trim().notEmpty().withMessage('Employee ID is required.'),
        body('department').trim().notEmpty().withMessage('Department is required.'),
    ],
    validate,
    authController.registerLibrarian,
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    validate,
    authController.login,
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────
router.post('/logout', authenticate, authController.logout);

// ─── GET  /api/auth/verify-email?token=... ────────────────────────────────
router.get(
    '/verify-email',
    [query('token').notEmpty().withMessage('Token is required.')],
    validate,
    authController.verifyEmail,
);

// ─── POST /api/auth/refresh ───────────────────────────────────────────────
router.post(
    '/refresh',
    [body('refreshToken').notEmpty().withMessage('Refresh token required.')],
    validate,
    authController.refreshToken,
);

// ─── POST /api/auth/resend-verification ──────────────────────────────────
router.post(
    '/resend-verification',
    [body('email').isEmail().normalizeEmail().withMessage('Valid email required.')],
    validate,
    authController.resendVerification,
);

// ─── POST /api/auth/forgot-password ──────────────────────────────────────
router.post(
    '/forgot-password',
    [body('email').isEmail().normalizeEmail().withMessage('Valid email required.')],
    validate,
    authController.forgotPassword,
);

// ─── POST /api/auth/reset-password ───────────────────────────────────────
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Reset token required.'),
        body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
    ],
    validate,
    authController.resetPassword,
);

// ─── GET  /api/auth/me  (protected) ──────────────────────────────────────
router.get('/me', authenticate, authController.getMe);

export default router;
