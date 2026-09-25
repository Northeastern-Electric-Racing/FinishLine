/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import express from 'express';
import { body } from 'express-validator';
import { isDate, nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import ExecSummaryController from '../controllers/exec-summaries.controllers.js';

const execSummaryRouter = express.Router();

execSummaryRouter.get('/:execSummaryId', ExecSummaryController.getSingleExecutiveSummary);

execSummaryRouter.post(
  '/:executiveSummaryId/edit',
  body('goals').isString(),
  body('winsAndImprovements').isString(),
  body('budgetNotes').isString(),
  body('recruitmentNotes').isString(),
  isDate(body('seasonStartDate')),
  isDate(body('seasonEndDate')),
  validateInputs,
  ExecSummaryController.editExecutiveSummary
);

export default execSummaryRouter;
