/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamType } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { CreateTeamTypePayload } from '../hooks/team-types.hooks';

export const getAllTeamTypes = () => {
  return axios.get(apiUrls.allTeamTypes(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const setTeamType = (id: string, teamTypeId: string) => {
  return axios.post<{ message: string }>(apiUrls.teamsSetTeamType(id), {
    teamTypeId
  });
};

export const createTeamType = async (payload: CreateTeamTypePayload) => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('iconName', payload.iconName);
  formData.append('description', payload.description);
  if (payload.image) {
    formData.append('image', payload.image);
  }
  return axios.post<TeamType>(apiUrls.teamTypesCreate(), formData);
};

export const editTeamType = (id: string, payload: CreateTeamTypePayload) => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('iconName', payload.iconName);
  formData.append('description', payload.description);
  if (payload.image) {
    formData.append('image', payload.image);
  }
  return axios.post<TeamType>(apiUrls.teamTypeEdit(id), formData);
};
