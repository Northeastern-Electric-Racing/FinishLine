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
        seasonStartDate ? new Date(seasonStartDate) : null,
        seasonEndDate ? new Date(seasonEndDate) : null,
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

  static async getAllExecutiveSummaries(req: Request, res: Response, next: NextFunction) {
    try {
      const summaries = await ExecSummaryServices.getAllExecutiveSummaries(req.organization, req.currentUser);
      res.status(200).json(summaries);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getVehicleDevelopmentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { execSummaryId } = req.params as Record<string, string>;
      const { teamId } = req.query as Record<string, string | undefined>;

      const summary = await ExecSummaryServices.getVehicleDevelopmentSummary(
        req.organization,
        execSummaryId,
        req.currentUser,
        teamId
      );
      res.status(200).json(summary);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getBudgetSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { execSummaryId } = req.params as Record<string, string>;

      const summary = await ExecSummaryServices.getBudgetSummary(req.organization, execSummaryId, req.currentUser);
      res.status(200).json(summary);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editCompetitionPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { competitionPerformanceId } = req.params as Record<string, string>;
      const {
        finalPlace,
        totalPointsEarned,
        maxPoints,
        bestStaticEvent,
        worstStaticEvent,
        bestDynamicEvent,
        worstDynamicEvent,
        accelerationTopTimeSeconds,
        autocrossTopTimeSeconds,
        enduranceLapsCompleted,
        maxLaps,
        enduranceAvgLapTimeSeconds
      } = req.body;

       const competitionPerformance = await ExecSummaryServices.editCompetitionPerformance(
        req.currentUser,
        req.organization,
        finalPlace ?? null,
        totalPointsEarned ?? null,
        maxPoints ?? null,
        bestStaticEvent ?? null,
        worstStaticEvent ?? null,
        bestDynamicEvent ?? null,
        worstDynamicEvent ?? null,
        accelerationTopTimeSeconds ?? null,
        autocrossTopTimeSeconds ?? null,
        enduranceLapsCompleted ?? null,
        maxLaps ?? null,
        enduranceAvgLapTimeSeconds ?? null,
        competitionPerformanceId
      );
      res.status(200).json(competitionPerformance);
    } catch (error: unknown) {
      next(error);
    }
  }
}
