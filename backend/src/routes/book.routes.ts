import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { bookController } from '../controllers/book.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate, librarianOnly, anyRole } from '../middleware/auth.middleware';
import { BookCategory } from '../types';

const router = Router();

// All book routes require authentication
router.use(authenticate);

// ─── GET /api/books/search ─────────────────────────────────────────────────
router.get(
    '/search',
    [
        query('q').optional().trim(),
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50.'),
        query('category').optional().isIn(Object.values(BookCategory)).withMessage('Invalid category.'),
    ],
    validate,
    anyRole,
    bookController.search,
);

// ─── GET /api/books/stats  (librarian only) ────────────────────────────────
router.get('/stats', librarianOnly, bookController.getStats);

// ─── GET /api/books ────────────────────────────────────────────────────────
router.get('/', anyRole, bookController.getAll);

// ─── GET /api/books/:id ────────────────────────────────────────────────────
router.get(
    '/:id',
    [param('id').isUUID().withMessage('Invalid book ID.')],
    validate,
    anyRole,
    bookController.getById,
);

// ─── POST /api/books  (librarian only) ────────────────────────────────────
router.post(
    '/',
    librarianOnly,
    [
        body('isbn').trim().notEmpty().withMessage('ISBN is required.'),
        body('title').trim().notEmpty().withMessage('Title is required.'),
        body('author').trim().notEmpty().withMessage('Author is required.'),
        body('publisher').trim().notEmpty().withMessage('Publisher is required.'),
        body('category').isIn(Object.values(BookCategory)).withMessage('Invalid category.'),
        body('totalCopies').isInt({ min: 1 }).withMessage('Total copies must be at least 1.'),
        body('publicationYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }),
    ],
    validate,
    bookController.create,
);

// ─── PUT /api/books/:id  (librarian only) ─────────────────────────────────
router.put(
    '/:id',
    librarianOnly,
    [
        param('id').isUUID().withMessage('Invalid book ID.'),
        body('title').optional().trim().notEmpty(),
        body('totalCopies').optional().isInt({ min: 1 }),
        body('category').optional().isIn(Object.values(BookCategory)),
    ],
    validate,
    bookController.update,
);

// ─── DELETE /api/books/:id  (librarian only) ──────────────────────────────
router.delete(
    '/:id',
    librarianOnly,
    [param('id').isUUID().withMessage('Invalid book ID.')],
    validate,
    bookController.delete,
);

export default router;
