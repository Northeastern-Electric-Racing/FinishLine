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
  nonEmptyString(body('discountCode')).optional(),
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
  '/sponsorTask/:sponsorTaskId/edit',
  isDate(body('dueDate')),
  nonEmptyString(body('notes')),
  isDate(body('notifyDate')).optional(),
  nonEmptyString(body('assigneeUserId')).optional(),
  validateInputs,
  FinanceController.editSponsorTask
);

financeRouter.post(
  '/sponsor/:sponsorId/sponsorTasks',
  isDate(body('dueDate')),
  nonEmptyString(body('notes')),
  isOptionalDate(body('notifyDate')),
  nonEmptyString(body('assigneeId').optional()),
  validateInputs,
  FinanceController.createSponsorTask
);

financeRouter.get('/reimbursement-request-project-data/:projectId', FinanceController.getReimbursementRequestProjectData);

financeRouter.get('/reimbursement-request-team-data/:teamId', FinanceController.getReimbursementRequestTeamData);

financeRouter.get('/reimbursement-request-data', FinanceController.getAllReimbursementRequestData);

financeRouter.get(
  '/reimbursement-request-category-data/:otherReasonId',
  FinanceController.getReimbursementRequestCategoryData
);

financeRouter.get(
  '/reimbursement-request-team-type-data/:teamTypeId',
  FinanceController.getReimbursementRequestTeamTypeData
);

financeRouter.get('/spending-bar-team-data/:teamId', FinanceController.getSpendingBarTeamData);

financeRouter.get('/spending-bar-team-type-data/:teamTypeId', FinanceController.getSpendingBarTeamTypeData);

financeRouter.get('/spending-bar-data', FinanceController.getAllSpendingBarData);

financeRouter.get('/spending-bar-category-data/', FinanceController.getSpendingBarCategoryData);

export default financeRouter;
