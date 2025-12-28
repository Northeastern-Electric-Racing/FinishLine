/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { ProjectRule, Rule, RuleCompletion, Ruleset, RulesetType } from 'shared';
import { apiUrls } from '../utils/urls';
import {
  projectRuleTransformer,
  rulesetTransformer,
  rulesetTypeTransformer,
  ruleTransformer
} from './transformers/rules.transformers';

/**
 * Creates a new ruleset type
 *
 * @param payload the data for creating the ruleset type.
 * @returns the created ruleset type
 */
export const createRulesetType = (payload: { name: string }) => {
  return axios.post<RulesetType>(apiUrls.rulesetTypeCreate(), payload);
};

/**
 * Fetches all ruleset types for the organization.
 */
export const getAllRulesetTypes = () => {
  return axios.get<RulesetType[]>(apiUrls.rulesGetAllRulesetTypes(), {
    transformResponse: (data) => JSON.parse(data).map(rulesetTypeTransformer)
  });
};

/**
 * Gets the active ruleset for a given ruleset type.
 *
 * @param rulesetTypeId The ID of the ruleset type.
 */
export const getActiveRuleset = (rulesetTypeId: string) => {
  return axios.get<Ruleset>(apiUrls.rulesGetActiveRuleset(rulesetTypeId), {
    transformResponse: (data) => rulesetTransformer(JSON.parse(data))
  });
};

/**
 * Gets all project rules for a given ruleset and project.
 *
 * @param rulesetId The ID of the ruleset.
 * @param projectId The ID of the project.
 */
export const getProjectRules = (rulesetId: string, projectId: string) => {
  return axios.get<ProjectRule[]>(apiUrls.rulesGetProjectRules(rulesetId, projectId), {
    transformResponse: (data) => JSON.parse(data).map(projectRuleTransformer)
  });
};

/**
 * Gets unassigned rules for a ruleset and team.
 *
 * @param rulesetId The ID of the ruleset.
 * @param teamId The ID of the team.
 */
export const getUnassignedRulesForRuleset = (rulesetId: string, teamId: string) => {
  return axios.get<Rule[]>(apiUrls.rulesGetUnassignedRulesForRuleset(rulesetId, teamId), {
    transformResponse: (data) => JSON.parse(data).map(ruleTransformer)
  });
};

/**
 * Creates a project rule (assigns a rule to a project).
 *
 * @param ruleId The ID of the rule to assign.
 * @param projectId The ID of the project.
 */
export const createProjectRule = (ruleId: string, projectId: string) => {
  return axios.post<ProjectRule>(apiUrls.rulesCreateProjectRule(), { ruleId, projectId });
};

/**
 * Deletes a project rule.
 *
 * @param projectRuleId The ID of the project rule to delete.
 */
export const deleteProjectRule = (projectRuleId: string) => {
  return axios.post<ProjectRule>(apiUrls.rulesDeleteProjectRule(projectRuleId));
};

/**
 * Updates the status of a project rule.
 *
 * @param projectRuleId The ID of the project rule.
 * @param newStatus The new status to set.
 */
export const editProjectRuleStatus = (projectRuleId: string, newStatus: RuleCompletion) => {
  return axios.post<ProjectRule>(apiUrls.rulesEditProjectRuleStatus(projectRuleId), { newStatus });
};

/**
 * Gets all child rules of a given rule.
 *
 * @param ruleId The ID of the parent rule.
 */
export const getChildRules = (ruleId: string) => {
  return axios.get<Rule[]>(apiUrls.rulesGetChildRules(ruleId), {
    transformResponse: (data) => JSON.parse(data).map(ruleTransformer)
  });
};

/**
 * Gets all top-level rules (rules with no parent) for a ruleset.
 *
 * @param rulesetId The ID of the ruleset.
 */
export const getTopLevelRules = (rulesetId: string) => {
  return axios.get<Rule[]>(apiUrls.rulesGetTopLevelRules(rulesetId), {
    transformResponse: (data) => JSON.parse(data).map(ruleTransformer)
  });
};
