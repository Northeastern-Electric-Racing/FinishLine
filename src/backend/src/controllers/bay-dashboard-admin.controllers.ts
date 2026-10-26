import { NextFunction, Request, Response } from 'express';
import BayDashboardAdminService from '../services/bay-dashboard-admin.services.js';
import { broadcastBayDashboardUpdate } from '../utils/bay-dashboard-events.utils.js';

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
   * Returns every widget type available for a bay dashboard along with its display name and supported sizes.
   */
  static async getAvailableWidgets(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentUser, organization } = req;

      const widgets = await BayDashboardAdminService.getAvailableWidgets(currentUser, organization);
      res.status(200).json(widgets);
    } catch (error: unknown) {
      next(error);
    }
  }

  /**
   * Saves a new bay dashboard config for the current user's organization, replacing the one the TV is showing.
   */
  static async saveBayDashboardConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { slots } = req.body;
      const { currentUser, organization } = req;

      const config = await BayDashboardAdminService.saveBayDashboardConfig(currentUser, organization, slots);
      broadcastBayDashboardUpdate(organization.slug);
      res.status(201).json(config);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createBayDashboardCountdown(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, startDate, endDate } = req.body;
      const { currentUser, organization } = req;

      const countdown = await BayDashboardAdminService.createBayDashboardCountdown(
        currentUser,
        organization,
        name,
        new Date(startDate),
        endDate ? new Date(endDate) : undefined
      );
      res.status(201).json(countdown);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteBayDashboardCountdown(req: Request, res: Response, next: NextFunction) {
    try {
      const { countdownId } = req.params as Record<string, string>;
      const { currentUser, organization } = req;

      const countdown = await BayDashboardAdminService.deleteBayDashboardCountdown(currentUser, countdownId, organization);
      res.status(200).json(countdown);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editBayDashboardCountdown(req: Request, rest: Response, next: NextFunction) {
    try {
      const { countdownId } = req.params as Record<string, string>;
      const { currentUser, organization } = req;

      const countdown = await BayDashboardAdminService.editBayDashboardCountdown(
        currentUser, 
        countdownId, 
        organization, 
        name, 
        new Date(startDate), 
        endDate ? new Date(endDate) : undefined
      );
      res.status(200).json(countdown);
    } catch (error: unknown) {
      next(error);
    }
  }
}
