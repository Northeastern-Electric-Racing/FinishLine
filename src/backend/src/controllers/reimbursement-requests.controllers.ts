/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import ReimbursementRequestService from '../services/reimbursement-requests.services';
import { ReimbursementRequest } from '../../../shared/src/types/reimbursement-requests-types';
import { Vendor } from 'shared';

export default class ReimbursementRequestsController {
  static async getAllVendors(_req: Request, res: Response, next: NextFunction) {
    try {
      const vendors: Vendor[] = await ReimbursementRequestService.getAllVendors();
      return res.status(200).json(vendors);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  static async editReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { dateOfExpense, vendorId, account, expenseTypeId, totalCost, reimbursementProducts, receiptPictures } =
        req.body;
      const user = await getCurrentUser(res);
      const updatedReimbursementRequestId = await ReimbursementRequestService.editReimbursementRequest(
        requestId,
        dateOfExpense,
        vendorId,
        account,
        expenseTypeId,
        totalCost,
        reimbursementProducts,
        receiptPictures,
        user
      );
      res.status(200).json(updatedReimbursementRequestId);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async sendPendingAdvisorList(req: Request, res: Response, next: NextFunction) {
    try {
      const { saboNumbers } = req.body;
      const user = await getCurrentUser(res);
      await ReimbursementRequestService.sendPendingAdvisorList(user, saboNumbers);
      res.status(200).json({ message: 'Successfully sent pending advisor list' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setSaboNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { saboNumber } = req.body;
      const user = await getCurrentUser(res);
      await ReimbursementRequestService.setSaboNumber(requestId, saboNumber, user);
      res.status(200).json({ message: 'Successfully set sabo number' });
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

  static async getAllReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursementRequests: ReimbursementRequest[] = await ReimbursementRequestService.getAllReimbursementRequests();
      res.status(200).json(reimbursementRequests);
    } catch (error: unknown) {
      next(error);
    }
  }
}
