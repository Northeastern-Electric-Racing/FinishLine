import express from 'express';
import ExecSummaryController from '../controllers/exec-summaries.controllers.js';

const execSummaryRouter = express.Router();

execSummaryRouter.get('/:execSummaryId', ExecSummaryController.getSingleExecutiveSummary);

export default execSummaryRouter;
