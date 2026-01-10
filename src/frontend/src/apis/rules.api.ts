/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { Rule as SharedRule, RulesetType, Ruleset } from 'shared';
import { apiUrls } from '../utils/urls';
import { CreateRulesetPayload, ParseRulesetPayload } from '../hooks/rules.hooks';

/**
 * Gets all top-level rules (rules with no parent) for a ruleset
 */
export const getTopLevelRules = (rulesetId: string) => {
  return axios.get<SharedRule[]>(apiUrls.rulesTopLevel(rulesetId));
};

/**
 * Gets a ruleset by its ID
 */
export const getRulesetById = (rulesetId: string) => {
  return axios.get<Ruleset>(apiUrls.rulesetById(rulesetId), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Gets all child rules of a specific rule
 */
export const getChildRules = (ruleId: string) => {
  return axios.get<SharedRule[]>(apiUrls.rulesChildRules(ruleId));
};

/**
 * Toggles team assignment for a rule
 */
export const toggleRuleTeam = (ruleId: string, teamId: string) => {
  return axios.post<SharedRule>(apiUrls.rulesToggleTeam(ruleId), { teamId });
};

/**
 * Gets all rules assigned to a team for a specific ruleset type
 */
export const getTeamRulesInRulesetType = (rulesetTypeId: string, teamId: string) => {
  return axios.get<SharedRule[]>(apiUrls.rulesTeamRulesInRulesetType(rulesetTypeId, teamId));
};

/**
 * Gets project rules for a specific ruleset
 */
export const getProjectRulesInRuleset = (rulesetId: string, projectId: string) => {
  return axios.get<SharedRule[]>(apiUrls.projectRulesInRuleset(rulesetId, projectId));
};

/**
 * Gets unassigned team rules for a specific ruleset
 */
export const getUnassignedTeamRulesInRuleset = (rulesetId: string, teamId: string) => {
  return axios.get<SharedRule[]>(apiUrls.unassignedTeamRulesInRuleset(rulesetId, teamId));
};



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

/**
 * Updates a rulesets active status
 */
export const updateRuleset = (rulesetId: string, name: string, isActive: boolean) => {
  return axios.post<Ruleset>(apiUrls.rulesetUpdate(rulesetId), { name, isActive });
};

/**
 * Deletes a ruleset given its ID
 */
export const deleteRuleset = (rulesetId: string) => {
  return axios.post(apiUrls.rulesetDelete(rulesetId));
};

/**
 * Deletes a ruleset type given its ID
 */
export const deleteRulesetType = (rulesetTypeId: string) => {
  return axios.post(apiUrls.rulesetTypeDelete(rulesetTypeId));
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
