/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import { body, query } from 'express-validator';
import { isOptionalDate, validateInputs } from '../utils/validation.utils.js';
import ExecSummaryController from '../controllers/exec-summaries.controllers.js';

const execSummaryRouter = express.Router();

execSummaryRouter.get('/', ExecSummaryController.getAllExecutiveSummaries);
execSummaryRouter.get('/:execSummaryId', ExecSummaryController.getSingleExecutiveSummary);
execSummaryRouter.get(
  '/:execSummaryId/vehicle-development',
  query('teamId').optional().isString(),
  validateInputs,
  ExecSummaryController.getVehicleDevelopmentSummary
);
execSummaryRouter.get('/:execSummaryId/budget', ExecSummaryController.getBudgetSummary);

execSummaryRouter.post(
  '/:executiveSummaryId/edit',
  body('goals').isString(),
  body('winsAndImprovements').isString(),
  body('budgetNotes').isString(),
  body('recruitmentNotes').isString(),
  isOptionalDate(body('seasonStartDate')),
  isOptionalDate(body('seasonEndDate')),
  validateInputs,
  ExecSummaryController.editExecutiveSummary
);

export default execSummaryRouter;
