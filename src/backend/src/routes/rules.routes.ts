import express from 'express';
import RulesController from '../controllers/rules.controllers';

import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const rulesRouter = express.Router();

rulesRouter.post('/rulesetType/create', nonEmptyString(body('name')), validateInputs, RulesController.createRulesetType);

rulesRouter.post('/rule/:ruleId/delete', RulesController.deleteRule);

rulesRouter.post(
  '/projectRule/create',
  nonEmptyString(body('ruleId')),
  nonEmptyString(body('projectId')),
  validateInputs,
  RulesController.createProjectRule
);

rulesRouter.post(
  '/rule/:ruleId/edit',
  nonEmptyString(body('ruleContent')),
  nonEmptyString(body('ruleCode')),
  body('imageFileIds').isArray(),
  nonEmptyString(body('imageFileIds.*')),
  nonEmptyString(body('parentRuleId')),
  validateInputs,
  RulesController.editRule
);

export default rulesRouter;
