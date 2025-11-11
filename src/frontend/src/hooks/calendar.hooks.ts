import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop } from 'shared';
import { getAllShops, postCreateShop, postDeleteShop } from '../apis/calendar.api';

export const SHOPS_KEY = ['shops'] as const;

export const useAllShops = () =>
  useQuery<Shop[], Error>(SHOPS_KEY, async () => {
    const res = await getAllShops();
    return res.data;
  });

export const useCreateShop = () => {
  const qc = useQueryClient();
  return useMutation<Shop, Error, { name: string; description: string }>(
    async (payload) => {
      const { data } = await postCreateShop(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOPS_KEY);
      }
    }
  );
};

export const useDeleteShop = () => {
  const qc = useQueryClient();
  return useMutation<{name : string}, Error, string>(
    async (shopID: string) => {
      const { data } = await postDeleteShop(shopID);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOPS_KEY);
      }
    }
  );
};
