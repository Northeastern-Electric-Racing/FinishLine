import express from 'express';
import RulesController from '../controllers/rules.controllers';

const rulesRouter = express.Router();

// write the routes below here

rulesRouter.delete('/rules/rulesetType/:rulesetTypeId/delete', RulesController.deleteRulesetType);

export default rulesRouter;
