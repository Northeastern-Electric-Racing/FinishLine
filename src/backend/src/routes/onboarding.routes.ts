import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import OnboardingController from '../controllers/onboarding.controller';

const onboardingRouter = express.Router();

/* Checklists Section */
onboardingRouter.get('/checklists', OnboardingController.getAllChecklists);

onboardingRouter.get('/checklists/checked', OnboardingController.getCheckedChecklists);

onboardingRouter.get('/checklists/usersChecklists', OnboardingController.getUsersChecklists);

onboardingRouter.post(
  '/checklist/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('teamTypeId')).optional(),
  validateInputs,
  OnboardingController.createChecklist
);

onboardingRouter.delete('/checklist/:checklistId/delete', OnboardingController.deleteChecklist);

/* Checklist Items Section */
onboardingRouter.post(
  '/checklist/item/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('checklistId')),
  nonEmptyString(body('description').optional()),
  nonEmptyString(body('parentChecklistItemId').optional()),
  validateInputs,
  OnboardingController.createChecklistItem
);

onboardingRouter.post(
  '/checklist/item/:checklistItemId/update',
  nonEmptyString(body('name')),
  nonEmptyString(body('description').optional()),
  nonEmptyString(body('parentChecklistItemId').optional()),
  body('subtaskIds').isArray,
  nonEmptyString(body('subtaskIds.*')),
  validateInputs,
  OnboardingController.updateChecklistItem
);

onboardingRouter.delete('/checklist/item/:checklistItemId/delete', OnboardingController.deleteChecklistItem);

export default onboardingRouter;
