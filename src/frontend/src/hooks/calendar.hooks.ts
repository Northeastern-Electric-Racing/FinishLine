import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Shop, Machinery, EventType, Calendar } from 'shared';
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
  getAllEventTypes,
  postCreateEventType,
  postEditEventType,
  getAllCalendars,
  postCreateCalendar,
  postEditCalendar
} from '../apis/calendar.api';

export const MACHINERY_KEY = ['machinery'] as const;
const SHOP_KEY = ['shops'] as const;
export const EVENT_TYPE_KEY = ['event-types'] as const;

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

export const useAllEventTypes = () =>
  useQuery<EventType[], Error>(EVENT_TYPE_KEY, async () => {
    const res = await getAllEventTypes();
    return res.data;
  });

export const useCreateEventType = () => {
  const qc = useQueryClient();
  return useMutation<
    EventType,
    Error,
    {
      name: string;
      calendarIds: string[];
      initialDateScheduled: boolean;
      allDay: boolean;
      recurring: boolean;
      requiredMembers: boolean;
      optionalMembers: boolean;
      teams: boolean;
      location: boolean;
      zoomLink: boolean;
      shop: boolean;
      machinery: boolean;
      workPackage: boolean;
      questionDocument: boolean;
      documents: boolean;
      description: boolean;
      onlyHeadsOrAbove: boolean;
      requiresConfirmation: boolean;
    }
  >(
    async (payload) => {
      const { data } = await postCreateEventType(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(EVENT_TYPE_KEY);
      }
    }
  );
};

export const useEditEventType = (eventTypeId: string) => {
  const qc = useQueryClient();
  return useMutation<
    EventType,
    Error,
    {
      name: string;
      calendarIds: string[];
      initialDateScheduled: boolean;
      allDay: boolean;
      recurring: boolean;
      requiredMembers: boolean;
      optionalMembers: boolean;
      teams: boolean;
      location: boolean;
      zoomLink: boolean;
      shop: boolean;
      machinery: boolean;
      workPackage: boolean;
      questionDocument: boolean;
      documents: boolean;
      description: boolean;
      onlyHeadsOrAbove: boolean;
      requiresConfirmation: boolean;
    }
  >(
    async (payload) => {
      const { data } = await postEditEventType(eventTypeId, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(EVENT_TYPE_KEY);
      }
    }
  );
};
