import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Car } from 'shared';
import { createCar, getAllCars, editCar } from '../apis/cars.api';

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

export const useEditCar = (carId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Car, Error, CreateCarPayload>(
    ['cars', 'edit'],
    async (formData: CreateCarPayload) => {
      const { data } = await editCar(carId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cars']);
      }
    }
  );
};
