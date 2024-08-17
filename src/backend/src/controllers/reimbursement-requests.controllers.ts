/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NextFunction, Request, Response } from 'express';
import { getCurrentUserWithUserSettings } from '../utils/auth.utils';
import ReimbursementRequestService from '../services/reimbursement-requests.services';
import { ReimbursementRequest } from '../../../shared/src/types/reimbursement-requests-types';
import { Vendor } from 'shared';
import { HttpException } from '../utils/errors.utils';

export default class ReimbursementRequestsController {
  static async getCurrentUserReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userReimbursementRequests = await ReimbursementRequestService.getUserReimbursementRequests(
        req.currentUser,
        req.organization
      );
      return res.status(200).json(userReimbursementRequests);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getCurrentUserReimbursements(req: Request, res: Response, next: NextFunction) {
    try {
      const userReimbursements = await ReimbursementRequestService.getUserReimbursements(req.currentUser, req.organization);
      return res.status(200).json(userReimbursements);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllReimbursements(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursements = await ReimbursementRequestService.getAllReimbursements(req.currentUser, req.organization);
      return res.status(200).json(reimbursements);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const vendors: Vendor[] = await ReimbursementRequestService.getAllVendors(req.organization);
      return res.status(200).json(vendors);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        dateOfExpense,
        vendorId,
        account,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        accountCodeId,
        totalCost
      } = req.body;
      const user = await getCurrentUserWithUserSettings(res);

      const createdReimbursementRequest = await ReimbursementRequestService.createReimbursementRequest(
        user,
        dateOfExpense,
        vendorId,
        account,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        accountCodeId,
        totalCost,
        req.organization
      );
      return res.status(200).json(createdReimbursementRequest);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async reimburseUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, dateReceived } = req.body;
      const reimbursement = await ReimbursementRequestService.reimburseUser(
        amount,
        dateReceived,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(reimbursement);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const {
        dateOfExpense,
        vendorId,
        account,
        accountCodeId,
        totalCost,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        receiptPictures
      } = req.body;

      const updatedReimbursementRequestId = await ReimbursementRequestService.editReimbursementRequest(
        requestId,
        dateOfExpense,
        vendorId,
        account,
        accountCodeId,
        totalCost,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        receiptPictures,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(updatedReimbursementRequestId);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editReimbursement(req: Request, res: Response, next: NextFunction) {
    try {
      const { reimbursementId } = req.params;
      const { amount, dateReceived } = req.body;

      const updatedReimbursement = await ReimbursementRequestService.editReimbursement(
        reimbursementId,
        req.currentUser,
        amount,
        dateReceived,
        req.organization
      );
      return res.status(200).json(updatedReimbursement);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const deletedReimbursementRequest = await ReimbursementRequestService.deleteReimbursementRequest(
        requestId,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(deletedReimbursementRequest);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getPendingAdvisorList(req: Request, res: Response, next: NextFunction) {
    try {
      const requestsPendingAdvisors: ReimbursementRequest[] = await ReimbursementRequestService.getPendingAdvisorList(
        req.currentUser,
        req.organization
      );
      return res.status(200).json(requestsPendingAdvisors);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async sendPendingAdvisorList(req: Request, res: Response, next: NextFunction) {
    try {
      const { saboNumbers } = req.body;
      await ReimbursementRequestService.sendPendingAdvisorList(req.currentUser, saboNumbers, req.organization);
      return res.status(200).json({ message: 'Successfully sent pending advisor list' });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setSaboNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { saboNumber } = req.body;
      await ReimbursementRequestService.setSaboNumber(requestId, saboNumber, req.currentUser, req.organization);
      return res.status(200).json({ message: 'Successfully set sabo number' });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const createdVendor = await ReimbursementRequestService.createVendor(req.currentUser, name, req.organization);
      return res.status(200).json(createdVendor);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createAccountCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, allowed, allowedRefundSources } = req.body;
      const createdAccountCode = await ReimbursementRequestService.createAccountCode(
        req.currentUser,
        name,
        code,
        allowed,
        allowedRefundSources,
        req.organization
      );
      return res.status(200).json(createdAccountCode);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async uploadReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { requestId } = req.params;
      if (!file) throw new HttpException(400, 'Invalid or undefined image data');
      const receipt = await ReimbursementRequestService.uploadReceipt(requestId, file, req.currentUser, req.organization);
      const isProd = process.env.NODE_ENV === 'production';
      const origin = isProd ? 'https://finishlinebyner.com' : 'http://localhost:3000';

      res.header('Access-Control-Allow-Origin', origin);
      return res.status(200).json(receipt);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllAccountCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const accountCodes = await ReimbursementRequestService.getAllAccountCodes(req.organization);
      return res.status(200).json(accountCodes);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursementRequests: ReimbursementRequest[] = await ReimbursementRequestService.getAllReimbursementRequests(
        req.currentUser,
        req.organization
      );
      return res.status(200).json(reimbursementRequests);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async leadershipApproveReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const reimbursementStatus = await ReimbursementRequestService.leadershipApproveReimbursementRequest(
        requestId,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async approveReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const reimbursementStatus = await ReimbursementRequestService.approveReimbursementRequest(
        requestId,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async denyReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const reimbursementStatus = await ReimbursementRequestService.denyReimbursementRequest(
        requestId,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async markReimbursementRequestAsReimbursed(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const updatedRequest = await ReimbursementRequestService.markReimbursementRequestAsReimbursed(
        requestId,
        req.currentUser,
        req.organization
      );
      return res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async markReimbursementRequestAsDelivered(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const updatedRequest = await ReimbursementRequestService.markReimbursementRequestAsDelivered(
        req.currentUser,
        requestId,
        req.organization
      );
      return res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;

      const reimbursementRequest: ReimbursementRequest = await ReimbursementRequestService.getSingleReimbursementRequest(
        req.currentUser,
        requestId,
        req.organization
      );
      return res.status(200).json(reimbursementRequest);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async downloadReceiptImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;

      const imageData = await ReimbursementRequestService.downloadReceiptImage(fileId, req.currentUser, req.organization);

      // Set the appropriate headers for the HTTP response
      res.setHeader('content-type', String(imageData.type));
      res.setHeader('content-length', imageData.buffer.length);

      // Send the Buffer as the response body
      res.send(imageData.buffer);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editAccountCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountCodeId } = req.params;
      const { name, code, allowed, allowedRefundSources } = req.body;

      const accountCodeUpdated = await ReimbursementRequestService.editAccountCode(
        accountCodeId,
        code,
        name,
        allowed,
        req.currentUser,
        allowedRefundSources,
        req.organization
      );
      return res.status(200).json(accountCodeUpdated);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      const { name } = req.body;

      const editedVendor = await ReimbursementRequestService.editVendor(name, vendorId, req.currentUser, req.organization);
      return res.status(200).json(editedVendor);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;

      const deletedVendor = await ReimbursementRequestService.deleteVendor(vendorId, req.currentUser, req.organization);
      return res.status(200).json(deletedVendor);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
