/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Utility hooks for various different use cases.
 */

/**
 * A custom hook that builds on useLocation to parse the query string for you.
 * @returns Query data.
 */
export const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

/**
 * A custom hook that gives the current time and updates it every tick.
 * @param tickMs how often the time is updated, in milliseconds
 * @returns The current time as of the last tick.
 */
export const useNow = (tickMs: number): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(interval);
  }, [tickMs]);

  return now;
};
