/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NextFunction, Request, Response } from 'express';
import { getCurrentUser, getCurrentUserWithUserSettings } from '../utils/auth.utils';
import ReimbursementRequestService from '../services/reimbursement-requests.services';
import { ReimbursementRequest } from '../../../shared/src/types/reimbursement-requests-types';
import { Vendor } from 'shared';
import { HttpException } from '../utils/errors.utils';

export default class ReimbursementRequestsController {
  static async getCurrentUserReimbursementRequests(_req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const userReimbursementRequests = await ReimbursementRequestService.getUserReimbursementRequests(user);
      res.status(200).json(userReimbursementRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getCurrentUserReimbursements(_req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const userReimbursements = await ReimbursementRequestService.getUserReimbursements(user);
      res.status(200).json(userReimbursements);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllReimbursements(_req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const reimbursements = await ReimbursementRequestService.getAllReimbursements(user);
      res.status(200).json(reimbursements);
    } catch (error: unknown) {
      next(error);
    }
  }

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
      const {
        dateOfExpense,
        dateDelivered,
        vendorId,
        account,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        expenseTypeId,
        totalCost
      } = req.body;
      const user = await getCurrentUserWithUserSettings(res);
      const createdReimbursementRequest = await ReimbursementRequestService.createReimbursementRequest(
        user,
        dateOfExpense,
        dateDelivered,
        vendorId,
        account,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        expenseTypeId,
        totalCost
      );
      res.status(200).json(createdReimbursementRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async reimburseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { amount, dateReceived } = req.body;

      const reimbursement = await ReimbursementRequestService.reimburseUser(amount, dateReceived, user);
      res.status(200).json(reimbursement);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const {
        dateOfExpense,
        vendorId,
        account,
        expenseTypeId,
        totalCost,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        receiptPictures
      } = req.body;
      const user = await getCurrentUser(res);
      const updatedReimbursementRequestId = await ReimbursementRequestService.editReimbursementRequest(
        requestId,
        dateOfExpense,
        vendorId,
        account,
        expenseTypeId,
        totalCost,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        receiptPictures,
        user
      );
      res.status(200).json(updatedReimbursementRequestId);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editReimbursement(req: Request, res: Response, next: NextFunction) {
    try {
      const { reimbursementId } = req.params;
      const { amount, dateReceived } = req.body;
      const editor = await getCurrentUser(res);
      const updatedReimbursement = await ReimbursementRequestService.editReimbursement(
        reimbursementId,
        editor,
        amount,
        dateReceived
      );
      res.status(200).json(updatedReimbursement);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const deletedReimbursementRequest = await ReimbursementRequestService.deleteReimbursementRequest(requestId, user);
      res.status(200).json(deletedReimbursementRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getPendingAdvisorList(_req: Request, res: Response, next: NextFunction) {
    const user = await getCurrentUser(res);

    try {
      const requestsPendingAdvisors: ReimbursementRequest[] = await ReimbursementRequestService.getPendingAdvisorList(user);
      return res.status(200).json(requestsPendingAdvisors);
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
      const { name, code, allowed, allowedRefundSources } = req.body;
      const user = await getCurrentUser(res);
      const createdExpenseType = await ReimbursementRequestService.createExpenseType(
        user,
        name,
        code,
        allowed,
        allowedRefundSources
      );
      res.status(200).json(createdExpenseType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { requestId } = req.params;

      if (!file) throw new HttpException(400, 'Invalid or undefined image data');

      const user = await getCurrentUser(res);

      const receipt = await ReimbursementRequestService.uploadReceipt(requestId, file, user);

      const isProd = process.env.NODE_ENV === 'production';
      const origin = isProd ? 'https://finishlinebyner.com' : 'http://localhost:3000';

      res.header('Access-Control-Allow-Origin', origin);
      res.status(200).json(receipt);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllExpenseTypes(_req: Request, res: Response, next: NextFunction) {
    try {
      const expenseTypes = await ReimbursementRequestService.getAllExpenseTypes();
      res.status(200).json(expenseTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const reimbursementRequests: ReimbursementRequest[] = await ReimbursementRequestService.getAllReimbursementRequests(
        user
      );
      res.status(200).json(reimbursementRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async approveReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const reimbursementStatus = await ReimbursementRequestService.approveReimbursementRequest(requestId, user);
      res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async denyReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const reimbursementStatus = await ReimbursementRequestService.denyReimbursementRequest(requestId, user);
      res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async markReimbursementRequestAsReimbursed(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const updatedRequest = await ReimbursementRequestService.markReimbursementRequestAsReimbursed(requestId, user);
      res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async markReimbursementRequestAsDelivered(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const updatedRequest = await ReimbursementRequestService.markReimbursementRequestAsDelivered(user, requestId);
      res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const reimbursementRequest: ReimbursementRequest = await ReimbursementRequestService.getSingleReimbursementRequest(
        user,
        requestId
      );
      res.status(200).json(reimbursementRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async downloadReceiptImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const user = await getCurrentUser(res);
      const imageData = await ReimbursementRequestService.downloadReceiptImage(fileId, user);

      // Set the appropriate headers for the HTTP response
      res.setHeader('content-type', String(imageData.type));
      res.setHeader('content-length', imageData.buffer.length);

      // Send the Buffer as the response body
      res.send(imageData.buffer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editExpenseTypeCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { expenseTypeId } = req.params;
      const { name, code, allowed, allowedRefundSources } = req.body;
      const submitter = await getCurrentUser(res);
      const expenseTypeUpdated = await ReimbursementRequestService.editExpenseType(
        expenseTypeId,
        code,
        name,
        allowed,
        submitter,
        allowedRefundSources
      );
      res.status(200).json(expenseTypeUpdated);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      const { name } = req.body;
      const submitter = await getCurrentUser(res);
      const editVendors = await ReimbursementRequestService.editVendors(name, vendorId, submitter);
      res.status(200).json(editVendors);
    } catch (error: unknown) {
      next(error);
    }
  }
}
