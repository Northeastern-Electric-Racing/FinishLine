import { NextFunction, Request, Response } from 'express';
import ExecSummaryServices from '../services/exec-summaries.services.js';

export default class ExecSummaryController {
  static async getSingleExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { execSummaryId } = req.params as Record<string, string>;

      const summary = await ExecSummaryServices.getSingleExecutiveSummary(req.organization, execSummaryId, req.currentUser);
      res.status(200).json(summary);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createExecutiveSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { carId, seasonStartDate, seasonEndDate, goals, winsAndImprovements, budgetNotes, recruitmentNotes } = req.body;

      const executiveSummary = await ExecSummaryServices.createExecutiveSummary(
        req.currentUser,
        req.organization,
        carId,
        seasonStartDate ? new Date(seasonStartDate) : undefined,
        seasonEndDate ? new Date(seasonEndDate) : undefined,
        goals,
        winsAndImprovements,
        budgetNotes,
        recruitmentNotes
      );
      res.status(200).json(executiveSummary);
    } catch (error: unknown) {
      next(error);
    }
  }
}
