/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { Team } from 'shared';
import { getAllTeams } from '../apis/teams.api';

export const useAllTeams = () => {
  return useQuery<Team[], Error>(['temas'], async () => {
    const { data } = await getAllTeams();
    return data;
  });
};
