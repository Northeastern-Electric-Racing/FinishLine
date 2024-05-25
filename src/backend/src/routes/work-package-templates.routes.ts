import express from 'express';
import WorkPackagesController from '../controllers/work-packages.controllers';
import {
  descriptionBulletsValidators,
  intMinZero,
  isWorkPackageStageOrNone,
  nonEmptyString,
  validateInputs
} from '../utils/validation.utils';
import { body } from 'express-validator';

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
  nonEmptyString(body('blockedBy.*')),
  nonEmptyString(body('workPackageName').optional()),
  ...descriptionBulletsValidators,
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
  body('blockedBy').isArray(),
  nonEmptyString(body('blockedBy.*')),
  ...descriptionBulletsValidators,
  validateInputs,
  WorkPackagesController.createWorkPackageTemplate
);

export default workPackageTemplatesRouter;
