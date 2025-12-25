import { RulesetType } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Rule as SharedRule, Ruleset } from 'shared';
import { CreateRulesetPayload, ParseRulesetPayload } from '../hooks/rules.hooks';

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
 * Creates a new ruleset
 */
export const createRuleset = (payload: CreateRulesetPayload) => {
  return axios.post<Ruleset>(apiUrls.rulesetsCreate(), payload);
};

/**
 * Parses a ruleset PDF and creates rules in the database
 */
export const parseRuleset = (payload: ParseRulesetPayload) => {
  return axios.post<SharedRule[]>(apiUrls.parseRuleset(payload.rulesetId), {
    fileId: payload.fileId,
    parserType: payload.parserType
  });
};

/**
 * Upload ruleset PDF file
 */
export const uploadRulesetFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(apiUrls.uploadRulesetFile(), formData, {
    transformResponse: (data) => JSON.parse(data)
  });
};
