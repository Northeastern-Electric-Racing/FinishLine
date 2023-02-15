import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import TasksService from '../services/tasks.services';
import { validateWBS, WbsNumber } from 'shared';
import { User } from '@prisma/client';

export default class TasksController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, notes, deadline, priority, status, assignees } = req.body;

      const wbsNum: WbsNumber = validateWBS(req.params.wbsNum);

      const createdBy: User = await getCurrentUser(res);

      const task = await TasksService.createTask(createdBy, wbsNum, title, notes, deadline, priority, status, assignees);

      res.status(200).json(task);
    } catch (error: unknown) {
      next(error);
    }
  }
}
