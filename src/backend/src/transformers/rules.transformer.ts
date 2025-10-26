import { ProjectRule, RulesetType } from 'shared';

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

export const rulesetTypeTransformer = (rulesetType: any): RulesetType => {
  return {
    rulesetTypeId: rulesetType.rulesetTypeId,
    name: rulesetType.name,
    lastUpdated: rulesetType.lastUpdated,
    revisionFiles: rulesetType.revisionFiles,
    organization: rulesetType.organization
  };
};
