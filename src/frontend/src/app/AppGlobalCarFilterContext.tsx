/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from 'react';
import { Car } from 'shared';
import { useGetAllCars } from '../hooks/cars.hooks';
import { setCurrentCarId } from '../utils/axios';
import LoadingIndicator from '../components/LoadingIndicator';

interface GlobalCarFilterContextType {
  selectedCar: Car | 'all-cars';
  allCars: Car[];
  setSelectedCar: (car: Car | 'all-cars') => void;
  isLoading: boolean;
  isInitialized: boolean;
  error: Error | null;
}

const GlobalCarFilterContext = createContext<GlobalCarFilterContextType | undefined>(undefined);

interface GlobalCarFilterProviderProps {
  children: ReactNode;
}

export const GlobalCarFilterProvider: React.FC<GlobalCarFilterProviderProps> = ({ children }) => {
  const [selectedCar, setSelectedCarState] = useState<Car | 'all-cars'>('all-cars');
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: allCars = [], isLoading, error } = useGetAllCars();

  // Guarantees the header is updated before React Query enqueues new fetches.
  useLayoutEffect(() => {
    setCurrentCarId(selectedCar === 'all-cars' ? null : selectedCar.id);
  }, [selectedCar]);

  useEffect(() => {
    if (!isLoading && !isInitialized) {
      const savedCarId = localStorage.getItem('selectedCarId');

      // Handle saved selection
      if (savedCarId === 'all-cars') {
        setSelectedCarState('all-cars');
        setIsInitialized(true);
        return;
      } else if (savedCarId) {
        const savedCar = allCars.find((car) => car.id === savedCarId);
        if (savedCar) {
          setSelectedCarState(savedCar);
          setIsInitialized(true);
          return;
        }
        // Fall back to default if saved car id is invalid
        localStorage.removeItem('selectedCarId');
      }

      // Default to most recent car if no car was previously saved (highest car number)
      const mostRecentCar =
        allCars.length > 0 ? allCars.reduce((a, b) => (a.wbsNum.carNumber > b.wbsNum.carNumber ? a : b)) : null;
      if (mostRecentCar) {
        setSelectedCarState(mostRecentCar);
        localStorage.setItem('selectedCarId', mostRecentCar.id);
      } else {
        setSelectedCarState('all-cars');
      }
      setIsInitialized(true);
    }
  }, [allCars, isLoading, isInitialized]);

  const setSelectedCar = (car: Car | 'all-cars') => {
    setSelectedCarState(car);
    if (car !== 'all-cars') {
      localStorage.setItem('selectedCarId', car.id);
    } else {
      localStorage.setItem('selectedCarId', 'all-cars');
    }
  };

  const value: GlobalCarFilterContextType = {
    selectedCar,
    allCars,
    setSelectedCar,
    isLoading,
    isInitialized,
    error
  };

  return (
    <GlobalCarFilterContext.Provider value={value}>
      {isInitialized ? children : <LoadingIndicator />}
    </GlobalCarFilterContext.Provider>
  );
};

export const useGlobalCarFilter = (): GlobalCarFilterContextType => {
  const context = useContext(GlobalCarFilterContext);
  if (context === undefined) {
    throw new Error('useGlobalCarFilter must be used within a GlobalCarFilterProvider');
  }
  return context;
};
