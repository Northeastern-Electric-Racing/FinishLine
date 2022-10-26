import express from 'express';
import { body } from 'express-validator';
import {
  createRisk,
  deleteRisk,
  editRisk,
  getRisksForProject
} from '../controllers/risks.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);
risksRouter.post(
  '/create',
  intMinZero(body('projectId')),
  intMinZero(body('createdById')),
  nonEmptyString(body('detail')),
  validateInputs,
  createRisk
);
risksRouter.post(
  '/edit',
  intMinZero(body('userId')),
  nonEmptyString(body('id')),
  nonEmptyString(body('detail')),
  body('resolved').isBoolean(),
  validateInputs,
  editRisk
);
risksRouter.post(
  '/delete',
  nonEmptyString(body('riskId')),
  intMinZero(body('deletedByUserId')),
  validateInputs,
  deleteRisk
);

export default risksRouter;
