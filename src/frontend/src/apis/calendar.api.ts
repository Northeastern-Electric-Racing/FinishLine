import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop, Machinery, AvailabilityCreateArgs, Event, EventStatus } from 'shared';
import { eventTransformer } from './transformers/calendar.transformer';

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

export const getAllEvents = () => {
  return axios.get(apiUrls.calendarEvents(), {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};

export const deleteEvent = async (id: string) => {
  return axios.delete(apiUrls.calendarDeleteEvent(id));
};

export const setEventStatus = async (id: string, payload: { status: EventStatus }) => {
  return axios.post<Event>(apiUrls.calendarEventSetStatus(id), payload, {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};
