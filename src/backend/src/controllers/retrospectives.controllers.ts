import { NextFunction, Request, Response } from 'express';
import RetrospectiveService from '../services/retrospective.services';

export default class RetrospectiveController {
  static async getRetrospectiveTimelines(req: Request, res: Response, next: NextFunction) {
    try {
      const { start, end } = req.query;
      const projects = await RetrospectiveService.getRetrospectiveTimelines(
        req.organization.organizationId,
        start ? new Date(start as string) : undefined,
        end ? new Date(end as string) : undefined
      );
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  static async getRetrospectiveBudgets(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await RetrospectiveService.getRetrospectiveBudgets(req.organization.organizationId);
      res.json(projects);
    } catch (error) {
      next(error);
    }
  }
}
