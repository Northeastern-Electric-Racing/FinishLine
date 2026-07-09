import express from 'express';
import RulesController from '../controllers/rules.controllers.js';
import { nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import { body } from 'express-validator';
import { MAX_FILE_SIZE } from 'shared';
import multer, { memoryStorage } from 'multer';

const rulesRouter = express.Router();

rulesRouter.get('/rulesetType/:rulesetTypeId/active', RulesController.getActiveRuleset);
rulesRouter.get('/ruleset/:rulesetId', RulesController.getRulesetById);

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
rulesRouter.post(
  '/rule/:ruleId/edit',
  nonEmptyString(body('ruleContent')),
  body('ruleCode').optional().isString(),
  body('imageFileIds').optional().isArray(),
  body('imageFileIds.*').optional().isString(),
  body('parentRuleId').optional().isString(),
  validateInputs,
  RulesController.editRule
);
rulesRouter.post('/rule/:ruleId/delete', RulesController.deleteRule);

rulesRouter.post('/rulesetType/create', nonEmptyString(body('name')), validateInputs, RulesController.createRulesetType);

rulesRouter.post(
  '/projectRule/create',
  nonEmptyString(body('ruleId')),
  nonEmptyString(body('projectId')),
  validateInputs,
  RulesController.createProjectRule
);

rulesRouter.get('/rulesetTypes', RulesController.getAllRulesetTypes);
rulesRouter.get('/ruleset/:rulesetId/rules/unassigned', RulesController.getUnassignedRules);
rulesRouter.post('/ruleset/:rulesetId/delete', RulesController.deleteRuleset);
rulesRouter.post('/projectRule/:projectRuleId/delete', RulesController.deleteProjectRule);

rulesRouter.get('/rulesets/:rulesetTypeId', RulesController.getRulesetsByRulesetType);
rulesRouter.post(
  '/rule/:ruleId/setCompletion',
  body('isComplete').isBoolean(),
  body('projectId').optional().isString(),
  validateInputs,
  RulesController.setRuleCompletion
);

rulesRouter.post(
  '/rule/:ruleId/toggle-team',
  nonEmptyString(body('teamId')),
  validateInputs,
  RulesController.toggleRuleTeam
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
rulesRouter.get('/:rulesetTypeId/team/:teamId', RulesController.getTeamRulesInRulesetType);

rulesRouter.post(
  '/ruleset/:rulesetId/update',
  body('isActive').isBoolean(),
  nonEmptyString(body('name')),
  validateInputs,
  RulesController.updateRuleset
);
rulesRouter.get(
  '/ruleset/:rulesetId/project/:projectId/rules/unassigned',
  RulesController.getUnassignedRulesForProjectRuleset
);

rulesRouter.get('/ruleset/:rulesetId/project/:projectId/rules', RulesController.getProjectRules);

rulesRouter.get('/:ruleId/subrules', RulesController.getChildRules);
rulesRouter.get('/:rulesetId/parentRules', RulesController.getTopLevelRules);
rulesRouter.get('/ruleset/:rulesetId', RulesController.getSingleRuleset);
rulesRouter.get('/:rulesetTypeId', RulesController.getRulesetType);

rulesRouter.post(
  '/ruleset/:rulesetId/parse',
  nonEmptyString(body('fileId')),
  nonEmptyString(body('parserType')), // 'FSAE' or 'FHE'
  validateInputs,
  RulesController.parseRuleset
);

const upload = multer({ limits: { fileSize: MAX_FILE_SIZE }, storage: memoryStorage() });
rulesRouter.post('/upload/file', upload.single('file'), RulesController.uploadRulesetFile);

export default rulesRouter;
