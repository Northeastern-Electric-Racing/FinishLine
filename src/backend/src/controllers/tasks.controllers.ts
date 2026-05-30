import { NextFunction, Request, Response } from 'express';
import TasksService from '../services/tasks.services.js';
import { validateWBS, WbsNumber } from 'shared';

export default class TasksController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, deadline, startDate, priority, status, assignees, notes, labelIds } = req.body;
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
      const { title, notes, priority, deadline, startDate, wbsNum, labelIds } = req.body;
      const { taskId } = req.params as Record<string, string>;

      const updateTask = await TasksService.editTask(
        req.currentUser,
        req.organization.organizationId,
        taskId,
        title,
        notes,
        priority,
        labelIds,
        startDate ? new Date(startDate) : undefined,
        deadline ? new Date(deadline) : undefined,
        wbsNum
      );

      res.status(200).json(updateTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const { taskId } = req.params as Record<string, string>;

      const updatedTask = await TasksService.editTaskStatus(
        req.currentUser,
        req.organization.organizationId,
        taskId,
        status
      );

      res.status(200).json(updatedTask);
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

      const updatedTask = await TasksService.deleteTask(req.currentUser, taskId, req.organization);

      res.status(200).json(updatedTask);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getFilteredTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberIds, teamIds, startPeriod, endPeriod } = req.body;

      const tasks = await TasksService.getFilteredTasks(
        {
          memberIds,
          teamIds,
          startPeriod: new Date(startPeriod),
          endPeriod: new Date(endPeriod)
        },
        req.organization
      );

      res.status(200).json(tasks);
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

  static async getTasksByWbsNum(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum as string);
      const tasks = await TasksService.getTasksByWbsNum(wbsNum, req.organization);
      res.status(200).json(tasks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getTasksByWbsNumAndLabels(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum as string);
      const labelIds = req.query.labelIds ? String(req.query.labelIds).split(',') : [];
      const tasks = await TasksService.getTasksByWbsNumAndLabels(wbsNum, labelIds, req.organization);
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
      const label = await TasksService.createTaskLabel(req.currentUser, name, colorHexCode, req.organization);
      res.status(200).json(label);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTaskLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskLabelId } = req.params as Record<string, string>;
      const { name, colorHexCode } = req.body;
      const label = await TasksService.editTaskLabel(req.currentUser, taskLabelId, name, colorHexCode, req.organization);
      res.status(200).json(label);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTaskLabel(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskLabelId } = req.params as Record<string, string>;
      const deletedId = await TasksService.deleteTaskLabel(req.currentUser, taskLabelId, req.organization);
      res.status(200).json(deletedId);
    } catch (error: unknown) {
      next(error);
    }
  }
}
