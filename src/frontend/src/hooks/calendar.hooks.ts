import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop } from 'shared';
import { getAllShops, postCreateShop } from '../apis/calendar.api';

export const SHOPS_KEY = ['calendar', 'shops'] as const;

/** Exactly like useGetAllAccountCodes */
export const useAllShops = () =>
  useQuery<Shop[], Error>(SHOPS_KEY, async () => {
    const { data } = await getAllShops();
    return data;
  });

/** Exactly like create/edit hooks in finance: mutate + invalidate */
export const useCreateShop = () => {
  const qc = useQueryClient();
  return useMutation<Shop, Error, { name: string; description: string }>(
    (payload) => postCreateShop(payload).then((r) => r.data),
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOPS_KEY);
      }
    }
  );
};
