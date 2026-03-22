/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Car } from 'shared';
import { useGetAllCars } from '../hooks/cars.hooks';
import { setCurrentCarId } from '../utils/axios';

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
  const hasInitialized = useRef(false);

  const { data: allCars = [], isLoading, error } = useGetAllCars();

  useEffect(() => {
    if (!isLoading && !hasInitialized.current) {
      hasInitialized.current = true;

      const savedCarName = sessionStorage.getItem('selectedCarName');
      if (savedCarName) {
        const savedCar = allCars.find((car) => car.name === savedCarName);
        if (savedCar) {
          setSelectedCar(savedCar);
          return;
        }
      }

      // Default to null (all cars)
      setSelectedCarState(null);
    }
  }, [allCars, isLoading]);

  const setSelectedCar = (car: Car | null) => {
    setSelectedCarState(car);
    setCurrentCarId(car ? car.id : null);
    if (car) {
      sessionStorage.setItem('selectedCarName', car.name);
    } else {
      sessionStorage.removeItem('selectedCarName');
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
