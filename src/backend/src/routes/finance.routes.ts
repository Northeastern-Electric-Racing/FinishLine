import express from 'express';
import { nonEmptyString, validateInputs, isDate } from '../utils/validation.utils';
import { body } from 'express-validator';
import FinanceController from '../controllers/finance.controllers';

const financeRouter = express.Router();

financeRouter.post(
  '/sponsor/create',
  nonEmptyString(body('name')),
  body('activeStatus').isBoolean(),
  body('sponsorValue').isInt(),
  isDate(body('joinDate')),
  body('activeYears').isArray(),
  nonEmptyString(body('sponsorTierId')),
  body('taxExempt').isBoolean(),
  nonEmptyString(body('vendorContact')),
  body('sponsorTasks').isArray(),
  nonEmptyString(body('discountCode')),
  validateInputs,
  FinanceController.createSponsor
);

financeRouter.get('/sponsors', FinanceController.getAllSponsors);

export default financeRouter;
