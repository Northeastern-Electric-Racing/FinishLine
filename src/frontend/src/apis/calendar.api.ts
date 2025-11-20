import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop, Machinery, Calendar } from 'shared';

export const getAllCalendars = () => {
  return axios.get<Calendar[]>(apiUrls.calendarCalendars(), {
    transformResponse: (data) => JSON.parse(data) as Calendar[]
  });
};

export const postCreateCalendar = (payload: { name: string; description: string; color: string }) => {
  return axios.post<Calendar>(apiUrls.calendarCreateCalendar(), payload, {
    transformResponse: (data) => JSON.parse(data) as Calendar
  });
};

export const postEditCalendar = (calendarId: string, payload: { name: string; description: string; color: string }) => {
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
