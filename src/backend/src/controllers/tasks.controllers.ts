import { NextFunction, Request, Response } from 'express';
import TasksService from '../services/tasks.services';
import { validateWBS, WbsNumber } from 'shared';

export default class TasksController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, deadline, priority, status, assignees, notes } = req.body;
      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);

      const task = await TasksService.createTask(
        req.currentUser,
        wbsNum,
        title,
        notes,
        new Date(deadline),
        priority,
        status,
        assignees,
        req.organization
      );

      return res.status(200).json(task);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, notes, priority, deadline } = req.body;
      const { taskId } = req.params;

      const updateTask = await TasksService.editTask(req.currentUser, taskId, title, notes, priority, deadline);

      return res.status(200).json(updateTask);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const { taskId } = req.params;

      const updatedTask = await TasksService.editTaskStatus(req.currentUser, taskId, status);

      return res.status(200).json(updatedTask);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editTaskAssignees(req: Request, res: Response, next: NextFunction) {
    try {
      const { assignees } = req.body;
      const { taskId } = req.params;

      const updatedTask = await TasksService.editTaskAssignees(req.currentUser, taskId, assignees, req.organization);

      return res.status(200).json(updatedTask);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params;

      const updatedTask = await TasksService.deleteTask(req.currentUser, taskId, req.organization);

      return res.status(200).json(updatedTask);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
