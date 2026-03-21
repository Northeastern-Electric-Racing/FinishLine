/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useEffect, useState } from 'react';
import { Car } from 'shared';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

export interface FinanceDashboardCarFilter {
  selectedCar: Car | null;
  allCars: Car[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  carNumber: number | undefined;
  setSelectedCar: (car: Car) => void;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for Finance Dashboard car filtering with automatic date population
 * When a car is selected, it populates:
 * - Start date: When the car was initialized (car.dateCreated)
 * - End date: Today (if current car) or end date of that car (if previous car)
 */
export const useFinanceDashboardCarFilter = (
  initialStartDate?: Date,
  initialEndDate?: Date,
  initialCarNumber?: number
): FinanceDashboardCarFilter => {
  const { selectedCar, allCars, setSelectedCar: setGlobalSelectedCar, isLoading, error } = useGlobalCarFilter();

  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);

  useEffect(() => {
    if (initialCarNumber !== undefined && allCars.length > 0 && !selectedCar) {
      const initialCar = allCars.find((car) => car.wbsNum.carNumber === initialCarNumber);
      if (initialCar) {
        setGlobalSelectedCar(initialCar);
      }
    }
  }, [initialCarNumber, allCars, selectedCar, setGlobalSelectedCar]);
  useEffect(() => {
    if (selectedCar && allCars.length > 0) {
      setStartDate(selectedCar.dateCreated);

      const isCurrentCar = isCarCurrent(selectedCar, allCars);
      if (isCurrentCar) {
        setEndDate(new Date());
      } else {
        const nextCar = findNextCar(selectedCar, allCars);
        if (nextCar) {
          setEndDate(nextCar.dateCreated);
        } else {
          setEndDate(new Date());
        }
      }
    }
  }, [selectedCar, allCars]);

  const setSelectedCar = (car: Car) => {
    setGlobalSelectedCar(car);
  };

  return {
    selectedCar,
    allCars,
    startDate,
    endDate,
    carNumber: selectedCar?.wbsNum.carNumber,
    setSelectedCar,
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
