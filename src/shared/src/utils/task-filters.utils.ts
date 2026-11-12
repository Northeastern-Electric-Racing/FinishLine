/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber } from '../types/project-types.js';
import { validateWBS, wbsPipe } from '../validate-wbs.js';

/** The set of task filters shared by the project, work package, and global task boards. */
export interface TaskFilterFields {
  carNumbers: number[];
  projectWbsNums: WbsNumber[];
  workPackageWbsNums: WbsNumber[];
  memberIds: string[];
  teamIds: string[];
  labelIds: string[];
  search: string;
}

export const emptyTaskFilters: TaskFilterFields = {
  carNumbers: [],
  projectWbsNums: [],
  workPackageWbsNums: [],
  memberIds: [],
  teamIds: [],
  labelIds: [],
  search: ''
};

const TASK_FILTER_PARAM_KEYS = ['cars', 'projects', 'workPackages', 'assignees', 'teams', 'labels', 'search'];

const safeValidateWBS = (raw: string): WbsNumber | undefined => {
  try {
    return validateWBS(raw);
  } catch {
    return undefined;
  }
};

/**
 * Serializes the filters into the given (existing) query string, preserving any non-filter params such
 * as the `?task=` param used to deep-link a task modal
 * @param filters the filters to serialize
 * @param existingSearch the existing query string to merge the filters into
 * @returns the resulting query string (without a leading `?`)
 */
export const serializeTaskFilters = (filters: TaskFilterFields, existingSearch: string = ''): string => {
  const params = new URLSearchParams(existingSearch);
  TASK_FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
  if (filters.carNumbers.length) params.set('cars', filters.carNumbers.join(','));
  if (filters.projectWbsNums.length) params.set('projects', filters.projectWbsNums.map(wbsPipe).join(','));
  if (filters.workPackageWbsNums.length) params.set('workPackages', filters.workPackageWbsNums.map(wbsPipe).join(','));
  if (filters.memberIds.length) params.set('assignees', filters.memberIds.join(','));
  if (filters.teamIds.length) params.set('teams', filters.teamIds.join(','));
  if (filters.labelIds.length) params.set('labels', filters.labelIds.join(','));
  if (filters.search) params.set('search', filters.search);
  return params.toString();
};

/**
 * Parses the task filters out of a query string, dropping any invalid values
 * @param search the query string to parse
 * @returns the parsed filters
 */
export const deserializeTaskFilters = (search: string): TaskFilterFields => {
  const params = new URLSearchParams(search);
  const list = (key: string): string[] => {
    const value = params.get(key);
    return value ? value.split(',').filter(Boolean) : [];
  };
  return {
    carNumbers: list('cars')
      .map(Number)
      .filter((num) => !Number.isNaN(num)),
    projectWbsNums: list('projects')
      .map(safeValidateWBS)
      .filter((wbs): wbs is WbsNumber => wbs !== undefined),
    workPackageWbsNums: list('workPackages')
      .map(safeValidateWBS)
      .filter((wbs): wbs is WbsNumber => wbs !== undefined),
    memberIds: list('assignees'),
    teamIds: list('teams'),
    labelIds: list('labels'),
    search: params.get('search') ?? ''
  };
};
