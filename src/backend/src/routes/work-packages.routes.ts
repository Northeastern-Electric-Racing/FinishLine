import express from 'express';
import { body } from 'express-validator';
import WorkPackagesController from '../controllers/work-packages.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, isDate, isWorkPackageStageOrNone, nonEmptyString } from '../utils/validation.utils';
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
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  isWorkPackageStageOrNone(body('stage')),
  isDate(body('startDate')),
  intMinZero(body('duration')),
  body('blockedBy').isArray(),
  intMinZero(body('blockedBy.*.carNumber')),
  intMinZero(body('blockedBy.*.projectNumber')),
  intMinZero(body('blockedBy.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  nonEmptyString(body('expectedActivities.*')),
  body('deliverables').isArray(),
  nonEmptyString(body('deliverables.*')),
  validateInputs,
  WorkPackagesController.createWorkPackage
);
workPackagesRouter.post(
  '/edit',
  intMinZero(body('workPackageId')),
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  body('startDate').isDate(),
  intMinZero(body('duration')),
  isWorkPackageStageOrNone(body('stage')),
  intMinZero(body('blockedBy.*.carNumber')),
  intMinZero(body('blockedBy.*.projectNumber')),
  intMinZero(body('blockedBy.*.workPackageNumber')),
  body('expectedActivities').isArray(),
  body('expectedActivities.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('expectedActivities.*.detail')),
  body('deliverables').isArray(),
  body('deliverables.*.id').isInt({ min: -1 }).not().isString(),
  nonEmptyString(body('deliverables.*.detail')),
  intMinZero(body('projectLeadId').optional()),
  intMinZero(body('projectManagerId').optional()),
  validateInputs,
  WorkPackagesController.editWorkPackage
);
workPackagesRouter.delete('/:wbsNum/delete', WorkPackagesController.deleteWorkPackage);
workPackagesRouter.get('/:wbsNum/blocking', WorkPackagesController.getBlockingWorkPackages);
workPackagesRouter.post(
  '/slack-upcoming-deadlines',
  isDate(body('deadline')),
  validateInputs,
  WorkPackagesController.slackMessageUpcomingDeadlines
);

workPackagesRouter.get('/template/:workPackageTemplateId', WorkPackagesController.getSingleWorkPackageTemplate);

export default workPackagesRouter;
