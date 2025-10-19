import express from 'express';
import RulesController from '../controllers/rules.controllers';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';

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

export default rulesRouter;
