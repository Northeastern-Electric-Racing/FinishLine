import { ProjectRule, Ruleset } from 'shared';
import { Prisma } from '@prisma/client';
import { RulesetQueryArgs } from '../prisma-query-args/rules.query-args';
import { userTransformer } from './user.transformer';

// transformer functions go below here

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
  // calculating the percentage of rules with one or more teams in the ruleset
  const rulesWithTeams = ruleset.rules.filter((rule) => rule._count.teams > 0).length;
  const totalRulesLength = ruleset.rules.length;
  const assignedPercentage = totalRulesLength > 0 ? (rulesWithTeams / totalRulesLength) * 100 : 0;

  return {
    fileId: ruleset.fileId,
    rulesetId: ruleset.rulesetId,
    name: ruleset.name,
    dateCreated: ruleset.dateCreated,
    active: ruleset.active,
    rules: assignedPercentage,
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
