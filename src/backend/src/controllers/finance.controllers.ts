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

  static async deleteSponsor(req: Request, res: Response, next: NextFunction) {
    try {
      const { sponsorId } = req.params;
      const deletedSponsor = await FinanceServices.deleteSponsor(sponsorId, req.currentUser, req.organization);
      res.status(200).json(deletedSponsor);
    } catch (error: unknown) {
      next(error);
    }
  }
}
