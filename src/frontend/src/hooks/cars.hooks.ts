import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Car } from 'shared';
import { createCar, getAllCars, getCurrentCar } from '../apis/cars.api';

export interface CreateCarPayload {
  name: string;
}

/**
 * Custom React Hook to supply all change requests.
 */
export const useGetAllCars = () => {
  return useQuery<Car[], Error>(['cars'], async () => {
    const { data } = await getAllCars();
    return data;
  });
};

/**
 * Custom React Hook to get the current car (most recent car by car number).
 */
export const useGetCurrentCar = () => {
  return useQuery<Car | null, Error>(['cars', 'current'], async () => {
    const { data } = await getCurrentCar();
    return data;
  });
};

//TODO Move this logic to backend
export const useGetCarsByIds = (ids: Set<string>) => {
  return useQuery<Car[], Error>(['cars'], async () => {
    const { data } = await getAllCars();
    return data.filter((car) => ids.has(car.id));
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();
  return useMutation<Car, Error, CreateCarPayload>(
    ['cars', 'create'],
    async (payload) => {
      const { data } = await createCar(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cars']);
      }
    }
  );
};
