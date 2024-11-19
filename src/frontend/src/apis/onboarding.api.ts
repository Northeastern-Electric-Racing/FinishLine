import { Checklist } from 'shared';
import { apiUrls } from '../utils/urls';
import axios from '../utils/axios';

export const getAllChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.allChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
