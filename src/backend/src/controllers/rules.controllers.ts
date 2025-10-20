import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';
import { ProjectRule } from 'shared';
export default class RulesController {
  static async deleteRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const deletedRule = await RulesService.deleteRule(ruleId, req.currentUser, req.organization);
      res.status(200).json(deletedRule);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  static async deleteRulesetType(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetTypeId } = req.params;
      const message: { message: string } = await RulesService.deleteRulesetType(
        req.currentUser,
        rulesetTypeId,
        req.organization
      );
      res.status(200).json(message);
    } catch (error: unknown) {
      next(error);
    }
  }
}
