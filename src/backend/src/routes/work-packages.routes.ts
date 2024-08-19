import express from 'express';
import { body } from 'express-validator';
import WorkPackagesController from '../controllers/work-packages.controllers';
import {
  blockedByValidators,
  descriptionBulletsValidators,
  intMinZero,
  isDate,
  isWorkPackageStageOrNone,
  nonEmptyString,
  validateInputs
} from '../utils/validation.utils';
const workPackagesRouter = express.Router();

workPackagesRouter.get('/', WorkPackagesController.getAllWorkPackages);
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
workPackagesRouter.post(
  '/create',
  nonEmptyString(body('crId')),
  nonEmptyString(body('name')),
  isWorkPackageStageOrNone(body('stage')),
  isDate(body('startDate')),
  intMinZero(body('duration')),
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
  isDate(body('startDate')),
  intMinZero(body('duration')),
  isWorkPackageStageOrNone(body('stage')),
  ...blockedByValidators,
  ...descriptionBulletsValidators,
  nonEmptyString(body('leadId').optional()),
  nonEmptyString(body('managerId').optional()),
  validateInputs,
  WorkPackagesController.editWorkPackage
);
workPackagesRouter.delete(
  '/:wbsNum/delete',
  intMinZero(body('changeRequestIdentifier')),
  validateInputs,
  WorkPackagesController.deleteWorkPackage
);
workPackagesRouter.get('/:wbsNum/blocking', WorkPackagesController.getBlockingWorkPackages);
workPackagesRouter.post(
  '/slack-upcoming-deadlines',
  isDate(body('deadline')),
  validateInputs,
  WorkPackagesController.slackMessageUpcomingDeadlines
);

export default workPackagesRouter;
