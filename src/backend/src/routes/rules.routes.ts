import express from 'express';
import RulesController from '../controllers/rules.controllers';

const partsRouter = express.Router();

// write the routes below here

partsRouter.delete('/rules/rulesetType/:rulesetTypeId/delete', RulesController.deleteRulesetType);
