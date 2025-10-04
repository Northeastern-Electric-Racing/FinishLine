import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop } from 'shared';
import { shopTransformer } from './transformers/calendar.transformer';

export const getShops = () =>
  axios.get<Shop[]>(apiUrls.calendarShops(), {
    transformResponse: (data) => JSON.parse(data).map(shopTransformer)
  });

export const createShop = (payload: { name: string; description?: string }) =>
  axios.post<Shop>(apiUrls.calendarCreateShop(), payload, {
    transformResponse: (data) => shopTransformer(JSON.parse(data))
  });

export const deleteShop = (shopId: string) =>
  axios.delete<Shop>(apiUrls.calendarDeleteShop(shopId), {
    transformResponse: (data) => shopTransformer(JSON.parse(data))
  });
