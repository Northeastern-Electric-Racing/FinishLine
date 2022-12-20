/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { Team } from 'shared';
import { apiUrls } from '../utils/urls';

export const getAllTeams = () => {
  return axios.get<Team[]>(apiUrls.teams(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const getSingleTeam = (id: string) => {
  return axios.get<Team>(apiUrls.teamsById(id), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const editSingleTeam = (id: string, payload: any) => {
  return axios.post<{ message: string }>(apiUrls.teamEdit(id), {
    ...payload
  });
};
