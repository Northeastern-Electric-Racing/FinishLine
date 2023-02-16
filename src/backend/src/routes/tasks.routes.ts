import express from 'express';
import { body } from 'express-validator';
import TasksController from '../controllers/tasks.controllers';
import { validateInputs } from '../utils/utils';
import { nonEmptyString, intMinZero, isTaskPriority, isTaskStatus } from '../utils/validation.utils';

const tasksRouter = express.Router();

tasksRouter.post(
  '/:wbsNum',
  nonEmptyString(body('title')),
  nonEmptyString(body('notes')),
  body('deadline').isDate(),
  isTaskPriority(body('priority')),
  isTaskStatus(body('status')),
  body('assignees').isArray(),
  intMinZero(body('assignees.*')),
  validateInputs,
  TasksController.createTask
);

export default tasksRouter;
