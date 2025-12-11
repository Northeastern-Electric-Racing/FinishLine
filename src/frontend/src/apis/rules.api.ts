/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { Rule } from 'shared';
import { apiUrls } from '../utils/urls';

/**
 * Gets all top-level rules (rules with no parent) for a ruleset
 */
export const getTopLevelRules = (rulesetId: string) => {
  return axios.get<Rule[]>(apiUrls.rulesTopLevel(rulesetId));
};

/**
 * Gets all child rules of a specific rule
 */
export const getChildRules = (ruleId: string) => {
  return axios.get<Rule[]>(apiUrls.rulesChildRules(ruleId));
};

/**
 * Toggles team assignment for a rule
 */
export const toggleRuleTeam = (ruleId: string, teamId: string) => {
  return axios.post<Rule>(apiUrls.rulesToggleTeam(ruleId), { teamId });
};

/**
 * Gets all rules assigned to a team for a specific ruleset type
 */
export const getTeamRulesInRulesetType = (rulesetTypeId: string, teamId: string) => {
  return axios.get<Rule[]>(apiUrls.rulesTeamRulesInRulesetType(rulesetTypeId, teamId));
};
