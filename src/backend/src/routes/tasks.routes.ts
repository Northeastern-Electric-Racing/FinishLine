import express from 'express';
import { body } from 'express-validator';
import TasksController from '../controllers/tasks.controllers';
import { nonEmptyString, isTaskPriority, isTaskStatus, validateInputs, isOptionalDate } from '../utils/validation.utils';

const tasksRouter = express.Router();

tasksRouter.post(
  '/:wbsNum',
  nonEmptyString(body('title')),
  isOptionalDate(body('deadline')),
  isOptionalDate(body('startDate')),
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
  isOptionalDate(body('deadline')),
  isOptionalDate(body('startDate')),
  isTaskPriority(body('priority')),
  TasksController.editTask
);

tasksRouter.post('/:taskId/edit-status', isTaskStatus(body('status')), TasksController.editTaskStatus);

tasksRouter.post(
  '/:taskId/edit-assignees',
  body('assignees').isArray(),
  nonEmptyString(body('assignees.*')),
  TasksController.editTaskAssignees
);

tasksRouter.post('/:taskId/delete', TasksController.deleteTask);

tasksRouter.get('/overdue-by-team-member/:userId', TasksController.getOverdueTasksByTeamLeadership);

export default tasksRouter;
