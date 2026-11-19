import { NextFunction, Request, Response } from 'express';
import { getRoleInOrganization } from '../utils/mcp-auth.utils.js';
import ProjectsService from '../services/projects.services.js';
import WorkPackagesService from '../services/work-packages.services.js';
import TasksService from '../services/tasks.services.js';
import CalendarService from '../services/calendar.services.js';
import { paginate, parseEventRange, parseProjectWbsNum, resolveCar } from '../utils/agent.utils.js';
import SlackServices from '../services/slack.services.js';

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
      const car = await resolveCar(req.organization, carNumber ? Number(carNumber) : undefined);
      const projects = await ProjectsService.getAllProjects(req.organization, car.carId);
      const { items, ...page } = paginate(projects, offset ? Number(offset) : undefined);

      res.status(200).json({ carNumber: car.carNumber, projects: items, ...page });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum } = req.params as Record<string, string>;
      const project = await ProjectsService.getSingleProject(parseProjectWbsNum(wbsNum), req.currentUser, req.organization);

      res.status(200).json(project);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum } = req.params as Record<string, string>;
      const workPackages = await WorkPackagesService.getWorkPackagesByProject(parseProjectWbsNum(wbsNum), req.organization);

      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum } = req.params as Record<string, string>;
      const { offset } = req.query as Record<string, string | undefined>;
      const tasks = await TasksService.getFilteredTasks({ wbsNum: parseProjectWbsNum(wbsNum) }, req.organization);
      // the service does not order its results, and paging needs the same order on every call
      tasks.sort((a, b) => a.taskId.localeCompare(b.taskId));
      const { items, ...page } = paginate(tasks, offset ? Number(offset) : undefined);

      res.status(200).json({ tasks: items, ...page });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as Record<string, string>;
      const events = await CalendarService.getCalendarViewEvents(
        parseEventRange(new Date(startDate), new Date(endDate)),
        req.organization
      );

      res.status(200).json(events);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async sendSlackMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { channelId, message } = req.body;
      const sentMessage = await SlackServices.sendMessageToChannel(
        req.currentUser.userId,
        req.organization,
        channelId,
        message
      );

      res.status(200).json(sentMessage);
    } catch (error: unknown) {
      next(error);
    }
  }
}
