import express from 'express';
import { body } from 'express-validator';
import TasksController from '../controllers/tasks.controllers';
import { isTaskStatus, isTaskPriority } from '../utils/validation.utils';
import { validateInputs } from '../utils/utils';
import { nonEmptyString } from '../utils/validation.utils';

const tasksRouter = express.Router();

tasksRouter.post(
  '/:wbsNum',
  nonEmptyString(body('title')),
  nonEmptyString(body('notes')),
  body('deadline').isDate(),
  isTaskPriority(body('priority')),
  isTaskStatus(body('status')),
  body('assignees').isArray(),
  validateInputs,
  TasksController.createTask
);

export default tasksRouter;
