import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import OnboardingController from '../controllers/onboarding.controllers';

const onboardingRouter = express.Router();

/* Checklists Section */
onboardingRouter.get('/checklists', OnboardingController.getAllChecklists);

onboardingRouter.get('/checklists/checked', OnboardingController.getCheckedChecklists);

onboardingRouter.get('/checklists/usersChecklists', OnboardingController.getUsersChecklists);

onboardingRouter.post(
  '/checklist/create',
  nonEmptyString(body('name')),
  body('descriptions').isArray(),
  nonEmptyString(body('descriptions.*')),
  nonEmptyString(body('teamId').optional()),
  nonEmptyString(body('teamTypeId').optional()),
  nonEmptyString(body('parentChecklistId').optional()),
  body('isOptional').isBoolean().optional(),
  body('itemType').isIn(['TASK', 'INFO']).optional(),
  validateInputs,
  OnboardingController.createChecklist
);

onboardingRouter.post(
  '/checklist/edit/:checklistId',
  nonEmptyString(body('name')),
  body('descriptions').isArray(),
  nonEmptyString(body('descriptions.*')),
  nonEmptyString(body('teamId').optional()),
  nonEmptyString(body('teamTypeId').optional()),
  nonEmptyString(body('parentChecklistId').optional()),
  body('isOptional').isBoolean().optional(),
  body('itemType').isIn(['TASK', 'INFO']).optional(),
  validateInputs,
  OnboardingController.editChecklist
);

onboardingRouter.post('/checklist/delete/:checklistId', OnboardingController.deleteChecklist);

onboardingRouter.post('/checklists/:checklistId/toggle', OnboardingController.toggleChecklist);

onboardingRouter.post(
  '/tasks/reorder',
  body('taskIds').isArray(),
  nonEmptyString(body('taskIds.*')),
  validateInputs,
  OnboardingController.reorderTasks
);

onboardingRouter.post(
  '/tasks/:parentId/items/reorder',
  body('itemIds').isArray(),
  nonEmptyString(body('itemIds.*')),
  validateInputs,
  OnboardingController.reorderChecklistItems
);

onboardingRouter.get('/image/:fileId', OnboardingController.downloadImage);

export default onboardingRouter;
