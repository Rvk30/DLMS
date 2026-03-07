import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/book.service';
import { sendSuccess, buildMeta } from '../utils/response.utils';
import type { BookSearchQuery } from '../types';

export class BookController {
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { books, total, page, limit } = await bookService.getAll(req.query as BookSearchQuery);
            sendSuccess(res, books, 'Books fetched.', 200, buildMeta(total, page, limit));
        } catch (err) { next(err); }
    };

    search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { books, total, page, limit } = await bookService.search(req.query as BookSearchQuery);
            sendSuccess(res, books, 'Search results.', 200, buildMeta(total, page, limit));
        } catch (err) { next(err); }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const book = await bookService.getById(req.params.id);
            sendSuccess(res, book, 'Book fetched.');
        } catch (err) { next(err); }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const book = await bookService.create(req.body, req.user!.userId);
            sendSuccess(res, book, 'Book added successfully.', 201);
        } catch (err) { next(err); }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const book = await bookService.update(req.params.id, req.body);
            sendSuccess(res, book, 'Book updated.');
        } catch (err) { next(err); }
    };

    delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await bookService.delete(req.params.id);
            sendSuccess(res, null, 'Book deleted.');
        } catch (err) { next(err); }
    };

    getStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await bookService.getStats();
            sendSuccess(res, stats, 'Book stats fetched.');
        } catch (err) { next(err); }
    };
}

export const bookController = new BookController();
