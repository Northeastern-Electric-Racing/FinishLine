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

export const postDeleteShop = async (name: string) => {
  return axios.post<Shop>(apiUrls.calendarDeleteShop(name))
}