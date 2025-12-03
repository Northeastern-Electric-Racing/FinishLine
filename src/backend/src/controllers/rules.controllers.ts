import { NextFunction, Request, Response } from 'express';
import RulesService from '../services/rules.services';
import { ProjectRule, Ruleset } from 'shared';
export default class RulesController {
  static async getActiveRuleset(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetTypeId } = req.params;
      const rulesetType = await RulesService.getActiveRuleset(req.currentUser, rulesetTypeId, req.organization);
      res.status(200).json(rulesetType);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  static async editRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const { ruleContent, ruleCode, imageFileIds, parentRuleId } = req.body;

      const rule = await RulesService.editRule(
        req.currentUser,
        ruleContent,
        ruleId,
        ruleCode,
        imageFileIds,
        req.organization,
        parentRuleId
      );
      res.status(200).json(rule);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllRulesetTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const rulesets = await RulesService.getAllRulesetTypes(req.organization);
      res.status(200).json(rulesets);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getRulesetsByRulesetType(req: Request, res: Response, next: NextFunction) {
    try {
      const rulesetTypeId = req.body;
      const rulesets = await RulesService.getRulesetsByRulesetType(rulesetTypeId, req.organization.organizationId);
      res.status(200).json(rulesets);
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

  static async deleteProjectRule(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectRuleId } = req.params;
      const deletedProjectRule = await RulesService.deleteProjectRule(projectRuleId, req.currentUser, req.organization);
      res.status(200).json(deletedProjectRule);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editProjectRuleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectRuleId } = req.params;
      const { newStatus } = req.body;

      const projectRule: ProjectRule = await RulesService.editProjectRuleStatus(
        req.currentUser,
        req.organization,
        projectRuleId,
        newStatus
      );

      res.status(200).json(projectRule);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async toggleRuleTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { ruleId } = req.params;
      const { teamId } = req.body;

      const changedRule = await RulesService.toggleRuleTeam(ruleId, teamId, req.currentUser, req.organization);

      res.status(200).json(changedRule);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createRuleset(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, rulesetTypeId, carNumber, active, fileId } = req.body;

      const ruleset = await RulesService.createRuleset(
        req.currentUser,
        req.organization,
        name,
        rulesetTypeId,
        carNumber,
        active,
        fileId
      );

      res.status(200).json(ruleset);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteRulesetType(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetTypeId } = req.params;

      const rulesetType = await RulesService.deleteRulesetType(req.currentUser, rulesetTypeId, req.organization);

      res.status(200).json(rulesetType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateRuleset(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetId } = req.params;
      const { name, isActive } = req.body;

      const ruleset: Ruleset = await RulesService.updateRuleset(
        req.currentUser,
        req.organization.organizationId,
        rulesetId,
        name,
        isActive
      );

      res.status(200).json(ruleset);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUnassignedRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetId } = req.params;
      const rules = await RulesService.getUnassignedRules(rulesetId, req.organization);
      res.status(200).json(rules);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUnassignedRulesForRuleset(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetId, teamId } = req.params;
      const rules = await RulesService.getUnassignedRulesForRuleset(rulesetId, teamId, req.organization.organizationId);
      res.status(200).json(rules);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getProjectRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetId, projectId } = req.params;

      const projectRules = await RulesService.getProjectRules(rulesetId, projectId, req.organization);

      res.status(200).json(projectRules);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getTopLevelRules(req: Request, res: Response, next: NextFunction) {
    try {
      const { rulesetId } = req.params;
      const rules = await RulesService.getTopLevelRules(rulesetId, req.organization.organizationId);
      res.status(200).json(rules);
    } catch (error: unknown) {
      next(error);
    }
  }
}
