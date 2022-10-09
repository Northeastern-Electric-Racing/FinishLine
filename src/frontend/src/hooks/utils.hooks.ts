/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMemo } from 'react';
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
