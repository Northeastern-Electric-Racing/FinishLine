import express from 'express';
import { body } from 'express-validator';
import { createRisk, deleteRisk, editRisk, getRisksForProject } from '../controllers/risks.controllers';

const risksRouter = express.Router();

risksRouter.get('/:projectId', getRisksForProject);
risksRouter.post(
  '/create',
  body('projectId').isInt({ min: 0 }).not().isString(),
  body('createdById').isInt({ min: 0 }).not().isString(),
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
  body('deletedByUserId').isInt({ min: 0 }).not().isString(),
  deleteRisk
);

export default risksRouter;
