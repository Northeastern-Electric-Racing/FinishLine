import express from 'express';
import RulesController from '../controllers/rules.controllers';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const rulesRouter = express.Router();

rulesRouter.post(
  '/rule/create',
  nonEmptyString(body('ruleCode')),
  nonEmptyString(body('ruleContent')),
  nonEmptyString(body('rulesetId')),
  body('parentRuleId').optional().isString(),
  body('referencedRules').optional().isArray(),
  body('referencedRules.*').optional().isString(),
  body('imageFileIds').optional().isArray(),
  body('imageFileIds.*').optional().isString(),
  validateInputs,
  RulesController.createRule
);

rulesRouter.post('/rulesetType/create', nonEmptyString(body('name')), validateInputs, RulesController.createRulesetType);

rulesRouter.post('/rule/:ruleId/delete', RulesController.deleteRule);

rulesRouter.post(
  '/projectRule/create',
  nonEmptyString(body('ruleId')),
  nonEmptyString(body('projectId')),
  validateInputs,
  RulesController.createProjectRule
);

rulesRouter.get('/rulesetTypes', RulesController.getAllRulesetTypes);
rulesRouter.post('/ruleset/:rulesetId/delete', RulesController.deleteRuleset);

rulesRouter.get('/rulesets/:rulesetTypeId', RulesController.getRulesetsByRulesetType);
rulesRouter.post(
  '/projectRule/:projectRuleId/editStatus',
  nonEmptyString(body('newStatus')),
  validateInputs,
  RulesController.editProjectRuleStatus
);

rulesRouter.post(
  '/ruleset/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('rulesetTypeId')),
  body('carNumber').isInt(),
  body('active').isBoolean(),
  nonEmptyString(body('fileId')),
  validateInputs,
  RulesController.createRuleset
);
rulesRouter.post('/rulesetType/:rulesetTypeId/delete', RulesController.deleteRulesetType);

export default rulesRouter;
