import { Checklist } from 'shared';
import { apiUrls } from '../utils/urls';
import axios from '../utils/axios';

export const getAllChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.allChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const getGeneralChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.generalChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const getUsersChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.usersTeamTypeChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
