import express from 'express';
import WorkPackagesController from '../controllers/work-packages.controllers';
import { intMinZero, isWorkPackageStage, isWorkPackageStageOrNone, nonEmptyString } from '../utils/validation.utils';
import { body } from 'express-validator';
import { validateInputs } from '../utils/utils';

const workPackageTemplatesRouter = express.Router();

workPackageTemplatesRouter.get('/', WorkPackagesController.getAllWorkPackageTemplates);
workPackageTemplatesRouter.get('/:workPackageTemplateId', WorkPackagesController.getSingleWorkPackageTemplate);

workPackageTemplatesRouter.post(
  '/:workpackageTemplateId/edit',
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

workPackageTemplatesRouter.post(
  '/create',
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

export default workPackageTemplatesRouter;
