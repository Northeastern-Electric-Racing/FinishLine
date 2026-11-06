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
 * A custom hook that delays updating a value until it has stopped changing for the given delay.
 * Useful for keeping a text input responsive while only running expensive work once typing settles.
 * @param value The value to debounce.
 * @param delay How long the value must stay unchanged before it is returned, in milliseconds.
 * @returns The value, as of `delay` milliseconds after it last changed.
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
