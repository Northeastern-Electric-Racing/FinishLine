/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { Team } from 'shared';
import { apiUrls } from '../utils/Urls';

export const getAllTeams = () => {
  return axios.get<Team[]>(apiUrls.teams(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
