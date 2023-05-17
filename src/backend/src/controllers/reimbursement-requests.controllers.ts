import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import ReimbursementRequestService from '../services/reimbursement-requests.services';

export default class ReimbursementRequestController {
  static async createReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateOfExpense, vendorId, account, receiptPictures, reimbursementProducts, expenseTypeId, totalCost } =
        req.body;
      const user = await getCurrentUser(res);
      const createdReimbursementRequestId = await ReimbursementRequestService.createReimbursementRequest(
        user,
        dateOfExpense,
        vendorId,
        account,
        receiptPictures,
        reimbursementProducts,
        expenseTypeId,
        totalCost
      );
      res.status(200).json(createdReimbursementRequestId);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const createdVendorId = await ReimbursementRequestService.createVendor(name);
      res.status(200).json(createdVendorId);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createExpenseType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, allowed } = req.body;
      const user = await getCurrentUser(res);
      const createdExpenseType = await ReimbursementRequestService.createExpenseType(user, name, code, allowed);
      res.status(200).json(createdExpenseType);
    } catch (error: unknown) {
      next(error);
    }
  }
}
