import { NextFunction, Request, Response } from 'express';
import TasksService from '../services/tasks.services.js';
import { FilterTaskArgs, validateWBS, WbsNumber } from 'shared';

// the filter criteria in a (validated) filter request body, shared by the full and paginated filter endpoints
const filterTaskArgsOf = (body: Request['body']): FilterTaskArgs => {
  const {
    memberIds,
    teamIds,
    startPeriod,
    endPeriod,
    labelIds,
    wbsNum,
    carNumbers,
    projectWbsNums,
    workPackageWbsNums,
    search,
    andMemberTeam
  } = body;

  return {
    memberIds,
    teamIds,
    startPeriod: startPeriod ? new Date(startPeriod) : undefined,
    endPeriod: endPeriod ? new Date(endPeriod) : undefined,
    labelIds,
    wbsNum,
    carNumbers,
    projectWbsNums,
    workPackageWbsNums,
    search,
    andMemberTeam
  };
};

export default class TasksController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, deadline, startDate, priority, status, assignees, notes, labelIds, blockedByIds } = req.body;
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum as string);

      const task = await TasksService.createTask(
        req.currentUser,
        wbsNum,
        title,
        notes ?? '',
        priority,
        status,
        assignees,
        req.organization,
        labelIds,
        blockedByIds,
        startDate ? new Date(startDate) : undefined,
        deadline ? new Date(deadline) : undefined
      );

      res.status(200).json(task);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, notes, priority, deadline, startDate, wbsNum, labelIds, blockedByIds } = req.body;
      const { taskId } = req.params as Record<string, string>;

      await TasksService.editTask(
        req.currentUser,
        req.organization.organizationId,
        taskId,
        title,
        notes,
        priority,
        labelIds,
        blockedByIds,
        startDate ? new Date(startDate) : undefined,
        deadline ? new Date(deadline) : undefined,
        wbsNum
      );

      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const { taskId } = req.params as Record<string, string>;

      await TasksService.editTaskStatus(req.currentUser, req.organization.organizationId, taskId, status);

      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTaskAssignees(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignees } = req.body;
      const { taskId } = req.params as Record<string, string>;

      const updatedTask = await TasksService.editTaskAssignees(req.currentUser, taskId, assignees, req.organization);

      res.status(200).json(updatedTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params as Record<string, string>;

      await TasksService.deleteTask(req.currentUser, taskId, req.organization);

      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getFilteredTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await TasksService.getFilteredTasks(filterTaskArgsOf(req.body), req.organization);

      res.status(200).json(tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getFilteredTasksPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, offset } = req.body;

      const page = await TasksService.getFilteredTasksPage(filterTaskArgsOf(req.body), status, offset, req.organization);

      res.status(200).json(page);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getOverdueTasksByTeamLeadership(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params as Record<string, string>;

      const tasks = await TasksService.getOverdueTasksByTeamLeadership(userId, req.organization);
      res.status(200).json(tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllTaskLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const labels = await TasksService.getAllTaskLabels(req.organization);
      res.status(200).json(labels);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createTaskLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, colorHexCode } = req.body;
      await TasksService.createTaskLabel(req.currentUser, name, colorHexCode, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTaskLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskLabelId } = req.params as Record<string, string>;
      const { name, colorHexCode } = req.body;
      await TasksService.editTaskLabel(req.currentUser, taskLabelId, name, colorHexCode, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTaskLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskLabelId } = req.params as Record<string, string>;
      await TasksService.deleteTaskLabel(req.currentUser, taskLabelId, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }
}
