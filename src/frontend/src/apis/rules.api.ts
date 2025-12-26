import { RulesetType, Ruleset } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

/**
 * Creates a new ruleset type
 *
 * @param payload the data for creating the ruleset type
 * @returns the created ruleset type
 */
export const createRulesetType = (payload: { name: string }) => {
  return axios.post<RulesetType>(apiUrls.rulesetTypeCreate(), payload);
};

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

