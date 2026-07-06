/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Rule } from 'shared';

/**
 * Counts the total number of rules that will be deleted when deleting a rule, including
 * the rule itself and all its descendants. Does not include parents or siblings.
 * @param rule - The rule to delete
 * @param allRules - All rules in the ruleset
 * @returns The total number of rules that will be deleted
 */
export const countRulesToDelete = (rule: Rule, allRules: Rule[]): number => {
  let count = 1;
  const children = allRules.filter((r) => rule.subRuleIds.includes(r.ruleId));
  for (const child of children) {
    count += countRulesToDelete(child, allRules);
  }
  return count;
};

/**
 * Gets all leaf rules of a given rule (the rule itself if it has no children).
 * Does not include the rule's parent or siblings.
 *
 * @param rule - rule to start from
 * @param allRules - all rules in scope
 * @returns The leaf rules under the given rule, or rule if it is already a leaf
 */
export const getDescendantLeafRules = (rule: Rule, allRules: Rule[]): Rule[] => {
  const children = allRules.filter((r) => r.parentRule?.ruleId === rule.ruleId);
  if (children.length === 0) {
    return [rule];
  }
  return children.flatMap((child) => getDescendantLeafRules(child, allRules));
};

/**
 * Whether a rule is complete. A leaf uses its own completion; a parent is
 * complete only if all of its descendant leaf rules are complete.
 * @param rule - The rule to check
 * @param allRules - All rules in scope
 * @returns True if the rule (or all its leaves) are complete
 */
export const isRuleComplete = (rule: Rule, allRules: Rule[]): boolean => {
  const leafRules = getDescendantLeafRules(rule, allRules);
  return leafRules.every((leafRule) => leafRule.isComplete);
};

/**
 * Status chip label and color for a completion state.
 */
export const getRuleStatusConfig = (isComplete: boolean): { label: string; color: string } => {
  return isComplete ? { label: 'Complete', color: '#4caf50' } : { label: 'Incomplete', color: '#f44336' };
};
