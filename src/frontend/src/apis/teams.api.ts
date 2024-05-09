/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { Team } from 'shared';
import { apiUrls } from '../utils/urls';
import { CreateTeamPayload } from '../hooks/teams.hooks';

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

export const setTeamMembers = (id: string, userIds: number[]) => {
  return axios.post<{ message: string }>(apiUrls.teamsSetMembers(id), {
    userIds
  });
};

export const setTeamDescription = (id: string, description: string) => {
  return axios.post<{ message: string }>(apiUrls.teamsSetDescription(id), {
    newDescription: description
  });
};

export const setTeamHead = (id: string, userId: number) => {
  return axios.post<Team>(apiUrls.teamsSetHead(id), {
    userId
  });
};

export const deleteTeam = (id: string) => {
  return axios.post<{ message: string }>(apiUrls.teamsDelete(id));
};

export const createTeam = (payload: CreateTeamPayload) => {
  return axios.post<Team>(apiUrls.teamsCreate(), payload);
};

export const setTeamLeads = (id: string, userIds: number[]) => {
  return axios.post<Team>(apiUrls.teamsSetLeads(id), {
    userIds
  });
};
