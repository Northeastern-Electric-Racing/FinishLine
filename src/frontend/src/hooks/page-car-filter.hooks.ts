/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useState } from 'react';
import { Car } from 'shared';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

export interface PageCarFilter {
  /** The currently selected car for this page (can be different from global) */
  selectedCar: Car | null;
  /** All available cars */
  allCars: Car[];
  /** Whether this page is using the global filter or a local override */
  usingGlobalFilter: boolean;
  /** Set the car for this page only (creates local override) */
  setLocalCar: (car: Car | null) => void;
  /** Reset to use the global filter */
  resetToGlobalFilter: () => void;
  /** Loading and error states */
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for pages that want to support both global car filtering and page-specific overrides
 *
 * Behavior:
 * - By default, uses the global car filter
 * - When user changes filter on the page, creates a local override
 * - When user navigates away and returns, reverts to global filter
 *
 * Usage:
 * const carFilter = usePageCarFilter('gantt-page');
 */
export const usePageCarFilter = (pageKey: string): PageCarFilter => {
  const { selectedCar: globalCar, allCars, isLoading, error } = useGlobalCarFilter();

  const [localCar, setLocalCar] = useState<Car | null>(null);
  const [hasLocalOverride, setHasLocalOverride] = useState(false);

  // Session key for storing page-specific overrides
  const sessionKey = `page-car-filter-${pageKey}`;

  // Initialize from session storage on mount
  useEffect(() => {
    const savedLocalCarId = sessionStorage.getItem(sessionKey);
    if (savedLocalCarId && allCars.length > 0) {
      const savedCar = allCars.find((car) => car.id === savedLocalCarId);
      if (savedCar) {
        setLocalCar(savedCar);
        setHasLocalOverride(true);
      }
    }
  }, [sessionKey, allCars]);

  // Clean up session storage when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      sessionStorage.removeItem(sessionKey);
      setHasLocalOverride(false);
      setLocalCar(null);
    };
  }, [sessionKey]);

  const setLocalCarHandler = (car: Car | null) => {
    setLocalCar(car);
    setHasLocalOverride(true);

    // Save to session storage
    if (car) {
      sessionStorage.setItem(sessionKey, car.id);
    } else {
      sessionStorage.removeItem(sessionKey);
    }
  };

  const resetToGlobalFilter = () => {
    setLocalCar(null);
    setHasLocalOverride(false);
    sessionStorage.removeItem(sessionKey);
  };

  return {
    selectedCar: hasLocalOverride ? localCar : globalCar,
    allCars,
    usingGlobalFilter: !hasLocalOverride,
    setLocalCar: setLocalCarHandler,
    resetToGlobalFilter,
    isLoading,
    error
  };
};
