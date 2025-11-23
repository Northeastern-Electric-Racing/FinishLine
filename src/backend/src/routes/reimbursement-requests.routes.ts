/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import { body } from 'express-validator';
import {
  intMinZero,
  isDate,
  isOptionalDate,
  nonEmptyString,
  validateInputs,
  validateReimbursementProducts
} from '../utils/validation.utils';
import ReimbursementRequestController from '../controllers/reimbursement-requests.controllers';
import multer, { memoryStorage } from 'multer';
import { MAX_FILE_SIZE } from 'shared';
import { multerErrorMiddleware } from '../utils/errors.utils';

const reimbursementRequestsRouter = express.Router();

const upload = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

const handleMulterError = multerErrorMiddleware(upload.single('image'));

reimbursementRequestsRouter.get('/vendors', ReimbursementRequestController.getAllVendors);

reimbursementRequestsRouter.get('/account-codes', ReimbursementRequestController.getAllAccountCodes);

reimbursementRequestsRouter.post(
  '/index-codes/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('code')),
  validateInputs,
  ReimbursementRequestController.createIndexCode
);

reimbursementRequestsRouter.post(
  '/index-codes/:indexCodeId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('code')),
  validateInputs,
  ReimbursementRequestController.editIndexCode
);
reimbursementRequestsRouter.get('/index-codes/:indexCodeId', ReimbursementRequestController.getSingleIndexCode);

reimbursementRequestsRouter.get('/index-codes', ReimbursementRequestController.getAllIndexCodes);

reimbursementRequestsRouter.post('/index-codes/:indexCodeId/delete', ReimbursementRequestController.deleteIndexCode);

reimbursementRequestsRouter.post(
  '/other-reimbursement-product-reasons/create',
  nonEmptyString(body('name')),
  intMinZero(body('budget')),
  nonEmptyString(body('indexCodeId')),
  body('accountCodeIds').isArray(),
  validateInputs,
  ReimbursementRequestController.createOtherReasonReimbursementProduct
);

reimbursementRequestsRouter.get(
  '/other-reimbursement-product-reasons',
  ReimbursementRequestController.getAllOtherReimbursementProductReasons
);

reimbursementRequestsRouter.get(
  '/other-reimbursement-product-reasons/:otherReimbursementProductReasonId',
  ReimbursementRequestController.getSingleOtherReimbursementProductReason
);

reimbursementRequestsRouter.post(
  '/other-reimbursement-product-reasons/:otherReimbursementProductReasonId/delete',
  ReimbursementRequestController.deleteOtherReimbursementProductReason
);

reimbursementRequestsRouter.get('/current-user', ReimbursementRequestController.getCurrentUserReimbursementRequests);

reimbursementRequestsRouter.get(
  '/assigned-user',
  ReimbursementRequestController.getCurrentUserAssignedReimbursementRequests
);

reimbursementRequestsRouter.get('/reimbursements/current-user', ReimbursementRequestController.getCurrentUserReimbursements);

reimbursementRequestsRouter.get(
  '/reimbursements/current-user-team',
  ReimbursementRequestController.getCurrentUsersTeamsReimbursementRequests
);

reimbursementRequestsRouter.get('/reimbursements', ReimbursementRequestController.getAllReimbursements);

reimbursementRequestsRouter.post(
  '/:vendorId/vendors/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('username')).optional(),
  nonEmptyString(body('password')).optional(),
  nonEmptyString(body('discountCode')).optional(),
  body('taxExempt').isBoolean(),
  body('twoFactorContacts').isArray(),
  nonEmptyString(body('twoFactorContacts.*')),
  nonEmptyString(body('notes')).optional(),
  validateInputs,
  ReimbursementRequestController.editVendor
);

reimbursementRequestsRouter.post('/:vendorId/vendors/delete', ReimbursementRequestController.deleteVendor);

reimbursementRequestsRouter.post(
  '/create',
  isOptionalDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  nonEmptyString(body('indexCodeId')),
  nonEmptyString(body('accountCodeId')),
  intMinZero(body('totalCost')),
  validateReimbursementProducts(),
  validateInputs,
  ReimbursementRequestController.createReimbursementRequest
);

reimbursementRequestsRouter.get('/', ReimbursementRequestController.getAllReimbursementRequests);

reimbursementRequestsRouter.get('/:requestId', ReimbursementRequestController.getSingleReimbursementRequest);

reimbursementRequestsRouter.post(
  '/:requestId/edit',
  isOptionalDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  nonEmptyString(body('indexCodeId')),
  body('receiptPictures').isArray(),
  nonEmptyString(body('receiptPictures.*.name')),
  nonEmptyString(body('receiptPictures.*.googleFileId')),
  nonEmptyString(body('accountCodeId')),
  intMinZero(body('totalCost')),
  validateReimbursementProducts(),
  validateInputs,
  ReimbursementRequestController.editReimbursementRequest
);

reimbursementRequestsRouter.post(
  '/:requestId/assign-finance-member',
  nonEmptyString(body('assigneeId')),
  validateInputs,
  ReimbursementRequestController.assignFinanceMember
);

