import express from 'express';
import { body } from 'express-validator';
import { intMinZero, isAccount, isDate, nonEmptyString } from '../utils/validation.utils';
import { validateInputs } from '../utils/utils';
import ReimbursementRequestController from '../controllers/reimbursement-requests.controllers';

const reimbursementRequestsRouter = express.Router();

reimbursementRequestsRouter.post(
  '/new',
  isDate(body('dateOfExpense')),
  nonEmptyString(body('vendorId')),
  isAccount(body('account')),
  nonEmptyString(body('receiptPictures.*')),
  nonEmptyString(body('reimbursementProducts.*.name')),
  intMinZero(body('reimbursementProducts.*.cost')),
  intMinZero(body('reimbursementProducts.*.wbsElementId')),
  nonEmptyString(body('expenseTypeId')),
  intMinZero(body('totalCost')),
  validateInputs,
  ReimbursementRequestController.createReimbursementRequest
);

reimbursementRequestsRouter.post(
  '/vendors/new',
  nonEmptyString(body('name')),
  validateInputs,
  ReimbursementRequestController.createVendor
);

export default reimbursementRequestsRouter;
