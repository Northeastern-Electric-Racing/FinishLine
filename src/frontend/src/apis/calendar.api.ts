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

export const postCreateMachinery = (payload: { name: string; shopId: string; quantity: number }) => {
  return axios.post<Machinery>(apiUrls.calendarCreateMachinery(), payload, {
    transformResponse: (data) => JSON.parse(data) as Machinery
  });
};

export const postEditMachinery = (payload: { machineryId: string; name: string; shopId: string; quantity: number }) => {
  return axios.post<Machinery>(apiUrls.calendarEditMachinery(payload.machineryId), payload, {
    transformResponse: (data) => JSON.parse(data) as Machinery
  });
};
