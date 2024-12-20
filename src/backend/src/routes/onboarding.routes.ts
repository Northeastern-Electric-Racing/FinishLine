import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import OnboardingController from '../controllers/onboarding.controller';

const onboardingRouter = express.Router();

/* Checklists Section */
onboardingRouter.get('/checklists', OnboardingController.getAllChecklists);

onboardingRouter.get('/checklists/general', OnboardingController.getGeneralChecklists);

onboardingRouter.get('/checklists/checked', OnboardingController.getCheckedChecklists);

onboardingRouter.get('/checklists/usersChecklists', OnboardingController.getUsersChecklists);

onboardingRouter.post(
  '/checklist/create',
  nonEmptyString(body('name')),
  body('descriptions').isArray(),
  nonEmptyString(body('descriptions.*')),
  nonEmptyString(body('isOptional').isBoolean()),
  nonEmptyString(body('teamId').optional()),
  nonEmptyString(body('teamTypeId').optional()),
  nonEmptyString(body('parentChecklistId').optional()),
  validateInputs,
  OnboardingController.createChecklist
);

onboardingRouter.post(
  '/checklist/edit/:checklistId',
  nonEmptyString(body('name')),
  body('descriptions').isArray(),
  nonEmptyString(body('descriptions.*')),
  nonEmptyString(body('isOptional').isBoolean()),
  nonEmptyString(body('teamId').optional()),
  nonEmptyString(body('teamTypeId').optional()),
  nonEmptyString(body('parentChecklistId').optional()),
  validateInputs,
  OnboardingController.editChecklist
);

onboardingRouter.post('/checklist/delete/:checklistId', OnboardingController.deleteChecklist);

onboardingRouter.post('/checklists/item/:checklistId/checked', OnboardingController.toggleChecklist);

onboardingRouter.get('/image/:fileId', OnboardingController.downloadImage);

export default onboardingRouter;
