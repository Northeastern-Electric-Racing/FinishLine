import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';

export default class RulesController {
  // rules dashboard controller functions go here!
  static async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const deletedRule = await RulesService.deleteRule(ruleId, req.currentUser, req.organization);
      res.status(200).json(deletedRule);
    } catch (error: unknown) {
      next(error);
    }
  }
}
