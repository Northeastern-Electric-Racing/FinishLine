import express from 'express';
import { body } from 'express-validator';
import { createRisk, deleteRisk, editRisk, getRisksForProject } from '../controllers/risks.controllers';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);
risksRouter.post(
  '/create',
  intMinZero(body('projectId')),
  intMinZero(body('createdById')),
  nonEmptyString(body('detail')),
  createRisk
);
risksRouter.post(
  '/edit',
  intMinZero(body('userId')),
  nonEmptyString(body('id')),
  nonEmptyString(body('detail')),
  body('resolved').isBoolean(),
  editRisk
);
risksRouter.post('/delete', nonEmptyString(body('riskId')), intMinZero(body('deletedByUserId')), deleteRisk);

export default risksRouter;
