import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { sendSuccess, buildMeta } from '../utils/response.utils';

export class AdminController {
    getDashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const stats = await adminService.getDashboardStats();
            sendSuccess(res, stats, 'Dashboard stats fetched.');
        } catch (err) { next(err); }
    };

    getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { users, total, page, limit } = await adminService.getUsers(req.query);
            sendSuccess(res, users, 'Users fetched.', 200, buildMeta(total, page, limit));
        } catch (err) { next(err); }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await adminService.getUserById(req.params.userId);
            sendSuccess(res, user, 'User detail fetched.');
        } catch (err) { next(err); }
    };

    toggleAccountStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const account = await adminService.toggleAccountStatus(
                req.params.studentId,
                req.body.status,
            );
            sendSuccess(res, account, `Student account ${req.body.status.toLowerCase()}.`);
        } catch (err) { next(err); }
    };

    setEmailVerified = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await adminService.setEmailVerified(req.params.userId, req.body.verified);
            sendSuccess(res, null, 'Email verification status updated.');
        } catch (err) { next(err); }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await adminService.deleteUser(req.params.userId);
            sendSuccess(res, null, 'User deleted.');
        } catch (err) { next(err); }
    };
}

export const adminController = new AdminController();
