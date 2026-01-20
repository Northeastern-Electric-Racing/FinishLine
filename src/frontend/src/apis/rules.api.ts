/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { ProjectRule, Rule as SharedRule, RuleCompletion, RulesetType, Ruleset } from 'shared';
import { apiUrls } from '../utils/urls';
import { CreateRulesetPayload, ParseRulesetPayload, CreateRulePayload } from '../hooks/rules.hooks';
import {
  projectRuleTransformer,
  rulesetTransformer,
  rulesetTypeTransformer,
  ruleTransformer
} from './transformers/rules.transformers';

/**
 * Gets a ruleset by its ID
 */
export const getRulesetById = (rulesetId: string) => {
  return axios.get<Ruleset>(apiUrls.rulesetById(rulesetId), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Gets a single ruleset by ID (dashboard usage)
 */
export const getSingleRuleset = (rulesetId: string) => {
  return axios.get<Ruleset>(apiUrls.singleRuleset(rulesetId), {
    transformResponse: (data) => rulesetTransformer(JSON.parse(data))
  });
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
 * Creates a new ruleset type
 */
export const createRulesetType = (payload: { name: string }) => {
  return axios.post<RulesetType>(apiUrls.rulesetTypeCreate(), payload);
};

/**
 * Creates a new rule
 *
 * @param payload the data for creating the rule
 * @returns the created rule
 */
export const createRule = (payload: CreateRulePayload) => {
  return axios.post<SharedRule>(apiUrls.ruleCreate(), { ...payload });
};

/**
 * Fetches all Ruleset Types for the current organization.
 *
 * @returns A list of Ruleset Types.
 */
export const getAllRulesetTypes = () => {
  return axios.get<RulesetType[]>(apiUrls.rulesetTypes(), {
    transformResponse: (data) => JSON.parse(data).map(rulesetTypeTransformer)
  });
};

/**
 * Gets the active ruleset for a given ruleset type.
 */
export const getActiveRuleset = (rulesetTypeId: string) => {
  return axios.get<Ruleset>(apiUrls.rulesGetActiveRuleset(rulesetTypeId), {
    transformResponse: (data) => rulesetTransformer(JSON.parse(data))
  });
};

/**
 * Gets all project rules for a given ruleset and project.
 */
export const getProjectRules = (rulesetId: string, projectId: string) => {
  return axios.get<ProjectRule[]>(apiUrls.rulesGetProjectRules(rulesetId, projectId), {
    transformResponse: (data) => JSON.parse(data).map(projectRuleTransformer)
  });
};

/**
 * Gets unassigned rules for a ruleset and team.
 */
export const getUnassignedRulesForRuleset = (rulesetId: string, teamId: string) => {
  return axios.get<SharedRule[]>(apiUrls.rulesGetUnassignedRulesForRuleset(rulesetId, teamId), {
    transformResponse: (data) => JSON.parse(data).map(ruleTransformer)
  });
};

/**
 * Creates a project rule
 */
export const createProjectRule = (ruleId: string, projectId: string) => {
  return axios.post<ProjectRule>(apiUrls.rulesCreateProjectRule(), { ruleId, projectId });
};

/**
 * Deletes a project rule
 */
export const deleteProjectRule = (projectRuleId: string) => {
  return axios.post<ProjectRule>(apiUrls.rulesDeleteProjectRule(projectRuleId));
};

/**
 * Updates project rule status
 */
export const editProjectRuleStatus = (projectRuleId: string, newStatus: RuleCompletion) => {
  return axios.post<ProjectRule>(apiUrls.rulesEditProjectRuleStatus(projectRuleId), { newStatus });
};

/**
 * Gets child rules
 */
export const getChildRules = (ruleId: string) => {
  return axios.get<SharedRule[]>(apiUrls.rulesChildRules(ruleId), {
    transformResponse: (data) => JSON.parse(data).map(ruleTransformer)
  });
};

/**
 * Gets top-level rules
 */
export const getTopLevelRules = (rulesetId: string) => {
  return axios.get<SharedRule[]>(apiUrls.rulesTopLevel(rulesetId), {
    transformResponse: (data) => JSON.parse(data).map(ruleTransformer)
  });
};

/**
 * Fetch rulesets by type
 */
export const getRulesetsByRulesetType = (rulesetTypeId: string) => {
  return axios.get<Ruleset[]>(apiUrls.rulesetsByType(rulesetTypeId), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * Deletes a rule
 */
export const deleteRule = (ruleId: string) => {
  return axios.post(apiUrls.rulesDelete(ruleId));
};

/**
 * Edits a rule's content
 * @param ruleId - The ID of the rule to edit
 * @param ruleContent - The new content for the rule
 */
export const editRule = (ruleId: string, ruleContent: string) => {
  return axios.post<SharedRule>(apiUrls.rulesEdit(ruleId), { ruleContent });
};

/**
 * Updates a rulesets active status
 */
export const updateRuleset = (rulesetId: string, name: string, isActive: boolean) => {
  return axios.post<Ruleset>(apiUrls.rulesetUpdate(rulesetId), { name, isActive });
};

/**
 * Deletes a ruleset
 */
export const deleteRuleset = (rulesetId: string) => {
  return axios.post(apiUrls.rulesetDelete(rulesetId));
};

/**
 * Deletes a ruleset type
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
 * Parses a ruleset PDF
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
