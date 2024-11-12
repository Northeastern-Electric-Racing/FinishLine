import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import OnboardingController from '../controllers/onboarding.controller';

const onboardingRouter = express.Router();

/* User Checklists Section */
onboardingRouter.post(
  '/checklist/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('teamTypeId')).optional(),
  validateInputs,
  OnboardingController.createChecklist
);

onboardingRouter.post(
  '/checklist/item/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('checklistId')),
  nonEmptyString(body('description').optional()),
  nonEmptyString(body('parentChecklistItemId').optional()),
  validateInputs,
  OnboardingController.createChecklistItem
);

onboardingRouter.delete('/checklist/:checklistId/delete', OnboardingController.deleteChecklist);

onboardingRouter.delete('/checklist/item/:checklistItemId/delete', OnboardingController.deleteChecklistItem);

export default onboardingRouter;
