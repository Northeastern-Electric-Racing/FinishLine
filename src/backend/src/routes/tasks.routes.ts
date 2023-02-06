import express from 'express';
import { body } from 'express-validator';
import TasksController from '../controllers/tasks.controllers';
import { isTaskStatus, isTaskPriority } from '../utils/tasks.utils';
import { validateInputs } from '../utils/utils';
import { intMinZero } from '../utils/validation.utils';

const tasksRouter = express.Router();

tasksRouter.post(
  '/',
  intMinZero(body('wbsElementId')),
  body('title').isString(),
  body('notes').isString(),
  body('deadline').isDate(),
  isTaskPriority(body('priority')),
  isTaskStatus(body('status')),
  body('assignees').isArray(),
  validateInputs,
  TasksController.createTask
);

export default tasksRouter;