reimbursementRequestsRouter.get('/pending-advisor/list', ReimbursementRequestController.getPendingAdvisorList);

reimbursementRequestsRouter.post(
  '/pending-advisor/send',
  body('saboNumbers').isArray(),
  intMinZero(body('saboNumbers.*')),
  validateInputs,
  ReimbursementRequestController.sendPendingAdvisorList
);

reimbursementRequestsRouter.post(
  '/:requestId/set-sabo-number',
  intMinZero(body('saboNumber')),
  validateInputs,
  ReimbursementRequestController.setSaboNumber
);

reimbursementRequestsRouter.post(
  '/vendors/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('username')).optional(),
  nonEmptyString(body('password')).optional(),
  nonEmptyString(body('discountCode')).optional(),
  body('taxExempt').optional().isBoolean(),
  body('twoFactorContacts').optional().isArray(),
  nonEmptyString(body('twoFactorContacts.*')),
  nonEmptyString(body('notes')).optional(),
  validateInputs,
  ReimbursementRequestController.createVendor
);

reimbursementRequestsRouter.post(
  '/account-codes/create',
  nonEmptyString(body('name')),
  intMinZero(body('code')),
  body('allowed').isBoolean(),
  intMinZero(body('amount')).optional(),
  body('indexCodeIds').isArray(),
  nonEmptyString(body('indexCodeIds.*')),
  validateInputs,
  ReimbursementRequestController.createAccountCode
);

reimbursementRequestsRouter.post(
  '/account-codes/:accountCodeId/edit',
  nonEmptyString(body('name')),
  intMinZero(body('code')),
  body('allowed').isBoolean(),
  intMinZero(body('amount')).optional(),
  body('indexCodeIds').isArray(),
  nonEmptyString(body('indexCodeIds.*')),
  validateInputs,
  ReimbursementRequestController.editAccountCode
);

reimbursementRequestsRouter.post('/account-codes/:accountCodeId/delete', ReimbursementRequestController.deleteAccountCode);

reimbursementRequestsRouter.post(
  '/reimburse',
  intMinZero(body('amount')),
  isDate(body('dateReceived')),
  validateInputs,
  ReimbursementRequestController.reimburseUser
);

reimbursementRequestsRouter.post(
  '/reimburse/:reimbursementId/edit',
  intMinZero(body('amount')),
  isDate(body('dateReceived')),
  validateInputs,
  ReimbursementRequestController.editReimbursement
);

reimbursementRequestsRouter.post(
  '/:requestId/upload-receipt',
  handleMulterError,
  ReimbursementRequestController.uploadReceipt
);

reimbursementRequestsRouter.post(
  '/:requestId/input-in-sabo',
  ReimbursementRequestController.inputReimbursementRequestInSabo
);
reimbursementRequestsRouter.post(
  '/:requestId/mark-sabo-submitted',
  ReimbursementRequestController.markReimbursementRequestAsSaboSubmitted
);
reimbursementRequestsRouter.post(
  '/:requestId/leadership-approve',
  ReimbursementRequestController.leadershipApproveReimbursementRequest
);
reimbursementRequestsRouter.post('/:requestId/delete', ReimbursementRequestController.deleteReimbursementRequest);
reimbursementRequestsRouter.post('/:requestId/deny', ReimbursementRequestController.denyReimbursementRequest);

reimbursementRequestsRouter.post(
  '/:requestId/delivered',
  ReimbursementRequestController.markReimbursementRequestAsDelivered
);

reimbursementRequestsRouter.post(
  '/:requestId/reimbursed',
  ReimbursementRequestController.markReimbursementRequestAsReimbursed
);

reimbursementRequestsRouter.get('/receipt-image/:fileId', ReimbursementRequestController.downloadReceiptImage);

reimbursementRequestsRouter.post(
  '/:requestId/request-changes',
  ReimbursementRequestController.requestReimbursementRequestChanges
);

reimbursementRequestsRouter.post(
  '/:requestId/pending-finance',
  ReimbursementRequestController.markReimbursementRequestAsPendingFinance
);

reimbursementRequestsRouter.post(
  '/:requestId/comments',
  nonEmptyString(body('comment')),
  validateInputs,
  ReimbursementRequestController.createReimbursementRequestComment
);

reimbursementRequestsRouter.post(
  '/comments/:commentId/edit',
  nonEmptyString(body('comment')),
  validateInputs,
  ReimbursementRequestController.editReimbursementRequestComment
);

reimbursementRequestsRouter.post('/comments/:commentId', ReimbursementRequestController.deleteReimbursementRequestComment);

reimbursementRequestsRouter.post(
  '/other-reimbursement-product-reasons/:otherReimbursementProductReasonId/edit',
  nonEmptyString(body('indexCodeId')),
  body('accountCodeIds').isArray(),
  nonEmptyString(body('accountCodeIds.*')),
  nonEmptyString(body('name')),
  intMinZero(body('budget')),
  validateInputs,
  ReimbursementRequestController.editOtherReimbursementProductReason
);

export default reimbursementRequestsRouter;
