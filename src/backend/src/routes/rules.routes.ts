import express from 'express';
import RulesController from '../controllers/rules.controllers';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const rulesRouter = express.Router();

rulesRouter.post('/rulesetType/create', nonEmptyString(body('name')), validateInputs, RulesController.createRulesetType);

export default rulesRouter;
