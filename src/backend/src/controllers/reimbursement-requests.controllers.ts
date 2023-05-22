/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import ReimbursementRequestService from '../services/reimbursement-requests.services';

export default class ReimbursementRequestsController {
  static async createReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateOfExpense, vendorId, account, receiptPictures, reimbursementProducts, expenseTypeId, totalCost } =
        req.body;
      const user = await getCurrentUser(res);
      const createdReimbursementRequest = await ReimbursementRequestService.createReimbursementRequest(
        user,
        dateOfExpense,
        vendorId,
        account,
        receiptPictures,
        reimbursementProducts,
        expenseTypeId,
        totalCost
      );
      res.status(200).json(createdReimbursementRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async addSaboNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { saboNumber } = req.body;
      const user = await getCurrentUser(res);
      await ReimbursementRequestService.addSaboNumber(requestId, saboNumber, user);
      res.status(200).json({ message: 'Successfully added sabo number' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      const createdVendor = await ReimbursementRequestService.createVendor(user, name);
      res.status(200).json(createdVendor);
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
