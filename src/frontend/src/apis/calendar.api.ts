import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop } from 'shared';
import { shopTransformer } from './transformers/calendar.transformer';

const pickArray = (x: any): any[] | null => Array.isArray(x) ? x : null;

const normalizeShopsResponse = (raw: unknown): Shop[] => {
  const r = raw as any;

  // direct array
  if (pickArray(r)) return r.map(shopTransformer);

  // common wrappers
  if (r && typeof r === 'object') {
    if (pickArray(r.shops)) return r.shops.map(shopTransformer);
    if (r.data) {
      if (pickArray(r.data)) return r.data.map(shopTransformer);
      if (pickArray(r.data?.shops)) return r.data.shops.map(shopTransformer);
      if (pickArray(r.data?.items)) return r.data.items.map(shopTransformer);
      if (pickArray(r.data?.results)) return r.data.results.map(shopTransformer);
    }
    if (pickArray(r.items)) return r.items.map(shopTransformer);
    if (pickArray(r.results)) return r.results.map(shopTransformer);
  }

  
  return [];
};

export const getAllShops = () => {
  return axios.get<Shop[]>(apiUrls.calendarShops(), {
    transformResponse: (data) => {
      try {
        const parsed = JSON.parse(data);
        return normalizeShopsResponse(parsed);
      } catch {
        return []; 
      }
    }
  });
};

export const postCreateShop = (payload: { name: string; description?: string }) => {
  return axios.post<Shop>(apiUrls.calendarCreateShop(), payload, {
    transformResponse: (data) => {
      try {
        const parsed = JSON.parse(data);
        // accept Shop or { shop } or { data: { shop } }
        const shop = (parsed?.shop ?? parsed?.data?.shop ?? parsed) as Shop;
        return shopTransformer(shop);
      } catch {
        
        return payload as unknown as Shop;
      }
    }
  });
};
