import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import OnboardingController from '../controllers/onboarding.controller';

const onboardingRouter = express.Router();

/* User Checklists Section */
onboardingRouter.post(
  '/checklist/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('teamTypeId')),
  validateInputs,
  OnboardingController.createChecklist
);

onboardingRouter.post(
  '/checklist/:userId/update',
  body('checklistId').isArray(),
  nonEmptyString(body('checklistId.*')),
  validateInputs,
  OnboardingController.updateUserChecklists
);

export default onboardingRouter;
