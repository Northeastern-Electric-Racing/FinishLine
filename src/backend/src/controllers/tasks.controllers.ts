import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import TasksService from '../services/tasks.services';

export default class TasksController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsElementId, title, notes, deadline, priority, status, assignees } = req.body;

      const createdBy = await getCurrentUser(res);

      const task = await TasksService.createTask(
        createdBy,
        wbsElementId,
        title,
        notes,
        deadline,
        priority,
        status,
        assignees
      );

      res.status(200).json(task);
    } catch (error: unknown) {
      next(error);
    }
  }
}
