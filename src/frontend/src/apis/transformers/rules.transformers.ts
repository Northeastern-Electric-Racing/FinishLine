/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProjectRule, Rule, RulesetType, Ruleset } from 'shared';

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
    referencedRuleIds: rule.referencedRuleIds || []
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
    statusHistory: (projectRule.statusHistory || []).map((history) => ({
      ...history,
      dateCreated: new Date(history.dateCreated)
    }))
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
