import { apiUrls } from '../utils/urls';
import axios from '../utils/axios';
import { Rule as SharedRule, Ruleset } from 'shared';
import { CreateRulesetPayload, ParseRulesetPayload } from '../hooks/rules.hooks';

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


export const uploadRulesetFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(apiUrls.uploadRulesetFile(), formData, {
    transformResponse: (data) => JSON.parse(data)
  });
};