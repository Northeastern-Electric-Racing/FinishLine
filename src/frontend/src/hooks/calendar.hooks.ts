import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop, Machinery } from 'shared';
import { getAllShops, postCreateShop, getAllMachinery, postCreateMachinery, postEditMachinery } from '../apis/calendar.api';

export const SHOPS_KEY = ['shops'] as const;
export const MACHINERY_KEY = ['machinery'] as const;

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

export const useAllMachines = () =>
  useQuery<Machinery[], Error>(MACHINERY_KEY, async () => {
    const res = await getAllMachinery();
    return res.data;
  });

export const useCreateMachinery = () => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { name: string; shopId: string; quantity: number }>(
    async (payload) => {
      const { data } = await postCreateMachinery(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useEditMachinery = () => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { machineryId: string; name: string; shopId: string; quantity: number }>(
    async (payload) => {
      const { data } = await postEditMachinery(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};
