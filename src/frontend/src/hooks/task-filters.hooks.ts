/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback, useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { deserializeTaskFilters, emptyTaskFilters, serializeTaskFilters, TaskFilterFields } from 'shared';

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
  const urlFilters = useMemo(() => deserializeTaskFilters(location.search), [location.search]);

  const filters = persistKey ? urlFilters : localFilters;

  const setFilters = useCallback(
    (update: TaskFilterFields | ((prev: TaskFilterFields) => TaskFilterFields)) => {
      if (!persistKey) {
        setLocalFilters(update);
        return;
      }
      const prev = deserializeTaskFilters(location.search);
      const next = typeof update === 'function' ? update(prev) : update;
      const currentSearch = location.search.replace(/^\?/, '');
      // preserve any non-filter params (e.g. the `?task=` param that opens a task modal)
      const nextSearch = serializeTaskFilters(next, currentSearch);
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
