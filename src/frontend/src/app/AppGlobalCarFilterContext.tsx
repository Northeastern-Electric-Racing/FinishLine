/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Car } from 'shared';
import { useGetCurrentCar, useGetAllCars } from '../hooks/cars.hooks';

interface GlobalCarFilterContextType {
  selectedCar: Car | null;
  allCars: Car[];
  setSelectedCar: (car: Car | null) => void;
  isLoading: boolean;
  error: Error | null;
}

const GlobalCarFilterContext = createContext<GlobalCarFilterContextType | undefined>(undefined);

interface GlobalCarFilterProviderProps {
  children: ReactNode;
}

export const GlobalCarFilterProvider: React.FC<GlobalCarFilterProviderProps> = ({ children }) => {
  const [selectedCar, setSelectedCarState] = useState<Car | null>(null);
  const [hasBeenManuallyCleared, setHasBeenManuallyCleared] = useState(false);

  const { data: currentCar, isLoading: currentCarLoading, error: currentCarError } = useGetCurrentCar();
  const { data: allCars = [], isLoading: allCarsLoading, error: allCarsError } = useGetAllCars();

  const isLoading = currentCarLoading || allCarsLoading;
  const error = currentCarError || allCarsError;

  useEffect(() => {
    if (!isLoading && allCars.length > 0 && !hasBeenManuallyCleared) {
      const savedCarId = sessionStorage.getItem('selectedCarId');

      if (savedCarId) {
        const savedCar = allCars.find((car) => car.id === savedCarId);
        if (savedCar) {
          setSelectedCarState(savedCar);
          return;
        }
      }

      if (currentCar) {
        setSelectedCarState(currentCar);
      } else if (allCars.length > 0) {
        const mostRecentCar = allCars.reduce((latest, car) =>
          car.wbsNum.carNumber > latest.wbsNum.carNumber ? car : latest
        );
        setSelectedCarState(mostRecentCar);
      }
    }
  }, [currentCar, allCars, isLoading, hasBeenManuallyCleared]);

  const setSelectedCar = (car: Car | null) => {
    if (car === null) {
      setHasBeenManuallyCleared(true);
    }
    setSelectedCarState(car);

    if (car) {
      sessionStorage.setItem('selectedCarId', car.id);
    } else {
      sessionStorage.removeItem('selectedCarId');
    }
  };

  const value: GlobalCarFilterContextType = {
    selectedCar,
    allCars,
    setSelectedCar,
    isLoading,
    error
  };

  return <GlobalCarFilterContext.Provider value={value}>{children}</GlobalCarFilterContext.Provider>;
};

export const useGlobalCarFilter = (): GlobalCarFilterContextType => {
  const context = useContext(GlobalCarFilterContext);
  if (context === undefined) {
    throw new Error('useGlobalCarFilter must be used within a GlobalCarFilterProvider');
  }
  return context;
};
