import express from 'express';
import { body } from 'express-validator';
import WorkPackagesController from '../controllers/work-packages.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, isDate, isWorkPackageStage, isWorkPackageStageOrNone, nonEmptyString } from '../utils/validation.utils';
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
  '/template/create',
  nonEmptyString(body('templateName')),
  nonEmptyString(body('templateNotes')),
  nonEmptyString(body('workPackageName').optional()),
  isWorkPackageStageOrNone(body('stage').optional()),
  intMinZero(body('duration').optional()),
  body('expectedActivities').isArray(),
  nonEmptyString(body('expectedActivities.*')),
  body('deliverables').isArray(),
  nonEmptyString(body('deliverables.*')),
  body('blockedBy').isArray(),
  nonEmptyString(body('blockedByInfo.*.name')),
  isWorkPackageStageOrNone(body('blockedByInfo.*.stage').optional()),
  validateInputs,
  WorkPackagesController.createWorkPackageTemplate
);
workPackagesRouter.post(
  '/edit',
  intMinZero(body('workPackageId')),
  intMinZero(body('crId')),
  nonEmptyString(body('name')),
  isDate(body('startDate')),
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

workPackagesRouter.post(
  '/template/:workpackageTemplateId/edit',
  nonEmptyString(body('templateName')),
  nonEmptyString(body('templateNotes')),
  intMinZero(body('duration').optional()),
  isWorkPackageStageOrNone(body('stage')),
  body('blockedBy').isArray(),
  nonEmptyString(body('blockedBy.*.blockedByInfoId').optional()),
  isWorkPackageStage(body('blockedBy.*.stage').optional()),
  nonEmptyString(body('blockedBy.*.name')),
  body('expectedActivities').isArray(),
  body('deliverables').isArray(),
  nonEmptyString(body('workPackageName').optional()),
  validateInputs,
  WorkPackagesController.editWorkPackageTemplate
);

export default workPackagesRouter;
