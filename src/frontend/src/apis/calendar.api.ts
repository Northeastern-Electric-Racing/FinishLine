import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop, Machinery } from 'shared';

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

export const postCreateMachinery = async (payload: { machineName: string; shopId: string; quantity: number }) => {
  const { machineName, ...rest } = payload;
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarCreateMachinery(),
    { name: machineName, ...rest },
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postEditMachinery = async (payload: {
  machineryId: string;
  name: string;
  shopId: string;
  quantity: number;
  originalShopId: string;
  shopMachineryId: string;
}) => {
  const { machineryId, ...body } = payload;
  const { data } = await axios.post<Machinery>(apiUrls.calendarEditMachinery(machineryId), body, {
    transformResponse: (data) => JSON.parse(data) as Machinery
  });
  return data;
};
