import express from 'express';
import {
  descriptionBulletsValidators,
  intMinZero,
  isWorkPackageStageOrNone,
  nonEmptyString,
  validateInputs
} from '../utils/validation.utils';
import { body } from 'express-validator';
import WorkPackageTemplatesController from '../controllers/work-package-templates.controllers';

const workPackageTemplatesRouter = express.Router();

workPackageTemplatesRouter.get('/', WorkPackageTemplatesController.getAllWorkPackageTemplates);
workPackageTemplatesRouter.get('/:workPackageTemplateId', WorkPackageTemplatesController.getSingleWorkPackageTemplate);

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
  WorkPackageTemplatesController.editWorkPackageTemplate
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
  WorkPackageTemplatesController.createWorkPackageTemplate
);

workPackageTemplatesRouter.delete(
  '/:workPackageTemplateId/delete',
  WorkPackageTemplatesController.deleteWorkPackageTemplate
);

export default workPackageTemplatesRouter;
