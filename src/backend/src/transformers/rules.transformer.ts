import { Prisma } from '@prisma/client';
import { ProjectRule, Rule, Ruleset } from 'shared';
import { RuleQueryArgs, RulesetQueryArgs } from '../prisma-query-args/rules.query-args';

export const projectRuleTransformer = (projectRule: any): ProjectRule => {
  return {
    projectRuleId: projectRule.projectRuleId,
    rule: projectRule.rule,
    projectId: projectRule.projectId,
    currentStatus: projectRule.currentStatus,
    statusHistory: projectRule.statusHistory
  };
};

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
    projects: rule.projects.map((pr) => projectRuleTransformer(pr))
  };
};

export const rulesetTransformer = (ruleset: Prisma.RulesetGetPayload<RulesetQueryArgs>): Ruleset => {
  const rulesWithTeams = ruleset.rules.filter((rule) => rule._count.teams > 0).length;
  const totalRulesLength = ruleset.rules.length;
  const teamsPercentage = totalRulesLength > 0 ? (rulesWithTeams / totalRulesLength) * 100 : 0;

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
