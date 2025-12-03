import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop, Machinery, Calendar, AvailabilityCreateArgs, Event, EventStatus, FilterArgs } from 'shared';
import {
  getAllShops,
  postCreateShop,
  postDeleteShop,
  getAllMachinery,
  postCreateMachinery,
  postEditMachinery,
  postDeleteMachinery,
  postAddMachineryToShop,
  editShop,
  postDeleteCalendar,
  getAllCalendars,
  postEditCalendar,
  postCreateCalendar,
  markUserConfirmed,
  getSingleEvent,
  getAllEvents,
  deleteEvent,
  setEventStatus,
  postFilterEvents
} from '../apis/calendar.api';
import { useCurrentUser } from './users.hooks';

export const FILTER_EVENTS_KEY = ['filter_events'] as const;

export const MACHINERY_KEY = ['machinery'] as const;
const SHOP_KEY = ['shops'] as const;
const CALENDAR_KEY = ['calendars'] as const;

export const useAllCalendars = () =>
  useQuery<Calendar[], Error>(['calendars'], async () => {
    const res = await getAllCalendars();
    return res.data;
  });

export const useCreateCalendar = () => {
  const qc = useQueryClient();
  return useMutation<Calendar, Error, { name: string; description: string; colorHexCode: string }>(
    async (payload) => {
      const { data } = await postCreateCalendar(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['calendars']);
      }
    }
  );
};

export const useEditCalendar = (calendarId: string) => {
  const qc = useQueryClient();
  return useMutation<Calendar, Error, { name: string; description: string; colorHexCode: string }>(
    async (payload) => {
      const { data } = await postEditCalendar(calendarId, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['calendars']);
      }
    }
  );
};

export const useAllShops = () =>
  useQuery<Shop[], Error>(SHOP_KEY, async () => {
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
        qc.invalidateQueries(SHOP_KEY);
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
        qc.invalidateQueries(SHOP_KEY);
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
  return useMutation<{ shopId: string }, Error, string>(
    async (shopId: string) => {
      const { data } = await postDeleteShop(shopId);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOP_KEY);
      }
    }
  );
};

export const useDeleteMachinery = () => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, string>(
    async (machineryId: string) => {
      return await postDeleteMachinery(machineryId);
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

export const useDeleteCalendar = () => {
  const qc = useQueryClient();
  return useMutation<{ calendarId: string }, Error, string>(
    async (calendarId: string) => {
      const { data } = await postDeleteCalendar(calendarId);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(CALENDAR_KEY);
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

export const useFilterEvents = (filterArgs: FilterArgs) => {
  return useQuery<Event[], Error>({
    queryKey: [FILTER_EVENTS_KEY, filterArgs],
    queryFn: async () => {
      const { data } = await postFilterEvents(filterArgs);
      return data;
    },
    staleTime: 1000 * 60
  });
};
