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
import { getOrganizationId } from '../utils/utils';

export default class ReimbursementRequestsController {
  static async getCurrentUserReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const userReimbursementRequests = await ReimbursementRequestService.getUserReimbursementRequests(user, organizationId);
      res.status(200).json(userReimbursementRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getCurrentUserReimbursements(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const userReimbursements = await ReimbursementRequestService.getUserReimbursements(user, organizationId);
      res.status(200).json(userReimbursements);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllReimbursements(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const reimbursements = await ReimbursementRequestService.getAllReimbursements(user, organizationId);
      res.status(200).json(reimbursements);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllVendors(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);

      const vendors: Vendor[] = await ReimbursementRequestService.getAllVendors(organizationId);
      res.status(200).json(vendors);
    } catch (error: unknown) {
      next(error);
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
      const organizationId = getOrganizationId(req.headers);

      const createdReimbursementRequest = await ReimbursementRequestService.createReimbursementRequest(
        user,
        dateOfExpense,
        vendorId,
        account,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        accountCodeId,
        totalCost,
        organizationId
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
      const organizationId = getOrganizationId(req.headers);

      const reimbursement = await ReimbursementRequestService.reimburseUser(amount, dateReceived, user, organizationId);
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
        accountCodeId,
        totalCost,
        otherReimbursementProducts,
        wbsReimbursementProducts,
        receiptPictures
      } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

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
        user,
        organizationId
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
      const organizationId = getOrganizationId(req.headers);

      const updatedReimbursement = await ReimbursementRequestService.editReimbursement(
        reimbursementId,
        editor,
        amount,
        dateReceived,
        organizationId
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
      const organizationId = getOrganizationId(req.headers);

      const deletedReimbursementRequest = await ReimbursementRequestService.deleteReimbursementRequest(
        requestId,
        user,
        organizationId
      );
      res.status(200).json(deletedReimbursementRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getPendingAdvisorList(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const requestsPendingAdvisors: ReimbursementRequest[] = await ReimbursementRequestService.getPendingAdvisorList(
        user,
        organizationId
      );
      res.status(200).json(requestsPendingAdvisors);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async sendPendingAdvisorList(req: Request, res: Response, next: NextFunction) {
    try {
      const { saboNumbers } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      await ReimbursementRequestService.sendPendingAdvisorList(user, saboNumbers, organizationId);
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
      const organizationId = getOrganizationId(req.headers);

      await ReimbursementRequestService.setSaboNumber(requestId, saboNumber, user, organizationId);
      res.status(200).json({ message: 'Successfully set sabo number' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const createdVendor = await ReimbursementRequestService.createVendor(user, name, organizationId);
      res.status(200).json(createdVendor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createAccountCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, code, allowed, allowedRefundSources } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const createdAccountCode = await ReimbursementRequestService.createAccountCode(
        user,
        name,
        code,
        allowed,
        allowedRefundSources,
        organizationId
      );
      res.status(200).json(createdAccountCode);
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
      const organizationId = getOrganizationId(req.headers);

      const receipt = await ReimbursementRequestService.uploadReceipt(requestId, file, user, organizationId);

      const isProd = process.env.NODE_ENV === 'production';
      const origin = isProd ? 'https://finishlinebyner.com' : 'http://localhost:3000';

      res.header('Access-Control-Allow-Origin', origin);
      res.status(200).json(receipt);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllAccountCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);
      const accountCodes = await ReimbursementRequestService.getAllAccountCodes(organizationId);
      res.status(200).json(accountCodes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllReimbursementRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const reimbursementRequests: ReimbursementRequest[] = await ReimbursementRequestService.getAllReimbursementRequests(
        user,
        organizationId
      );
      res.status(200).json(reimbursementRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async leadershipApproveReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const reimbursementStatus = await ReimbursementRequestService.leadershipApproveReimbursementRequest(
        requestId,
        user,
        organizationId
      );
      res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async approveReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const reimbursementStatus = await ReimbursementRequestService.approveReimbursementRequest(
        requestId,
        user,
        organizationId
      );
      res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async denyReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const reimbursementStatus = await ReimbursementRequestService.denyReimbursementRequest(
        requestId,
        user,
        organizationId
      );
      res.status(200).json(reimbursementStatus);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async markReimbursementRequestAsReimbursed(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedRequest = await ReimbursementRequestService.markReimbursementRequestAsReimbursed(
        requestId,
        user,
        organizationId
      );
      res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async markReimbursementRequestAsDelivered(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedRequest = await ReimbursementRequestService.markReimbursementRequestAsDelivered(
        user,
        requestId,
        organizationId
      );
      res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleReimbursementRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const reimbursementRequest: ReimbursementRequest = await ReimbursementRequestService.getSingleReimbursementRequest(
        user,
        requestId,
        organizationId
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
      const organizationId = getOrganizationId(req.headers);

      const imageData = await ReimbursementRequestService.downloadReceiptImage(fileId, user, organizationId);

      // Set the appropriate headers for the HTTP response
      res.setHeader('content-type', String(imageData.type));
      res.setHeader('content-length', imageData.buffer.length);

      // Send the Buffer as the response body
      res.send(imageData.buffer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editAccountCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountCodeId } = req.params;
      const { name, code, allowed, allowedRefundSources } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const accountCodeUpdated = await ReimbursementRequestService.editAccountCode(
        accountCodeId,
        code,
        name,
        allowed,
        submitter,
        allowedRefundSources,
        organizationId
      );
      res.status(200).json(accountCodeUpdated);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      const { name } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const editedVendor = await ReimbursementRequestService.editVendor(name, vendorId, submitter, organizationId);
      res.status(200).json(editedVendor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendorId } = req.params;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const deletedVendor = await ReimbursementRequestService.deleteVendor(vendorId, submitter, organizationId);
      res.status(200).json(deletedVendor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async markReimbursementRequestAsPendingFinance(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedRequest = await ReimbursementRequestService.markPendingFinance(user, requestId, organizationId);
      res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async requestReimbursementRequestChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedRequest = await ReimbursementRequestService.financeRequestReimbursementRequestChanges(
        user,
        requestId,
        organizationId
      );
      res.status(200).json(updatedRequest);
    } catch (error: unknown) {
      next(error);
    }
  }
}
