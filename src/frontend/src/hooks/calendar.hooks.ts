import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop, Machinery, AvailabilityCreateArgs, Event, EventStatus } from 'shared';
import {
  getAllShops,
  postCreateShop,
  getAllMachinery,
  postCreateMachinery,
  postEditMachinery,
  postAddMachineryToShop,
  editShop,
  markUserConfirmed,
  getSingleEvent,
  getAllEvents,
  deleteEvent,
  setEventStatus
} from '../apis/calendar.api';
import { useCurrentUser } from './users.hooks';

export const MACHINERY_KEY = ['machinery'] as const;

export const useAllShops = () =>
  useQuery<Shop[], Error>(['shops'], async () => {
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
        qc.invalidateQueries(['shops']);
      }
    }
  );
};

export const useEditShop = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation<Shop, Error, { name: string; description: string }>(
    async (payload) => {
      const { data } = await editShop(shopId, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['shops']);
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

export const useMarkUserConfirmed = (id: string) => {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation<Event, Error, { availability: AvailabilityCreateArgs[] }>(
    ['events', 'mark-confirmed'],
    async (eventPayload: { availability: AvailabilityCreateArgs[] }) => {
      const { data } = await markUserConfirmed(id, eventPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
        queryClient.invalidateQueries(['users', user.userId, 'schedule-settings']);
      }
    }
  );
};

export const useSingleEvent = (id?: string) => {
  return useQuery<Event, Error>(
    ['events', id],
    async () => {
      const { data } = await getSingleEvent(id!);
      return data;
    },
    { enabled: !!id }
  );
};

export const useAllEvents = () => {
  return useQuery<Event[], Error>(['events'], async () => {
    const { data } = await getAllEvents();
    return data;
  });
};

export const useDeleteEvent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Event, Error>(
    ['events', 'delete'],
    async () => {
      const { data } = await deleteEvent(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
      }
    }
  );
};

export const useSetEventStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, { status: EventStatus }>(
    ['events', id],
    async (payload: { status: EventStatus }) => {
      const { data } = await setEventStatus(id, payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events', id]);
      }
    }
  );
};
