import express from 'express';
import { body } from 'express-validator';
import TasksController from '../controllers/tasks.controllers.js';
import {
  nonEmptyString,
  isTaskPriority,
  isTaskStatus,
  validateInputs,
  isOptionalDateOnly,
  intMinZero
} from '../utils/validation.utils.js';
import { isDate } from '../utils/validation.utils.js';

const tasksRouter = express.Router();

tasksRouter.post(
  '/filter',
  isDate(body('startPeriod').optional()),
  isDate(body('endPeriod').optional()),
  body('memberIds').optional().isArray(),
  body('memberIds.*').optional().isString(),
  body('teamIds').optional().isArray(),
  body('teamIds.*').optional().isString(),
  body('labelIds').optional().isArray(),
  body('labelIds.*').optional().isString(),
  intMinZero(body('wbsNum.carNumber').optional()),
  intMinZero(body('wbsNum.projectNumber').optional()),
  intMinZero(body('wbsNum.workPackageNumber').optional()),
  body('carNumbers').optional().isArray(),
  intMinZero(body('carNumbers.*').optional()),
  body('projectWbsNums').optional().isArray(),
  intMinZero(body('projectWbsNums.*.carNumber').optional()),
  intMinZero(body('projectWbsNums.*.projectNumber').optional()),
  intMinZero(body('projectWbsNums.*.workPackageNumber').optional()),
  body('workPackageWbsNums').optional().isArray(),
  intMinZero(body('workPackageWbsNums.*.carNumber').optional()),
  intMinZero(body('workPackageWbsNums.*.projectNumber').optional()),
  intMinZero(body('workPackageWbsNums.*.workPackageNumber').optional()),
  body('search').optional().isString(),
  body('andMemberTeam').optional().isBoolean(),
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
  body('labelIds').isArray(),
  body('labelIds.*').isString(),
  body('blockedByIds').isArray(),
  body('blockedByIds.*').isString(),
  validateInputs,
  TasksController.createTask
);

tasksRouter.post(
  '/:taskId/edit',
  nonEmptyString(body('title')),
  body('notes').isString(),
  isOptionalDateOnly(body('deadline')),
  isOptionalDateOnly(body('startDate')),
  isTaskPriority(body('priority')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('labelIds').isArray(),
  body('labelIds.*').isString(),
  body('blockedByIds').isArray(),
  body('blockedByIds.*').isString(),
  validateInputs,
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

tasksRouter.get('/task-labels', TasksController.getAllTaskLabels);

tasksRouter.post(
  '/task-labels/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  TasksController.createTaskLabel
);

tasksRouter.post(
  '/task-labels/:taskLabelId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  TasksController.editTaskLabel
);

tasksRouter.post('/task-labels/:taskLabelId/delete', TasksController.deleteTaskLabel);

export default tasksRouter;
