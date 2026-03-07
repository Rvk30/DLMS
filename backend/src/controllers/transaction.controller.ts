import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { sendSuccess, buildMeta } from '../utils/response.utils';

export class TransactionController {
    issue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tx = await transactionService.issue(req.body, req.user!.librarianId!);
            sendSuccess(res, tx, 'Book issued successfully.', 201);
        } catch (err) { next(err); }
    };

    return = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await transactionService.return(req.body, req.user!.librarianId!);
            const msg = result.fine
                ? `Book returned. Fine of ₹${result.fine.totalAmount} applied for ${result.daysOverdue} overdue day(s).`
                : 'Book returned successfully. No fine applied.';
            sendSuccess(res, result, msg);
        } catch (err) { next(err); }
    };

    getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { transactions, total, page, limit } = await transactionService.getHistory(
                req.user!.userId,
                req.user!.role,
                req.query,
            );
            sendSuccess(res, transactions, 'Transaction history fetched.', 200, buildMeta(total, page, limit));
        } catch (err) { next(err); }
    };

    markOverdue = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const count = await transactionService.markOverdueTransactions();
            sendSuccess(res, { updated: count }, `${count} transaction(s) marked as overdue.`);
        } catch (err) { next(err); }
    };
}

export const transactionController = new TransactionController();
