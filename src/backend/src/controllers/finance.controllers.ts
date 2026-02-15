import { NextFunction, Request, Response } from 'express';
import FinanceServices from '../services/finance.services.js';

export default class FinanceController {
  static async createSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        activeStatus,
        valueTypes,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        contactName,
        contactEmail,
        contactPhone,
        contactPosition,
        sponsorTasks,
        discountCode,
        sponsorNotes,
        stockDescription,
        discountDescription
      } = req.body;

      const sponsor = await FinanceServices.createSponsor(
        req.currentUser,
        name,
        activeStatus,
        valueTypes,
        joinDate,
        activeYears,
        sponsorTierId || undefined,
        taxExempt,
        contactName,
        sponsorTasks,
        req.organization,
        sponsorValue,
        discountCode,
        sponsorNotes,
        contactEmail,
        contactPhone,
        contactPosition,
        stockDescription,
        discountDescription
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
      const { sponsorId } = req.params as Record<string, string>;
      const { organizationId } = req.organization;

      const sponsorTasks = await FinanceServices.getSponsorTasks(sponsorId, organizationId);
      res.status(200).json(sponsorTasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorId } = req.params as Record<string, string>;
      const deletedSponsor = await FinanceServices.deleteSponsor(sponsorId, req.currentUser, req.organization);
      res.status(200).json(deletedSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editSponsorTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorTaskId } = req.params as Record<string, string>;
      const { dueDate, notes, notifyDate, assigneeUserId, done } = req.body;

      const updatedSponsorTask = await FinanceServices.editSponsorTask(
        req.currentUser,
        req.organization,
        sponsorTaskId,
        dueDate,
        notes,
        notifyDate,
        assigneeUserId,
        done
      );
      res.status(200).json(updatedSponsorTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteSponsorTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorTaskId } = req.params as Record<string, string>;
      const deleted = await FinanceServices.deleteSponsorTask(sponsorTaskId, req.currentUser, req.organization);
      res.status(200).json(deleted);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createSponsorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, colorHexCode, minSupportValue } = req.body;

      const sponsor = await FinanceServices.createSponsorTier(
        req.currentUser,
        name,
        req.organization,
        colorHexCode,
        minSupportValue
      );
      res.status(200).json(sponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createSponsorTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { dueDate, notes, notifyDate, assigneeUserId } = req.body;
      const { sponsorId } = req.params as Record<string, string>;

      const sponsorTask = await FinanceServices.createSponsorTask(
        req.currentUser,
        req.organization,
        dueDate,
        notes,
        sponsorId,
        notifyDate,
        assigneeUserId
      );
      res.status(200).json(sponsorTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestProjectData(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params as Record<string, string>;
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
      const { teamId } = req.params as Record<string, string>;
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestTeamData(
        req.organization,
        teamId,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestTeamTypeData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params as Record<string, string>;
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestTeamTypeData(
        req.organization,
        teamTypeId,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSpendingBarTeamData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params as Record<string, string>;
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const spendingBarData = await FinanceServices.getSpendingBarTeamData(
        req.organization,
        teamId,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
      res.status(200).json(spendingBarData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSpendingBarTeamTypeData(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params as Record<string, string>;
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const spendingBarData = await FinanceServices.getSpendingBarTeamTypeData(
        req.organization,
        teamTypeId,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
      res.status(200).json(spendingBarData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllReimbursementRequestData(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const rrData = await FinanceServices.getAllReimbursementRequestData(
        req.organization,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReimbursementRequestCategoryData(req: Request, res: Response, next: NextFunction) {
    try {
      const { otherReasonId } = req.params as Record<string, string>;
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const rrData = await FinanceServices.getReimbursementRequestCategoryData(
        otherReasonId,
        req.organization,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
      res.status(200).json(rrData);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllSpendingBarData(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, carNumber } = req.query;
      const parsedStartDate = typeof startDate === 'string' ? new Date(startDate) : undefined;
      const parsedEndDate = typeof endDate === 'string' ? new Date(endDate) : undefined;
      const parsedCarNumber = typeof carNumber === 'string' ? Number(carNumber) : undefined;

      const spendingBarData = await FinanceServices.getAllSpendingBarData(
        req.organization,
        parsedStartDate,
        parsedEndDate,
        parsedCarNumber
      );
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

  static async getAllSponsorTiers(req: Request, res: Response, next: NextFunction) {
    try {
      const allSponsors = await FinanceServices.getAllSponsorTiers(req.organization);
      res.status(200).json(allSponsors);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorId } = req.params as Record<string, string>;
      const {
        name,
        activeStatus,
        valueTypes,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        contactName,
        contactEmail,
        contactPhone,
        contactPosition,
        taxExempt,
        sponsorTasks,
        discountCode,
        sponsorNotes,
        stockDescription,
        discountDescription
      } = req.body;

      const updatedSponsor = await FinanceServices.editSponsor(
        req.currentUser,
        req.organization,
        sponsorId,
        name,
        activeStatus,
        valueTypes,
        joinDate,
        activeYears,
        sponsorTierId || undefined,
        contactName,
        taxExempt,
        sponsorTasks,
        sponsorValue,
        discountCode,
        sponsorNotes,
        contactEmail,
        contactPhone,
        contactPosition,
        stockDescription,
        discountDescription
      );

      res.status(200).json(updatedSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteSponsorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorTierId } = req.params as Record<string, string>;
      const deletedSponsorTier = await FinanceServices.deleteSponsorTier(sponsorTierId, req.currentUser, req.organization);
      res.status(200).json(deletedSponsorTier);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editSponsorTier(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorTierId } = req.params as Record<string, string>;
      const { name, colorHexCode, minSupportValue } = req.body;

      const updatedSponsorTier = await FinanceServices.editSponsorTier(
        req.currentUser,
        req.organization,
        sponsorTierId,
        name,
        colorHexCode,
        minSupportValue
      );
      res.status(200).json(updatedSponsorTier);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async toggleSponsorTaskDone(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorTaskId } = req.params as Record<string, string>;
      const updatedTask = await FinanceServices.toggleSponsorTaskDone(
        req.currentUser,
        req.organization,
        sponsorTaskId
      );
      res.status(200).json(updatedTask);
    } catch (error: unknown) {
      next(error);
    }
  }
}
