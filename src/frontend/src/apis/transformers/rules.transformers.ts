/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProjectRule, Rule, RulesetType, Ruleset, RuleStatusHistoryEntry } from 'shared';

/**
 * Transforms a rule to proper field types.
 *
 * @param rule Incoming rule object
 * @returns Properly transformed rule object.
 */
export const ruleTransformer = (rule: Rule): Rule => {
  return {
    ...rule,
    subRuleIds: rule.subRuleIds || [],
    referencedRules: rule.referencedRules || [],
    statusUpdatedAt: rule.statusUpdatedAt ? new Date(rule.statusUpdatedAt) : undefined,
    projects: rule.projects?.map((project) => ({
      ...project,
      statusUpdatedAt: project.statusUpdatedAt ? new Date(project.statusUpdatedAt) : undefined
    }))
  };
};

/**
 * Transforms a project rule (support Date objects)
 *
 * @param projectRule Incoming project rule object
 * @returns Properly transformed project rule object.
 */
export const projectRuleTransformer = (projectRule: ProjectRule): ProjectRule => {
  return {
    ...projectRule,
    rule: ruleTransformer(projectRule.rule),
    statusUpdatedAt: projectRule.statusUpdatedAt ? new Date(projectRule.statusUpdatedAt) : undefined
  };
};

/**
 * Transforms a ruleset type (support Date objects)
 *
 * @param rulesetType Incoming ruleset type object
 * @returns Properly transformed ruleset type object.
 */
export const rulesetTypeTransformer = (rulesetType: RulesetType): RulesetType => {
  return {
    ...rulesetType,
    lastUpdated: new Date(rulesetType.lastUpdated),
    revisionFiles: rulesetType.revisionFiles || []
  };
};

/**
 * Transforms a ruleset (support Date objects)
 *
 * @param ruleset Incoming ruleset object
 * @returns Properly transformed ruleset object.
 */
export const rulesetTransformer = (ruleset: Ruleset): Ruleset => {
  return {
    ...ruleset,
    dateCreated: new Date(ruleset.dateCreated),
    rulesetType: rulesetTypeTransformer(ruleset.rulesetType)
  };
};

/**
 * Transforms a rule status history entry
 *
 * @param entry Incoming status history entry
 * @returns Properly transformed status history entry.
 */
export const ruleStatusHistoryTransformer = (entry: RuleStatusHistoryEntry): RuleStatusHistoryEntry => ({
  ...entry,
  updatedAt: new Date(entry.updatedAt)
});
