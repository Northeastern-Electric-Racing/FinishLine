import express from 'express';
import RulesController from '../controllers/rules.controllers';

const rulesRouter = express.Router();

// write the routes below here
rulesRouter.post('/rule/:ruleId/delete', RulesController.deleteRule);
export default rulesRouter;
