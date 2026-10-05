import { NextFunction, Request, Response } from 'express';
import { BayDashboardSlotInput } from 'shared';
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

  /**
   * Saves a new bay dashboard config for the current user's organization, replacing the one the TV is showing.
   */
  static async saveBayDashboardConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { slots } = req.body as { slots: BayDashboardSlotInput[] };
      const { currentUser, organization } = req;

      const config = await BayDashboardAdminService.saveBayDashboardConfig(currentUser, organization, slots);
      res.status(201).json(config);
    } catch (error: unknown) {
      next(error);
    }
  }
}
