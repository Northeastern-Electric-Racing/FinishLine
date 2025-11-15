import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop, Event } from 'shared';

import { FilterArgs } from 'shared';
import { filterEventsTransformer } from './transformers/calendar.transformer';

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

export const postFilterEvents = (payload: FilterArgs) => {
  return axios.post<any>(apiUrls.calendarFilterEvents(), payload, {
    transformResponse: (data) => filterEventsTransformer(JSON.parse(data) as Event[])
  });
};
