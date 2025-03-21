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
}
