import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { transactionController } from '../controllers/transaction.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate, librarianOnly, anyRole } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── POST /api/transactions/issue  (librarian only) ────────────────────────
router.post(
    '/issue',
    librarianOnly,
    [
        body('studentId').isUUID().withMessage('Valid student ID required.'),
        body('bookId').isUUID().withMessage('Valid book ID required.'),
        body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date.'),
    ],
    validate,
    transactionController.issue,
);

// ─── POST /api/transactions/return  (librarian only) ──────────────────────
router.post(
    '/return',
    librarianOnly,
    [body('transactionId').isUUID().withMessage('Valid transaction ID required.')],
    validate,
    transactionController.return,
);

// ─── GET /api/transactions/history ────────────────────────────────────────
router.get(
    '/history',
    anyRole,
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 }),
        query('status').optional().isIn(['ISSUED', 'RETURNED', 'OVERDUE', 'LOST']),
    ],
    validate,
    transactionController.getHistory,
);

// ─── POST /api/transactions/mark-overdue  (librarian only) ────────────────
router.post('/mark-overdue', librarianOnly, transactionController.markOverdue);

export default router;
