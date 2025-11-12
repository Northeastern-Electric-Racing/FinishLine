import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop, FilterArgs, Event } from 'shared';
import { getAllShops, postCreateShop, postFilterEvents } from '../apis/calendar.api';

export const SHOPS_KEY = ['shops'] as const;
export const FILTER_EVENTS_KEY = ['filter_events'] as const;

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

export const useFilterEvents = () => {
  const qc = useQueryClient();
  return useMutation<Event[], Error, FilterArgs>(
    async (payload) => {
      const { data } = await postFilterEvents(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(FILTER_EVENTS_KEY);
      }
    }
  );
}