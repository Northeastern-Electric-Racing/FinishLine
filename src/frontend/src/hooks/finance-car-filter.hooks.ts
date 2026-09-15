/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useState } from 'react';
import { Car } from 'shared';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

export interface FinanceDashboardCarFilter {
  selectedCar: Car | 'all-cars';
  allCars: Car[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  setSelectedCar: (car: Car | 'all-cars') => void;
  clearLocalSelection: () => void;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for Finance Dashboard car filtering with automatic date population.
 * Uses local state only; does not mutate the global car selection.
 *
 * selectedCar is the resolved car (local override if set, otherwise global) and can be used
 * directly as overrideCarId using selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id,
 * keeping query keys reactive to both.
 *
 * When a specific car is selected, dates auto-populate:
 * - Start date: When the car was initialized (car.dateCreated)
 * - End date: Today (if current car) or start date of the next car (if previous car)
 */
export const useFinanceDashboardCarFilter = (initialStartDate?: Date, initialEndDate?: Date): FinanceDashboardCarFilter => {
  const { selectedCar: globalSelectedCar, allCars, isLoading, error } = useGlobalCarFilter();

  // undefined = not set (mirror global), 'all-cars' = explicitly set to "All Cars", Car = explicitly set to specific car
  const [localSelectedCar, setLocalSelectedCar] = useState<Car | 'all-cars' | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);

  const setSelectedCar = (car: Car | 'all-cars') => {
    setLocalSelectedCar(car);
  };

  const clearLocalSelection = () => {
    setLocalSelectedCar(undefined);
  };

  // Resolved car: local override if set, otherwise mirrors the global car.
  const selectedCar = localSelectedCar !== undefined ? localSelectedCar : globalSelectedCar;

  // Auto-populate dates from the resolved car.
  useEffect(() => {
    if (selectedCar === 'all-cars') {
      setStartDate(undefined);
      setEndDate(undefined);
    } else if (allCars.length > 0) {
      setStartDate(new Date(selectedCar.dateCreated));
      const isCurrentCar = isCarCurrent(selectedCar, allCars);
      if (isCurrentCar) {
        setEndDate(new Date());
      } else {
        const nextCar = findNextCar(selectedCar, allCars);
        setEndDate(nextCar ? new Date(nextCar.dateCreated) : new Date());
      }
    }
  }, [selectedCar, allCars]);

  return {
    selectedCar,
    allCars,
    startDate,
    endDate,
    setSelectedCar,
    clearLocalSelection,
    setStartDate,
    setEndDate,
    isLoading,
    error
  };
};

/**
 * Determines if the given car is the current/most recent car
 */
const isCarCurrent = (car: Car, allCars: Car[]): boolean => {
  const maxCarNumber = Math.max(...allCars.map((c) => c.wbsNum.carNumber));
  return car.wbsNum.carNumber === maxCarNumber;
};

/**
 * Finds the next car in chronological order (by car number)
 */
const findNextCar = (car: Car, allCars: Car[]): Car | null => {
  const sortedCars = allCars
    .filter((c) => c.wbsNum.carNumber > car.wbsNum.carNumber)
    .sort((a, b) => a.wbsNum.carNumber - b.wbsNum.carNumber);

  return sortedCars[0] || null;
};
