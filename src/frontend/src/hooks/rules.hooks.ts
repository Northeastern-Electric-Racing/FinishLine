import { useQuery } from 'react-query';
import { Ruleset, RulesetType } from 'shared';
import { getAllRulesetTypes, getRulesetsByRulesetType } from '../apis/rules.api';

/**
 * React Query hook to fetch all Ruleset Types.
 *
 * @returns Query result containing Ruleset Types data, loading state, and error state.
 */
export const useAllRulesetTypes = () => {
  return useQuery<RulesetType[], Error>(['rulesetTypes'], async () => {
    const { data } = await getAllRulesetTypes();
    return data;
  });
};

/**
 * React Query hook to fetch all Rulesets for a specific Ruleset Type.
 *
 * @param rulesetTypeId The ID of the ruleset type.
 * @returns Query result containing Rulesets data, loading state, and error state.
 */
export const useRulesetsByType = (rulesetTypeId: string) => {
  return useQuery<Ruleset[], Error>(['rulesets', rulesetTypeId], async () => {
    const { data } = await getRulesetsByRulesetType(rulesetTypeId);
    return data;
  });
};
