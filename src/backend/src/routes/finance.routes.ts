import express from 'express';
import {
  nonEmptyString,
  validateInputs,
  isDate,
  isOptionalDate,
  financeDashboardFilterValidators,
  intMinZero
} from '../utils/validation.utils.js';
import { body } from 'express-validator';
import FinanceController from '../controllers/finance.controllers.js';
import multer, { memoryStorage } from 'multer';
import { MAX_FILE_SIZE } from 'shared';

const financeRouter = express.Router();
const upload = multer({ limits: { fileSize: MAX_FILE_SIZE }, storage: memoryStorage() });

financeRouter.post(
  '/sponsor/create',
  upload.single('logoImage'),
  nonEmptyString(body('name')),
  body('activeStatus').isBoolean(),
  body('valueTypes').isArray(),
  nonEmptyString(body('valueTypes.*')),
  body('sponsorValue').isInt().optional(),
  isDate(body('joinDate')),
  body('activeYears').isArray(),
  intMinZero(body('activeYears.*')),
  nonEmptyString(body('sponsorTierId')).optional({ checkFalsy: true }),
  body('taxExempt').isBoolean(),
  nonEmptyString(body('contactName')),
  nonEmptyString(body('contactEmail')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPhone')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPosition')).optional({ checkFalsy: true }),
  body('sponsorTasks').isArray(),
  isDate(body('sponsorTasks.*.dueDate')),
  isDate(body('sponsorTasks.*.notifyDate')).optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorTasks.*.assigneeUserId')).optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorTasks.*.notes')),
  body('sponsorTasks.*.done').optional().isBoolean(),
  nonEmptyString(body('discountCode')).optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorNotes')).optional({ checkFalsy: true }),
  nonEmptyString(body('stockDescription')).optional({ checkFalsy: true }),
  nonEmptyString(body('discountDescription')).optional({ checkFalsy: true }),
  validateInputs,
  FinanceController.createSponsor
);

financeRouter.get('/sponsors', FinanceController.getAllSponsors);

financeRouter.get('/sponsor/:sponsorId/sponsorTasks', FinanceController.getSponsorTasks);

financeRouter.post('/sponsor/:sponsorId/delete', FinanceController.deleteSponsor);

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

financeRouter.post('/sponsorTask/:sponsorTaskId/delete', FinanceController.deleteSponsorTask);

financeRouter.post('/sponsorTask/:sponsorTaskId/toggle-done', FinanceController.toggleSponsorTaskDone);

financeRouter.post(
  '/sponsor/:sponsorId/sponsorTasks',
  isDate(body('dueDate')),
  nonEmptyString(body('notes')),
  isOptionalDate(body('notifyDate')),
  nonEmptyString(body('assigneeUserId').optional()),
  validateInputs,
  FinanceController.createSponsorTask
);

financeRouter.get(
  '/reimbursement-request-project-data/:projectId',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getReimbursementRequestProjectData
);

financeRouter.get(
  '/reimbursement-request-team-data/:teamId',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getReimbursementRequestTeamData
);

financeRouter.get(
  '/reimbursement-request-data',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getAllReimbursementRequestData
);

financeRouter.get(
  '/reimbursement-request-category-data/:otherReasonId',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getReimbursementRequestCategoryData
);

financeRouter.get(
  '/reimbursement-request-team-type-data/:teamTypeId',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getReimbursementRequestTeamTypeData
);

financeRouter.get(
  '/spending-bar-team-data/:teamId',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getSpendingBarTeamData
);

financeRouter.get(
  '/spending-bar-team-type-data/:teamTypeId',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getSpendingBarTeamTypeData
);

financeRouter.get(
  '/spending-bar-data',
  financeDashboardFilterValidators,
  validateInputs,
  FinanceController.getAllSpendingBarData
);

financeRouter.get('/spending-bar-category-data/', FinanceController.getSpendingBarCategoryData);

financeRouter.get('/sponsorTiers', FinanceController.getAllSponsorTiers);

financeRouter.post(
  '/sponsor/:sponsorId/edit',
  upload.single('logoImage'),
  nonEmptyString(body('name')),
  body('activeStatus').isBoolean(),
  body('valueTypes').isArray(),
  nonEmptyString(body('valueTypes.*')),
  body('sponsorValue').isInt().optional(),
  isDate(body('joinDate')),
  body('activeYears').isArray(),
  intMinZero(body('activeYears.*')),
  nonEmptyString(body('sponsorTierId')).optional({ checkFalsy: true }),
  body('taxExempt').isBoolean(),
  nonEmptyString(body('contactName')),
  nonEmptyString(body('contactEmail')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPhone')).optional({ checkFalsy: true }),
  nonEmptyString(body('contactPosition')).optional({ checkFalsy: true }),
  body('sponsorTasks').isArray(),
  nonEmptyString(body('sponsorTasks.*.sponsorTaskId')).optional({ checkFalsy: true }),
  isDate(body('sponsorTasks.*.dueDate')),
  isDate(body('sponsorTasks.*.notifyDate')).optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorTasks.*.assigneeUserId')).optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorTasks.*.notes')),
  body('sponsorTasks.*.done').optional().isBoolean(),
  body('discountCode').optional({ checkFalsy: true }),
  nonEmptyString(body('sponsorNotes')).optional({ checkFalsy: true }),
  nonEmptyString(body('stockDescription')).optional({ checkFalsy: true }),
  nonEmptyString(body('discountDescription')).optional({ checkFalsy: true }),
  validateInputs,
  FinanceController.editSponsor
);

financeRouter.delete('/sponsorTier/:sponsorTierId', FinanceController.deleteSponsorTier);

financeRouter.post(
  '/sponsorTier/:sponsorTierId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('colorHexCode')),
  intMinZero(body('minSupportValue')),
  validateInputs,
  FinanceController.editSponsorTier
);

export default financeRouter;
