import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  Shop,
  Machinery,
  EventType,
  AvailabilityCreateArgs,
  Event,
  EventStatus,
  EventTypeCreateArgs,
  Calendar,
  FilterArgs
} from 'shared';
import { eventTransformer } from './transformers/calendar.transformer';

export const getAllCalendars = () => {
  return axios.get<Calendar[]>(apiUrls.calendarCalendars(), {
    transformResponse: (data) => JSON.parse(data) as Calendar[]
  });
};

export const postCreateCalendar = (payload: { name: string; description: string; colorHexCode: string }) => {
  return axios.post<Calendar>(apiUrls.calendarCreateCalendar(), payload, {
    transformResponse: (data) => JSON.parse(data) as Calendar
  });
};

export const postEditCalendar = (
  calendarId: string,
  payload: { name: string; description: string; colorHexCode: string }
) => {
  return axios.post<Calendar>(apiUrls.calendarEditCalendar(calendarId), payload, {
    transformResponse: (data) => JSON.parse(data) as Calendar
  });
};

export const getAllShops = () => {
  return axios.get<Shop[]>(apiUrls.calendarShops(), {
    transformResponse: (data) => JSON.parse(data) as Shop[]
  });
};

export const postCreateShop = (payload: { name: string; description: string }) => {
  return axios.post<Shop>(apiUrls.calendarCreateShop(), payload, {
    transformResponse: (data) => JSON.parse(data) as Shop
  });
};

export const postDeleteShop = async (id: string) => {
  return axios.post<Shop>(apiUrls.calendarDeleteShop(id));
};

export const getAllMachinery = () => {
  return axios.get<Machinery[]>(apiUrls.calendarMachinery(), {
    transformResponse: (data) => JSON.parse(data) as Machinery[]
  });
};

export const postCreateMachinery = async (payload: { machineName: string }) => {
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarCreateMachinery(),
    { name: payload.machineName },
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postEditMachinery = async (payload: { machineryId: string; name: string }) => {
  const { machineryId, name } = payload;
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarEditMachinery(machineryId),
    { name },
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postDeleteMachinery = async (machineryId: string) => {
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarDeleteMachinery(machineryId),
    {},
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postAddMachineryToShop = async (payload: {
  machineryId: string;
  shopId: string;
  quantity: number;
  originalShopId?: string;
}) => {
  const { machineryId, ...body } = payload;
  const { data } = await axios.post<Machinery>(apiUrls.calendarAddMachineryToShop(machineryId), body, {
    transformResponse: (data) => JSON.parse(data) as Machinery
  });
  return data;
};

export const editShop = (shopId: string, payload: { name: string; description: string }) => {
  return axios.post<Shop>(apiUrls.calendarEditShop(shopId), payload, {
    transformResponse: (data) => JSON.parse(data) as Shop
  });
};

export const markUserConfirmed = async (id: string, payload: { availability: AvailabilityCreateArgs[] }) => {
  return axios.post<Event>(apiUrls.calendarEventMarkUserConfirmed(id), payload);
};

export const getSingleEvent = async (id: string) => {
  return axios.get(apiUrls.calendarGetSingleEvent(id), {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const postCreateEventType = (payload: EventTypeCreateArgs) => {
  return axios.post<EventType>(apiUrls.calendarCreateEventType(), payload, {
    transformResponse: (data) => JSON.parse(data) as EventType
  });
};

export const postEditEventType = (eventTypeId: string, payload: EventTypeCreateArgs) => {
  return axios.post<EventType>(apiUrls.calendarEditEventType(eventTypeId), payload, {
    transformResponse: (data) => JSON.parse(data) as EventType
  });
};

export const getAllEvents = () => {
  return axios.get(apiUrls.calendarEvents(), {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};

export const postFilterEvents = (payload: FilterArgs) => {
  return axios.post<Event[]>(apiUrls.calendarFilterEvents(), payload, {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};

export const deleteEvent = async (id: string) => {
  return axios.delete(apiUrls.calendarDeleteEvent(id));
};

export const getAllEventTypes = () => {
  return axios.get<EventType[]>(apiUrls.calendarEventTypes(), {
    transformResponse: (data) => JSON.parse(data) as EventType[]
  });
};

export const setEventStatus = async (id: string, payload: { status: EventStatus }) => {
  return axios.post<Event>(apiUrls.calendarEventSetStatus(id), payload, {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const postDeleteCalendar = async (id: string) => {
  return axios.post<Calendar>(apiUrls.calendarDeleteCalendar(id));
};
