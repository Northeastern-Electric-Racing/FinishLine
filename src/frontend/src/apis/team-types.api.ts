/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const setTeamType = (id: string, teamTypeId: string) => {
  return axios.post<{ message: string }>(apiUrls.teamsSetTeamType(id), {
    teamTypeId
  });
};
