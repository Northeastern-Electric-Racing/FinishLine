import express from 'express';
import { body } from 'express-validator';
import {
  createRisk,
  deleteRisk,
  editRisk,
  getRisksForProject
} from '../controllers/risks.controllers';
import intMinZero from 'validate.utils';
const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);
risksRouter.post(
  '/create',
  intMinZero(body('projectId')),
  intMinZero(body('createdById')),
  body('detail').isString().not().isEmpty(),
  createRisk
);
risksRouter.post(
  '/edit',
  body('userId').isInt().not().isString(),
  body('id').isString().not().isEmpty(),
  body('detail').isString().not().isEmpty(),
  body('resolved').isBoolean(),
  editRisk
);
risksRouter.post(
  '/delete',
  body('riskId').isString().not().isEmpty(),
  intMinZero(body('deletedByUserId')),
  deleteRisk
);

export default risksRouter;
