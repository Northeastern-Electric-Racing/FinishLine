import express from 'express';
import { body } from 'express-validator';
import { createRisk, getRisksForProject } from '../controllers/risks.controllers';

const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);
risksRouter.post(
  '/create',
  body('projectId').isInt().not().isString(),
  body('createdById').isInt().not().isString(),
  body('detail').isString().not().isEmpty(),
  createRisk
);

export default risksRouter;
