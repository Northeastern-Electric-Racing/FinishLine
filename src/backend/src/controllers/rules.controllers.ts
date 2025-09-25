import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';

export default class RulesController {
  static async createRulesetType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      const rulesetType = await RulesService.createRulesetType(req.currentUser, name, req.organization);
      res.status(200).json(rulesetType);
    } catch (error: unknown) {
      next(error);
    }
  }
}
