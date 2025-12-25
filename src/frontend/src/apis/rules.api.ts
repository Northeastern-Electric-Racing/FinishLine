import axios from 'axios';
import { Ruleset, RulesetType } from 'shared';
import { apiUrls } from '../utils/urls';
/**
 * Fetches all Ruleset Types for the current organization.
 *
 * @returns A list of Ruleset Types.
 */
export const getAllRulesetTypes = () => {
  return axios.get<RulesetType[]>(apiUrls.rulesetTypes(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Fetches all Rulesets for a specific Ruleset Type.
 *
 * @param rulesetTypeId ID of the ruleset type.
 * @returns A list of Rulesets for that ruleset type.
 */
export const getRulesetsByRulesetType = (rulesetTypeId: string) => {
  return axios.get<Ruleset[]>(apiUrls.rulesetsByType(rulesetTypeId), {
    transformResponse: (data) => JSON.parse(data)
  });
};
