import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import OnboardingController from '../controllers/onboarding.controller';

const onboardingRouter = express.Router();

/* User Checklists Section */
onboardingRouter.get('/checklist/', OnboardingController.getAllChecklists);

onboardingRouter.post(
  '/checklist/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('teamTypeId')),
  validateInputs,
  OnboardingController.createChecklist
);

onboardingRouter.delete('/checklist/:checklistId/delete', OnboardingController.deleteChecklist);

export default onboardingRouter;
