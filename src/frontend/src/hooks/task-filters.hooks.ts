/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { validateWBS, WbsNumber, wbsPipe } from 'shared';

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

const FILTER_PARAM_KEYS = ['cars', 'projects', 'workPackages', 'assignees', 'teams', 'labels', 'search'];

const safeValidateWBS = (raw: string): WbsNumber | undefined => {
  try {
    return validateWBS(raw);
  } catch {
    return undefined;
  }
};

// serializes the filters into the given (existing) query string, preserving any non-filter params such
// as the `?task=` param used to deep-link a task modal
const serializeFilters = (filters: TaskFilterFields, existingSearch: string): string => {
  const params = new URLSearchParams(existingSearch);
  FILTER_PARAM_KEYS.forEach((key) => params.delete(key));
  if (filters.carNumbers.length) params.set('cars', filters.carNumbers.join(','));
  if (filters.projectWbsNums.length) params.set('projects', filters.projectWbsNums.map(wbsPipe).join(','));
  if (filters.workPackageWbsNums.length) params.set('workPackages', filters.workPackageWbsNums.map(wbsPipe).join(','));
  if (filters.memberIds.length) params.set('assignees', filters.memberIds.join(','));
  if (filters.teamIds.length) params.set('teams', filters.teamIds.join(','));
  if (filters.labelIds.length) params.set('labels', filters.labelIds.join(','));
  if (filters.search) params.set('search', filters.search);
  return params.toString();
};

const deserializeFilters = (search: string): TaskFilterFields => {
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

const hasFilterParams = (search: string): boolean => {
  const params = new URLSearchParams(search);
  return FILTER_PARAM_KEYS.some((key) => params.has(key));
};

interface UseTaskFiltersOptions {
  /**
   * When set, filters are persisted to the URL query string (shareable) and to localStorage under
   * this key (sticky across visits). The URL takes precedence on load. When omitted, filters are
   * ephemeral local state (used by the project/work package boards).
   */
  persistKey?: string;
}

/**
 * Manages task filter state. Optionally mirrors the state into the URL and localStorage so a filtered
 * view can be shared via link and restored on return.
 */
export const useTaskFilters = ({ persistKey }: UseTaskFiltersOptions = {}) => {
  const history = useHistory();
  const location = useLocation();

  const [filters, setFilters] = useState<TaskFilterFields>(() => {
    if (!persistKey) return emptyTaskFilters;
    // URL wins so shared links reproduce the exact view
    if (hasFilterParams(location.search)) return deserializeFilters(location.search);
    const stored = localStorage.getItem(persistKey);
    if (stored) {
      try {
        return { ...emptyTaskFilters, ...(JSON.parse(stored) as Partial<TaskFilterFields>) };
      } catch {
        // ignore malformed storage
      }
    }
    return emptyTaskFilters;
  });

  // keep the URL + localStorage in sync with the current filters, without disturbing other query
  // params (e.g. the `?task=` param that opens a task modal)
  useEffect(() => {
    if (!persistKey) return;
    localStorage.setItem(persistKey, JSON.stringify(filters));
    const currentSearch = location.search.replace(/^\?/, '');
    const nextSearch = serializeFilters(filters, currentSearch);
    if (nextSearch !== currentSearch) {
      history.replace({ pathname: location.pathname, search: nextSearch });
    }
  }, [filters, persistKey, history, location.pathname, location.search]);

  const patch = useCallback((partial: Partial<TaskFilterFields>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const clear = useCallback(() => setFilters(emptyTaskFilters), []);

  return { filters, setFilters, patch, clear };
};
