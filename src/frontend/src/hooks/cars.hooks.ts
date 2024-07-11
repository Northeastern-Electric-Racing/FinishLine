import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Car } from 'shared';
import { createCar, getAllCars } from '../apis/cars.api';

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
