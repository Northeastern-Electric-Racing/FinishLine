import { Rule } from 'shared';

export const countRulesToDelete = (rule: Rule, allRules: Rule[]): number => {
  let count = 1;
  const children = allRules.filter((r) => rule.subRuleIds.includes(r.ruleId));
  for (const child of children) {
    count += countRulesToDelete(child, allRules);
  }
  return count;
};
