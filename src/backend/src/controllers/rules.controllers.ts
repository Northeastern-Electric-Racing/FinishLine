import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';

export default class RulesController {
  // rules dashboard controller functions go here!

  static async deleteRulesetType(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetTypeId } = req.params;
      const message: { message: string } = await RulesService.deleteRulesetType(req.currentUser, rulesetTypeId);
      res.status(200).json(message);
    } catch (error: unknown) {
      next(error);
    }
  }
}
