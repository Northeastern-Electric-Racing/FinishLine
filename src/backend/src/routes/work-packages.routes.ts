import express from 'express';
import { body, param, query } from 'express-validator';
import WorkPackagesController from '../controllers/work-packages.controllers.js';
import {
  blockedByValidators,
  descriptionBulletsValidators,
  intMinZero,
  isDateOnly,
  isWorkPackageStageOrNone,
  nonEmptyString,
  validateInputs
} from '../utils/validation.utils.js';
import { WorkPackageSelection, WbsElementStatus } from 'shared';
const workPackagesRouter = express.Router();

workPackagesRouter.get('/', WorkPackagesController.getAllWorkPackages);
workPackagesRouter.get(
  '/all-preview',
  query('status').optional().isIn(Object.values(WbsElementStatus)),
  validateInputs,
  WorkPackagesController.getAllWorkPackagesPreview
);
workPackagesRouter.post(
  '/get-many',
  body('wbsNums').isArray(),
  intMinZero(body('wbsNums.*.carNumber')),
  intMinZero(body('wbsNums.*.projectNumber')),
  intMinZero(body('wbsNums.*.workPackageNumber')),
  validateInputs,
  WorkPackagesController.getManyWorkPackages
);
workPackagesRouter.get('/:wbsNum', WorkPackagesController.getSingleWorkPackage);

workPackagesRouter.get('/by-project/:wbsNum', WorkPackagesController.getWorkPackagesByProject);

workPackagesRouter.post(
  '/create',
  nonEmptyString(body('crId').optional()),
  nonEmptyString(body('name')),
  isWorkPackageStageOrNone(body('stage')),
  isDateOnly(body('startDate')),
  intMinZero(body('duration')),
  intMinZero(body('projectWbsNum.carNumber')),
  intMinZero(body('projectWbsNum.projectNumber')),
  intMinZero(body('projectWbsNum.workPackageNumber')),
  ...blockedByValidators,
  ...descriptionBulletsValidators,
  validateInputs,
  WorkPackagesController.createWorkPackage
);

workPackagesRouter.post(
  '/edit',
  nonEmptyString(body('workPackageId')),
  nonEmptyString(body('crId')),
  nonEmptyString(body('name')),
  isDateOnly(body('startDate')),
  intMinZero(body('duration')),
  isWorkPackageStageOrNone(body('stage')),
  ...blockedByValidators,
  ...descriptionBulletsValidators,
  nonEmptyString(body('leadId').optional()),
  nonEmptyString(body('managerId').optional()),
  validateInputs,
  WorkPackagesController.editWorkPackage
);
workPackagesRouter.delete('/:wbsNum/delete', WorkPackagesController.deleteWorkPackage);
workPackagesRouter.get('/:wbsNum/blocking', WorkPackagesController.getBlockingWorkPackages);
workPackagesRouter.post(
  '/slack-upcoming-deadlines',
  isDateOnly(body('deadline')),
  validateInputs,
  WorkPackagesController.slackMessageUpcomingDeadlines
);

workPackagesRouter.get(
  '/home-page/:selection',
  param('selection').isIn(Object.values(WorkPackageSelection)),
  validateInputs,
  WorkPackagesController.getHomePageWorkPackages
);

export default workPackagesRouter;
