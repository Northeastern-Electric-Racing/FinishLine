import express from 'express';
import { body } from 'express-validator';
import { validateInputs } from '../utils/utils';
import RisksController from '../controllers/risks.controllers';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
const risksRouter = express.Router();

risksRouter.get('/:projectId', RisksController.getRisksForProject);
risksRouter.post(
  '/create',
  intMinZero(body('projectId')),
  nonEmptyString(body('detail')),
  validateInputs,
  RisksController.createRisk
);
risksRouter.post(
  '/edit',
  intMinZero(body('userId')),
  nonEmptyString(body('id')),
  nonEmptyString(body('detail')),
  body('resolved').isBoolean(),
  validateInputs,
  RisksController.editRisk
);
risksRouter.post(
  '/delete',
  nonEmptyString(body('riskId')),
  intMinZero(body('deletedByUserId')),
  validateInputs,
  RisksController.deleteRisk
);

export default risksRouter;
