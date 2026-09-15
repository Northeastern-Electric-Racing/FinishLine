/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback, useMemo, useState } from 'react';
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

interface UseTaskFiltersOptions {
  /**
   * When set, the URL query string is the single source of truth for the filters, so a filtered view
   * is shareable via link and can be applied by simply navigating to a saved dashboard link. When
   * omitted, filters are ephemeral local state (used by the project/work package boards).
   */
  persistKey?: string;
}

/**
 * Manages task filter state. When `persistKey` is set the filters are read from and written to the URL
 * query string (the single source of truth), so shared links and saved dashboards reproduce the exact
 * view. Otherwise the filters are ephemeral local state.
 */
export const useTaskFilters = ({ persistKey }: UseTaskFiltersOptions = {}) => {
  const history = useHistory();
  const location = useLocation();

  // ephemeral filters for the uncontrolled project / work package boards
  const [localFilters, setLocalFilters] = useState<TaskFilterFields>(emptyTaskFilters);

  // when persisting, the URL is the single source of truth, so navigating to a saved dashboard link
  // (or a shared link) drives the filters directly
  const urlFilters = useMemo(() => deserializeFilters(location.search), [location.search]);

  const filters = persistKey ? urlFilters : localFilters;

  const setFilters = useCallback(
    (update: TaskFilterFields | ((prev: TaskFilterFields) => TaskFilterFields)) => {
      if (!persistKey) {
        setLocalFilters(update);
        return;
      }
      const prev = deserializeFilters(location.search);
      const next = typeof update === 'function' ? update(prev) : update;
      const currentSearch = location.search.replace(/^\?/, '');
      // preserve any non-filter params (e.g. the `?task=` param that opens a task modal)
      const nextSearch = serializeFilters(next, currentSearch);
      if (nextSearch !== currentSearch) {
        history.replace({ pathname: location.pathname, search: nextSearch });
      }
    },
    [persistKey, history, location.pathname, location.search]
  );

  const patch = useCallback(
    (partial: Partial<TaskFilterFields>) => setFilters((prev) => ({ ...prev, ...partial })),
    [setFilters]
  );

  const clear = useCallback(() => setFilters(emptyTaskFilters), [setFilters]);

  return { filters, setFilters, patch, clear };
};
