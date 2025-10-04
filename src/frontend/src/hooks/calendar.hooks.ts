import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop } from 'shared';
import { getShops, createShop } from '../apis/calendar.api';

/**
 * Get all shops for the current org
 */
export const useShops = () => {
  return useQuery<Shop[], Error>(['calendar', 'shops'], async () => {
    const { data } = await getShops();
    return data;
  });
};

/**
 * Create a shop
 */
type CreateShopPayload = { name: string; description: string };

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation<Shop, Error, CreateShopPayload>(
    ['calendar', 'shops', 'create'],
    async ({ name, description }) => {
      const { data } = await createShop({ name, description });
      return data;
    },
    {
      onSuccess: () => {
        // refresh the table
        queryClient.invalidateQueries(['calendar', 'shops']);
      }
    }
  );
};
