/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import { body } from 'express-validator';
import { intMinZero, isAccount, isDate, nonEmptyString } from '../utils/validation.utils';
import { validateInputs } from '../utils/utils';
import ReimbursementRequestController from '../controllers/reimbursement-requests.controllers';

const reimbursementRequestsRouter = express.Router();

reimbursementRequestsRouter.get('/vendors', ReimbursementRequestController.getAllVendors);

reimbursementRequestsRouter.post(
  '/create',
  isDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  isAccount(body('account')),
  body('receiptPictures').isArray(),
  nonEmptyString(body('receiptPictures.*')),
  body('reimbursementProducts').isArray(),
  nonEmptyString(body('reimbursementProducts.*.name')),
  intMinZero(body('reimbursementProducts.*.cost')),
  intMinZero(body('reimbursementProducts.*.wbsElementId')),
  nonEmptyString(body('expenseTypeId')),
  intMinZero(body('totalCost')),
  validateInputs,
  ReimbursementRequestController.createReimbursementRequest
);

reimbursementRequestsRouter.post(
  '/:requestId/edit',
  isDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  isAccount(body('account')),
  body('receiptPictures').isArray(),
  nonEmptyString(body('receiptPictures.*')),
  body('reimbursementProducts').isArray(),
  nonEmptyString(body('reimbursementProducts.*.id').optional()),
  nonEmptyString(body('reimbursementProducts.*.name')),
  intMinZero(body('reimbursementProducts.*.cost')),
  intMinZero(body('reimbursementProducts.*.wbsElementId')),
  nonEmptyString(body('expenseTypeId')),
  intMinZero(body('totalCost')),
  validateInputs,
  ReimbursementRequestController.editReimbursementRequest
);

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
  '/expense-types/create',
  nonEmptyString(body('name')),
  intMinZero(body('code')),
  body('allowed').isBoolean(),
  validateInputs,
  ReimbursementRequestController.createExpenseType
);

reimbursementRequestsRouter.post('/:id/delete', validateInputs, ReimbursementRequestController.deleteReimbursementRequest);

export default reimbursementRequestsRouter;
