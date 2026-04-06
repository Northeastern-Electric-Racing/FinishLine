import express from 'express';
import { body } from 'express-validator';
import TasksController from '../controllers/tasks.controllers.js';
import {
  nonEmptyString,
  isTaskPriority,
  isTaskStatus,
  validateInputs,
  isOptionalDateOnly
} from '../utils/validation.utils.js';
import { isDate } from '../utils/validation.utils.js';

const tasksRouter = express.Router();

tasksRouter.post(
  '/filter',
  isDate(body('startPeriod')),
  isDate(body('endPeriod')),
  body('memberIds').optional().isArray(),
  body('memberIds.*').optional().isString(),
  body('teamIds').optional().isArray(),
  body('teamIds.*').optional().isString(),
  validateInputs,
  TasksController.getFilteredTasks
);

tasksRouter.post(
  '/:wbsNum',
  nonEmptyString(body('title')),
  isOptionalDateOnly(body('deadline')),
  isOptionalDateOnly(body('startDate')),
  body('notes').isString(),
  isTaskPriority(body('priority')),
  isTaskStatus(body('status')),
  body('assignees').isArray(),
  nonEmptyString(body('assignees.*')),
  validateInputs,
  TasksController.createTask
);

tasksRouter.post(
  '/:taskId/edit',
  nonEmptyString(body('title')),
  nonEmptyString(body('notes')),
  isOptionalDateOnly(body('deadline')),
  isOptionalDateOnly(body('startDate')),
  isTaskPriority(body('priority')),
  nonEmptyString(body('wbsElementId').optional()),
  TasksController.editTask
);

tasksRouter.post('/:taskId/edit-status', isTaskStatus(body('status')), validateInputs, TasksController.editTaskStatus);

tasksRouter.post(
  '/:taskId/edit-assignees',
  body('assignees').isArray(),
  nonEmptyString(body('assignees.*')),
  validateInputs,
  TasksController.editTaskAssignees
);

tasksRouter.post('/:taskId/delete', validateInputs, TasksController.deleteTask);

tasksRouter.get('/overdue-by-team-member/:userId', TasksController.getOverdueTasksByTeamLeadership);

tasksRouter.get('/by-wbs/:wbsNum', TasksController.getTasksByWbsNum);

export default tasksRouter;
