import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import ReimbursementRequestService from '../services/reimbursement-requests.services';
import { ReimbursementRequest } from '../../../shared/src/types/reimbursement-requests-types';

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

  static async getAllReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursementRequests: ReimbursementRequest[] = await ReimbursementRequestService.getAllReimbursementRequests();
      res.status(200).json(reimbursementRequests);
    } catch (error: unknown) {
      next(error);
    }
  }
}
