import { NextFunction, Request, Response } from 'express';
import BayDashboardService from '../services/bay-dashboard.services.js';

export default class BayDashboardController {
  static async getBayDashboardOrganization(_req: Request, res: Response, next: NextFunction) {
    try {
      const organization = await BayDashboardService.getBayDashboardOrganization();
      res.status(200).json(organization);
    } catch (error: unknown) {
      next(error);
    }
  }
}
