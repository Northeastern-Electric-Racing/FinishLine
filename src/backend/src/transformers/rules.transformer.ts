import { Prisma } from '@prisma/client';
import { Rule, RuleCompletion, ProjectRule, Ruleset } from 'shared';
import { RuleQueryArgs, RulesetQueryArgs } from '../prisma-query-args/rules.query-args';
import { userTransformer } from './user.transformer';

export const ruleTransformer = (rule: Prisma.RuleGetPayload<RuleQueryArgs>): Rule => {
  return {
    ruleId: rule.ruleId,
    ruleCode: rule.ruleCode,
    ruleContent: rule.ruleContent,
    imageFileIds: rule.imageFileIds,
    ruleset: {
      rulesetId: rule.ruleset.rulesetId,
      name: rule.ruleset.name
    },
    parentRule: rule.parentRule
      ? {
          ruleId: rule.parentRule.ruleId,
          ruleCode: rule.parentRule.ruleCode
        }
      : undefined,
    subRuleIds: rule.subRules.map((subRule) => subRule.ruleId),
    referencedRules: rule.referencedRule.map((ref) => ({
      ruleId: ref.ruleId,
      ruleCode: ref.ruleCode
    })),
    referencedBy: rule.referencedBy.map((ref) => ({
      ruleId: ref.ruleId,
      ruleCode: ref.ruleCode
    })),
    projects: rule.projects.map((projectRule) => ({
      projectRuleId: projectRule.projectRuleId,
      ruleId: projectRule.ruleId,
      rule: projectRule.rule as any,
      projectId: projectRule.projectId,
      currentStatus: projectRule.currentStatus as RuleCompletion,
      statusHistory: projectRule.statusHistory.map((history) => ({
        historyId: history.historyId,
        projectRuleId: history.projectRuleId,
        userUpdated: userTransformer(history.userUpdated),
        updatedAt: history.updatedAt,
        newStatus: history.newStatus as RuleCompletion,
        note: history.note
      }))
    }))
  };
};

export const projectRuleTransformer = (projectRule: any): ProjectRule => {
  return {
    projectRuleId: projectRule.projectRuleId,
    rule: projectRule.rule,
    projectId: projectRule.projectId,
    currentStatus: projectRule.currentStatus,
    statusHistory: projectRule.statusHistory
  };
};

export const rulesetTransformer = (ruleset: Prisma.RulesetGetPayload<RulesetQueryArgs>): Ruleset => {
  const teamsPercentage = 0;

  return {
    fileId: ruleset.fileId,
    rulesetId: ruleset.rulesetId,
    name: ruleset.name,
    dateCreated: ruleset.dateCreated,
    active: ruleset.active,
    assignedPercentage: teamsPercentage,
    rulesetType: {
      ...ruleset.rulesetType,
      lastUpdated: ruleset.rulesetType.lastUpdated,
      revisionFiles: []
    },
    car: {
      carId: ruleset.car.carId,
      name: ruleset.car.wbsElementId
    }
  };
};
