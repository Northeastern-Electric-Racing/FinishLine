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
  return {
    fileId: ruleset.fileId,
    rulesetId: ruleset.rulesetId,
    name: ruleset.name,
    dateCreated: ruleset.dateCreated,
    active: ruleset.active,
    rules: ruleset.rules.map((rule) => ({
      ...rule,
      ruleset: {
        rulesetId: ruleset.rulesetId,
        name: ruleset.name
      },
      subRuleIds: [],
      referencedRules: [],
      referencedBy: [],
      projects: []
    })),
    rulesetType: {
      ...ruleset.rulesetType,
      lastUpdated: new Date(),
      revisionFiles: []
    },
    car: {
      carId: ruleset.car.carId,
      name: ruleset.car.wbsElementId
    },
    deletedBy: ruleset.deletedBy ? userTransformer(ruleset.deletedBy) : null,
    deletedByUserId: ruleset.deletedByUserId
  };
};
