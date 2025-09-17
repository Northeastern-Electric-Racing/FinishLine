import express from 'express';
import RulesController from '../controllers/rules.controllers';
import { validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const rulesRouter = express.Router();

// write the routes below here
rulesRouter.post(
  '/projectRule/create',
  body('ruleId').isString(),
  body('projectId').isString(),
  validateInputs,
  RulesController.createProjectRule
);

export default rulesRouter;