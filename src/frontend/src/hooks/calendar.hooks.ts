import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop, Machinery } from 'shared';
import {
  getAllShops,
  postCreateShop,
  postDeleteShop,
  getAllMachinery,
  postCreateMachinery,
  postEditMachinery,
  postAddMachineryToShop
} from '../apis/calendar.api';

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
  return useMutation<Machinery, Error, { machineName: string }>(
    async (payload) => {
      return await postCreateMachinery(payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useEditMachinery = (machineryId: string) => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { machineName: string }>(
    async (payload) => {
      return await postEditMachinery({
        machineryId,
        name: payload.machineName
      });
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useAddMachineryToShop = (machineryId: string) => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { shopId: string; quantity: number; originalShopId?: string }>(
    async (payload) => {
      return await postAddMachineryToShop({
        machineryId,
        ...payload
      });
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
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