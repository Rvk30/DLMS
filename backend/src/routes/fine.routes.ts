import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { fineController } from '../controllers/fine.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate, librarianOnly, anyRole } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// ─── GET /api/fines/summary ───────────────────────────────────────────────
router.get('/summary', anyRole, fineController.getSummary);

// ─── GET /api/fines/calculate?transactionId=... ───────────────────────────
router.get(
    '/calculate',
    anyRole,
    [query('transactionId').isUUID().withMessage('Valid transaction ID required.')],
    validate,
    fineController.calculate,
);

// ─── GET /api/fines ───────────────────────────────────────────────────────
router.get('/', anyRole, fineController.getAll);

// ─── GET /api/fines/:id ───────────────────────────────────────────────────
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Invalid fine ID.')],
    validate,
    anyRole,
    fineController.getById,
);

// ─── POST /api/fines/:id/pay ──────────────────────────────────────────────
router.post(
    '/:id/pay',
    anyRole,
    [param('id').isUUID().withMessage('Invalid fine ID.')],
    validate,
    fineController.pay,
);

// ─── POST /api/fines/:id/waive  (librarian only) ─────────────────────────
router.post(
    '/:id/waive',
    librarianOnly,
    [
        param('id').isUUID().withMessage('Invalid fine ID.'),
        body('waiverReason').optional().trim(),
    ],
    validate,
    fineController.waive,
);

export default router;
