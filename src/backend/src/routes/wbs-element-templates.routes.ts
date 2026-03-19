import express from 'express';
import {
  descriptionBulletsValidators,
  intMinZero,
  isWorkPackageStageOrNone,
  nonEmptyString,
  validateInputs
} from '../utils/validation.utils.js';
import { body } from 'express-validator';
import WbsElementTemplatesController from '../controllers/wbs-element-templates.controllers.js';

const wbsElementTemplatesRouter = express.Router();

wbsElementTemplatesRouter.get('/project', WbsElementTemplatesController.getAllProjectTemplates);
wbsElementTemplatesRouter.get('/', WbsElementTemplatesController.getAllWorkPackageTemplates);
wbsElementTemplatesRouter.get('/:workPackageTemplateId', WbsElementTemplatesController.getSingleWorkPackageTemplate);

wbsElementTemplatesRouter.post(
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
  WbsElementTemplatesController.editWorkPackageTemplate
);

wbsElementTemplatesRouter.post(
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
  WbsElementTemplatesController.createWorkPackageTemplate
);

wbsElementTemplatesRouter.delete('/:workPackageTemplateId/delete', WbsElementTemplatesController.deleteWorkPackageTemplate);

wbsElementTemplatesRouter.delete('/project/:projectTemplateId/delete', WbsElementTemplatesController.deleteProjectTemplate);

wbsElementTemplatesRouter.post(
  '/project/create',
  nonEmptyString(body('templateName')),
  nonEmptyString(body('templateNotes')),
  body('workPackageTemplates').isArray(),
  ...descriptionBulletsValidators,
  nonEmptyString(body('projectName')).optional(),
  body('budget').isNumeric().optional(),
  body('teams').isArray(),
  nonEmptyString(body('teams.*')),
  nonEmptyString(body('summary')).optional(),
  validateInputs,
  WbsElementTemplatesController.createProjectTemplate
);

wbsElementTemplatesRouter.get('/project/:projectTemplateId', WbsElementTemplatesController.getSingleProjectTemplate);

wbsElementTemplatesRouter.post(
  '/project/:projectTemplateId/edit',
  nonEmptyString(body('templateName')),
  nonEmptyString(body('templateNotes')),
  body('workPackageTemplates').isArray(),
  ...descriptionBulletsValidators,
  nonEmptyString(body('projectName')).optional(),
  body('budget').isNumeric().optional(),
  body('teams').isArray(),
  nonEmptyString(body('teams.*')),
  nonEmptyString(body('summary')).optional(),
  validateInputs,
  WbsElementTemplatesController.editProjectTemplate
);

export default wbsElementTemplatesRouter;
