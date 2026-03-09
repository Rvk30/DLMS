import { Request, Response, NextFunction } from 'express';
import { fineService } from '../services/fine.service';
import { sendSuccess, buildMeta } from '../utils/response.utils';

export class FineController {
    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { fines, total, page, limit } = await fineService.getAll(
                req.user!.userId, req.user!.role, req.query
            );
            sendSuccess(res, fines, 'Fines fetched.', 200, buildMeta(total, page, limit));
        } catch (err) { next(err); }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const fine = await fineService.getById(req.params.id);
            sendSuccess(res, fine, 'Fine details fetched.');
        } catch (err) { next(err); }
    };

    calculate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await fineService.calculate(req.query.transactionId as string);
            sendSuccess(res, result, 'Fine calculated.');
        } catch (err) { next(err); }
    };

    pay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const fine = await fineService.pay(req.params.id, req.body.paidAmount);
            sendSuccess(res, fine, 'Fine paid successfully.');
        } catch (err) { next(err); }
    };

    waive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const fine = await fineService.waive(
                { fineId: req.params.id, waiverReason: req.body.waiverReason },
                req.user!.librarianId!,
            );
            sendSuccess(res, fine, 'Fine waived by librarian.');
        } catch (err) { next(err); }
    };

    getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const summary = await fineService.getSummary(req.user!.userId);
            sendSuccess(res, summary, 'Fine summary fetched.');
        } catch (err) { next(err); }
    };
}

export const fineController = new FineController();
