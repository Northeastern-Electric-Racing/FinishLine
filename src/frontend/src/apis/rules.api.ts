import { RulesetType } from 'shared';
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
