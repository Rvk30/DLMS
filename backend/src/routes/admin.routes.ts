import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { adminController } from '../controllers/admin.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate, librarianOnly } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication + librarian role
router.use(authenticate, librarianOnly);

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboard);

// ─── GET /api/admin/users ─────────────────────────────────────────────────
router.get(
    '/users',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 }),
        query('role').optional().isIn(['STUDENT', 'LIBRARIAN']).withMessage('Role must be STUDENT or LIBRARIAN.'),
        query('q').optional().trim(),
    ],
    validate,
    adminController.getUsers,
);

// ─── GET /api/admin/users/:userId ─────────────────────────────────────────
router.get(
    '/users/:userId',
    [param('userId').isUUID().withMessage('Invalid user ID.')],
    validate,
    adminController.getUserById,
);

// ─── PATCH /api/admin/users/:userId/verify-email ──────────────────────────
router.patch(
    '/users/:userId/verify-email',
    [
        param('userId').isUUID().withMessage('Invalid user ID.'),
        body('verified').isBoolean().withMessage('Verified must be a boolean.'),
    ],
    validate,
    adminController.setEmailVerified,
);

// ─── PATCH /api/admin/students/:studentId/status ──────────────────────────
router.patch(
    '/students/:studentId/status',
    [
        param('studentId').isUUID().withMessage('Invalid student ID.'),
        body('status').isIn(['ACTIVE', 'SUSPENDED', 'EXPIRED']).withMessage('Invalid status.'),
    ],
    validate,
    adminController.toggleAccountStatus,
);

// ─── DELETE /api/admin/users/:userId ──────────────────────────────────────
router.delete(
    '/users/:userId',
    [param('userId').isUUID().withMessage('Invalid user ID.')],
    validate,
    adminController.deleteUser,
);

export default router;
