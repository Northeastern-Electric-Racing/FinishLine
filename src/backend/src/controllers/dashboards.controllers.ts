import { NextFunction, Request, Response } from 'express';
import DashboardService from '../services/dashboards.services.js';

export default class DashboardsController {
  static async createDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, link } = req.body;
      const { currentUser, organization } = req;

      const dashboard = await DashboardService.createDashboard(currentUser, organization, name, link);
      res.status(200).json(dashboard);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserDashboards(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentUser, organization } = req;

      const dashboards = await DashboardService.getUserDashboards(currentUser, organization);
      res.status(200).json(dashboards);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { dashboardId } = req.params as Record<string, string>;
      const { link } = req.body;
      const { currentUser, organization } = req;

      const dashboard = await DashboardService.editDashboard(currentUser, organization, dashboardId, link);
      res.status(200).json(dashboard);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { dashboardId } = req.params as Record<string, string>;
      const { currentUser, organization } = req;

      const dashboard = await DashboardService.deleteDashboard(currentUser, organization, dashboardId);
      res.status(200).json(dashboard);
    } catch (error: unknown) {
      next(error);
    }
  }
}
