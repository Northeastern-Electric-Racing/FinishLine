import express from 'express';
import { nonEmptyString, validateInputs, isDate } from '../utils/validation.utils';
import { body } from 'express-validator';
import FinanceController from '../controllers/finance.controllers';

const financeRouter = express.Router();

financeRouter.post(
  '/finance/sponsor/create',
  nonEmptyString(body('name')),
  body('status').isBoolean(),
  body('sponsorValue').isInt(),
  isDate(body('joinDate')),
  body('activeYears').isArray(),
  nonEmptyString(body('sponsorTier')),
  body('taxExempt').isBoolean(),
  nonEmptyString(body('discountCode')),
  nonEmptyString(body('vendorContact')),
  body('sponsorTasks').isArray(),
  validateInputs,
  FinanceController.createSponsor
);
