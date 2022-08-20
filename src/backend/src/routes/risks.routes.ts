import express from 'express';
import { body } from 'express-validator';
import { createRisk, editRisk, getRisksForProject } from '../controllers/risks.controllers';

const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);
risksRouter.post(
  '/create',
  body('projectId').isInt().not().isString(),
  body('createdById').isInt().not().isString(),
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

export default risksRouter;
