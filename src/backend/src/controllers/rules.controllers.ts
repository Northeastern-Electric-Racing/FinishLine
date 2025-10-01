import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';
import { ProjectRule } from 'shared';

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

  static async createProjectRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId, projectId } = req.body;
      const projectRule: ProjectRule = await RulesService.createProjectRule(
        req.currentUser,
        req.organization,
        ruleId,
        projectId
      );

      res.status(200).json(projectRule);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const { ruleContent } = req.body;

      const rule = await RulesService.editRule(req.currentUser, ruleContent, ruleId, req.organization);
      res.status(200).json(rule);
    } catch (error: unknown) {
      next(error);
    }
  }
}
