import express from 'express';
import RulesController from '../controllers/rules.controllers';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const rulesRouter = express.Router();

rulesRouter.post('/rulesetType/create', nonEmptyString(body('name')), validateInputs, RulesController.createRulesetType);

rulesRouter.post(
  '/projectRule/create',
  nonEmptyString(body('ruleId')),
  nonEmptyString(body('projectId')),
  validateInputs,
  RulesController.createProjectRule
);

rulesRouter.post('/rulesetType/:rulesetTypeId/delete', RulesController.deleteRulesetType);

export default rulesRouter;
