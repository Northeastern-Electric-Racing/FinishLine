import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';

export default class RulesController {
  static async createRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleCode, ruleContent, rulesetId, parentRuleId, referencedRules, imageFileIds } = req.body;

      const rule = await RulesService.createRule(
        req.currentUser,
        ruleCode,
        ruleContent,
        rulesetId,
        req.organization,
        parentRuleId,
        referencedRules || [],
        imageFileIds || []
      );

      res.status(201).json(rule);
    } catch (error: unknown) {
      next(error);
    }
  }
}
