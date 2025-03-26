import express from 'express';
import { nonEmptyString, validateInputs, isDate, isOptionalDate } from '../utils/validation.utils';
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

financeRouter.get('/sponsor/:sponsorId/sponsorTasks', FinanceController.getSponsorTasks);

financeRouter.delete('/sponsor/:sponsorId/delete', FinanceController.deleteSponsor);

financeRouter.post(
  '/sponsorTier/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  FinanceController.createSponsorTier
);

financeRouter.post(
  '/sponsorTask/create',
  isDate(body('dueDate')),
  nonEmptyString(body('notes')),
  nonEmptyString(body('sponsorId')),
  isOptionalDate(body('notifyDate')),
  nonEmptyString(body('assigneeId')).optional(),
  FinanceController.createSponsorTask
);

export default financeRouter;
