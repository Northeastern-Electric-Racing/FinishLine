import { NextFunction, Request, Response } from 'express';
import BayDashboardAdminService from '../services/bay-dashboard-admin.services.js';

export default class BayDashboardAdminController {
  static async getCurrentBayDashboardConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentUser, organization } = req;

      const config = await BayDashboardAdminService.getCurrentBayDashboardConfig(currentUser, organization);
      res.status(200).json(config);
    } catch (error: unknown) {
      next(error);
    }
  }
}
