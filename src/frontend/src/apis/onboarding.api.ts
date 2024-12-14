import { Checklist } from 'shared';
import { apiUrls } from '../utils/urls';
import axios from '../utils/axios';

/**
 * API call to fetch all the checklists
 */
export const getAllChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.allChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * API call to fetch the general checklists
 */
export const getGeneralChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.generalChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

/**
 * API call to fetch all the users checklists
 */
export const getUsersChecklists = () => {
  return axios.get<Checklist[]>(apiUrls.usersTeamTypeChecklists(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
