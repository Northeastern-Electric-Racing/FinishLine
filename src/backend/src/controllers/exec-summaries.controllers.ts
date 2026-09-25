/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { NextFunction, Request, Response } from 'express';
import ExecSummaryServices from '../services/exec-summaries.services.js';

export default class ExecSummaryController {
  static async editExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { executiveSummaryId } = req.params as Record<string, string>;
      const { goals, winsAndImprovements, budgetNotes, recruitmentNotes, seasonStartDate, seasonEndDate } = req.body;

      const executiveSummary = await ExecSummaryServices.editExecutiveSummary(
        req.currentUser,
        req.organization,
        goals,
        winsAndImprovements,
        budgetNotes,
        recruitmentNotes,
        seasonStartDate,
        seasonEndDate,
        executiveSummaryId
      );
      res.status(200).json(executiveSummary);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { execSummaryId } = req.params as Record<string, string>;

      const summary = await ExecSummaryServices.getSingleExecutiveSummary(req.organization, execSummaryId, req.currentUser);
      res.status(200).json(summary);
    } catch (error: unknown) {
      next(error);
    }
  }
}
