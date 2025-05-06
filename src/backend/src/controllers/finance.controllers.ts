import { NextFunction, Request, Response } from 'express';
import FinanceServices from '../services/finance.services';

export default class FinanceController {
  static async createSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        activeStatus,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        vendorContact,
        sponsorTasks,
        discountCode
      } = req.body;

      const sponsor = await FinanceServices.createSponsor(
        req.currentUser,
        name,
        activeStatus,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        vendorContact,
        sponsorTasks,
        req.organization,
        discountCode
      );
      res.status(200).json(sponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllSponsors(req: Request, res: Response, next: NextFunction) {
    try {
      const allSponsors = await FinanceServices.getAllSponsors(req.organization);
      res.status(200).json(allSponsors);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSponsorTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorId } = req.params;
      const { organizationId } = req.organization;

      const sponsorTasks = await FinanceServices.getSponsorTasks(sponsorId, organizationId);
      res.status(200).json(sponsorTasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorId } = req.params;
      const deletedSponsor = await FinanceServices.deleteSponsor(sponsorId, req.currentUser, req.organization);
      res.status(200).json(deletedSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editSponsorTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorTaskId } = req.params;
      const { dueDate, notes, notifyDate, assigneeUserId } = req.body;

      const updatedSponsorTask = await FinanceServices.editSponsorTask(
        req.currentUser,
        req.organization,
        sponsorTaskId,
        dueDate,
        notes,
        notifyDate,
        assigneeUserId
      );
      res.status(200).json(updatedSponsorTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createSponsorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, colorHexCode } = req.body;

      const sponsor = await FinanceServices.createSponsorTier(req.currentUser, name, req.organization, colorHexCode);
      res.status(200).json(sponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createSponsorTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { dueDate, notes, notifyDate, assigneeId } = req.body;
      const { sponsorId } = req.params;

      const sponsorTask = await FinanceServices.createSponsorTask(
        req.currentUser,
        req.organization,
        dueDate,
        notes,
        sponsorId,
        notifyDate,
        assigneeId
      );
      res.status(200).json(sponsorTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestProjectData(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestProjectData(
        req.organization,
        projectId,
        parsedStartDate,
        parsedEndDate
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestTeamData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestTeamData(
        req.organization,
        teamId,
        parsedStartDate,
        parsedEndDate
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestTeamTypeData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestTeamTypeData(
        req.organization,
        teamTypeId,
        parsedStartDate,
        parsedEndDate
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSpendingBarTeamData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const spendingBarData = await FinanceServices.getSpendingBarTeamData(
        req.organization,
        teamId,
        parsedStartDate,
        parsedEndDate
      );
      res.status(200).json(spendingBarData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSpendingBarTeamTypeData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const spendingBarData = await FinanceServices.getSpendingBarTeamTypeData(
        req.organization,
        teamTypeId,
        parsedStartDate,
        parsedEndDate
      );
      res.status(200).json(spendingBarData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllReimbursementRequestData(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const rrData = await FinanceServices.getAllReimbursementRequestData(req.organization, parsedStartDate, parsedEndDate);
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestCategoryData(req: Request, res: Response, next: NextFunction) {
    try {
      const { otherReasonId } = req.params;
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestCategoryData(
        otherReasonId,
        req.organization,
        parsedStartDate,
        parsedEndDate
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllSpendingBarData(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;

      const spendingBarData = await FinanceServices.getAllSpendingBarData(req.organization, parsedStartDate, parsedEndDate);
      res.status(200).json(spendingBarData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSpendingBarCategoryData(req: Request, res: Response, next: NextFunction) {
    try {
      const spendingBarData = await FinanceServices.getSpendingBarCategoryData(req.organization);
      res.status(200).json(spendingBarData);
    } catch (error: unknown) {
      next(error);
    }
  }
}
