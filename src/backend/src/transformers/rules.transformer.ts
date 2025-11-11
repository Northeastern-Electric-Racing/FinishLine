import { Prisma } from '@prisma/client';
import { Rule, RuleCompletion, ProjectRule, Ruleset, RulesetType, RulesetPreview } from 'shared';
import { RuleQueryArgs, RulesetQueryArgs } from '../prisma-query-args/rules.query-args';

export const ruleTransformer = (rule: Prisma.RuleGetPayload<RuleQueryArgs>): Rule => {
  return {
    ruleId: rule.ruleId,
    ruleCode: rule.ruleCode,
    ruleContent: rule.ruleContent,
    imageFileIds: rule.imageFileIds,
    parentRule: rule.parentRule
      ? {
          ruleId: rule.parentRule.ruleId,
          ruleCode: rule.parentRule.ruleCode
        }
      : undefined,
    subRuleIds: rule.subRules.map((subRule) => subRule.ruleId),
    referencedRuleIds: rule.referencedRule.map((ref) => ref.ruleId)
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

export const rulesetTypeTransformer = (rulesetType: any): RulesetType => {
  return {
    rulesetTypeId: rulesetType.rulesetTypeId,
    name: rulesetType.name,
    lastUpdated: rulesetType.lastUpdated,
    revisionFiles: rulesetType.revisionFiles
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
    rulesetType: rulesetTypeTransformer(ruleset.rulesetType),
    car: {
      carId: ruleset.car.carId,
      name: ruleset.car.wbsElementId
    }
  };
};

export const rulesetPreviewTransformer = (ruleset: any): RulesetPreview => {
  const teamsPercentage = 0;

  return {
    name: ruleset.name,
    dateCreated: ruleset.dateCreated,
    active: ruleset.active,
    assignedPercentage: teamsPercentage,
    car: {
      carId: ruleset.car.carId,
      name: ruleset.car.wbsElementId
    }
  };
};
