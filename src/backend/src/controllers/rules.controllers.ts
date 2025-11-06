import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';
import { ProjectRule } from 'shared';

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

  static async deleteRuleset(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetId } = req.params;
      const ruleset = await RulesService.deleteRuleset(rulesetId, req.currentUser.userId, req.organization.organizationId);
      res.status(200).json(ruleset);
    } catch (error: unknown) {
      next(error);
    }
  }
}
