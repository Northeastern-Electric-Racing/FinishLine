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

  static async getSponsorTasks(req: Request, res: Response, next: NextFunction) {
    const { sponsorId } = req.body;
    const { organizationId } = req.organization;

    try {
      const sponsorTasks = await FinanceServices.getSponsorTasks(sponsorId, organizationId);
      res.status(200).json(sponsorTasks);
    } catch (error: unknown) {
      next(error);
    }
  }
}
