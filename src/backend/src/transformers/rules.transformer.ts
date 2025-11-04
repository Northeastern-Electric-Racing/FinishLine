import { ProjectRule, Ruleset } from 'shared';
import { Prisma } from '@prisma/client';
import { RulesetQueryArgs } from '../prisma-query-args/rules.query-args';

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
