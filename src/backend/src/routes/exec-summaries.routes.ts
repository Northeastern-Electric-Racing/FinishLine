import express from 'express';
import { body } from 'express-validator';
import { isOptionalDateOnly, nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import ExecSummaryController from '../controllers/exec-summaries.controllers.js';

const execSummaryRouter = express.Router();

execSummaryRouter.get('/:execSummaryId', ExecSummaryController.getSingleExecutiveSummary);

execSummaryRouter.post(
  '/create',
  nonEmptyString(body('carId')),
  isOptionalDateOnly(body('seasonStartDate')),
  isOptionalDateOnly(body('seasonEndDate')),
  body('goals').isString().optional(),
  body('winsAndImprovements').isString().optional(),
  body('budgetNotes').isString().optional(),
  body('recruitmentNotes').isString().optional(),
  validateInputs,
  ExecSummaryController.createExecutiveSummary
);

export default execSummaryRouter;
