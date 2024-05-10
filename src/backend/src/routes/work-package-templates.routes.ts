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

export default workPackageTemplatesRouter;
