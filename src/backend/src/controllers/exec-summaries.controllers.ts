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
}
