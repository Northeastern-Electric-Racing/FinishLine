import { NextFunction, Request, Response } from 'express';
import { getRoleInOrganization } from '../utils/mcp-auth.utils.js';
import McpService from '../services/mcp.services.js';

export default class AgentController {
  /**
   * Confirms an API token is valid and reports who it resolved to. This is deliberately verbose
   * about identity so a client can verify the whole token -> user -> organization -> role chain.
   */
  static async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentUser, organization } = req;
      const role = await getRoleInOrganization(currentUser.userId, organization.organizationId);

      res.status(200).json({
        status: 'healthy',
        user: {
          userId: currentUser.userId,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email
        },
        organization: {
          organizationId: organization.organizationId,
          name: organization.name
        },
        role
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { carNumber, offset } = req.query as Record<string, string | undefined>;
      const projects = await McpService.getProjects(req.organization, carNumber, offset ? Number(offset) : undefined);

      res.status(200).json(projects);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum } = req.params as Record<string, string>;
      const project = await McpService.getProject(wbsNum, req.organization);

      res.status(200).json(project);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum } = req.params as Record<string, string>;
      const workPackages = await McpService.getWorkPackages(wbsNum, req.organization);

      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum } = req.params as Record<string, string>;
      const { offset } = req.query as Record<string, string | undefined>;
      const tasks = await McpService.getTasks(wbsNum, req.organization, offset ? Number(offset) : undefined);

      res.status(200).json(tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as Record<string, string>;
      const events = await McpService.getEvents(new Date(startDate), new Date(endDate), req.organization);

      res.status(200).json(events);
    } catch (error: unknown) {
      next(error);
    }
  }
}
