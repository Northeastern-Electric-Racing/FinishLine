import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop } from 'shared';

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

export const editShop = (shopId: string, payload: { name: string; description: string }) => {
  return axios.post<Shop>(apiUrls.calendarEditShop(shopId), payload, {
    transformResponse: (data) => JSON.parse(data) as Shop
  });
};
