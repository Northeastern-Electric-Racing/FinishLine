/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import { body } from 'express-validator';
import { intMinZero, isAccount, isDate, nonEmptyString, validateInputs, validateReimbursementProducts } from '../utils/validation.utils';
import ReimbursementRequestController from '../controllers/reimbursement-requests.controllers';
import multer, { memoryStorage } from 'multer';

const reimbursementRequestsRouter = express.Router();

const upload = multer({ limits: { fileSize: 30000000 }, storage: memoryStorage() });

reimbursementRequestsRouter.get('/vendors', ReimbursementRequestController.getAllVendors);

reimbursementRequestsRouter.get('/account-codes', ReimbursementRequestController.getAllAccountCodes);

reimbursementRequestsRouter.get('/current-user', ReimbursementRequestController.getCurrentUserReimbursementRequests);

reimbursementRequestsRouter.get('/reimbursements/current-user', ReimbursementRequestController.getCurrentUserReimbursements);

reimbursementRequestsRouter.get('/reimbursements', ReimbursementRequestController.getAllReimbursements);

reimbursementRequestsRouter.post(
  '/:vendorId/vendors/edit',
  nonEmptyString(body('name')),
  validateInputs,
  ReimbursementRequestController.editVendor
);

reimbursementRequestsRouter.post('/:vendorId/vendors/delete', ReimbursementRequestController.deleteVendor);

reimbursementRequestsRouter.post(
  '/create',
  isDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  isAccount(body('account')),
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
  isDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  isAccount(body('account')),
  body('receiptPictures').isArray(),
  nonEmptyString(body('receiptPictures.*.name')),
  nonEmptyString(body('receiptPictures.*.googleFileId')),
  nonEmptyString(body('accountCodeId')),
  intMinZero(body('totalCost')),
  validateReimbursementProducts(),
  validateInputs,
  ReimbursementRequestController.editReimbursementRequest
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
  validateInputs,
  ReimbursementRequestController.createVendor
);

reimbursementRequestsRouter.post(
  '/account-codes/create',
  nonEmptyString(body('name')),
  intMinZero(body('code')),
  body('allowed').isBoolean(),
  body('allowedRefundSources').isArray(),
  isAccount(body('allowedRefundSources.*')),
  validateInputs,
  ReimbursementRequestController.createAccountCode
);

reimbursementRequestsRouter.post(
  '/account-codes/:accountCodeId/edit',
  nonEmptyString(body('name')),
  intMinZero(body('code')),
  body('allowed').isBoolean(),
  validateInputs,
  ReimbursementRequestController.editAccountCode
);

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
  upload.single('image'),
  ReimbursementRequestController.uploadReceipt
);

reimbursementRequestsRouter.post('/:requestId/approve', ReimbursementRequestController.approveReimbursementRequest);
reimbursementRequestsRouter.delete('/:requestId/delete', ReimbursementRequestController.deleteReimbursementRequest);
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

export default reimbursementRequestsRouter;
