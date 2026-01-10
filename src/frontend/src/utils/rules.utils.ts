/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Rule } from 'shared';

/**
 * Counts the total number of rules that will be deleted when deleting a rule
 * (including the rule itself and all its descendants)
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
