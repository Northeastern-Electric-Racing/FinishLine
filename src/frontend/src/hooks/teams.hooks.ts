/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { Team } from 'shared';
import { getAllTeams, getSingleTeam } from '../apis/teams.api';

export const useAllTeams = () => {
  return useQuery<Team[], Error>(['temas'], async () => {
    const { data } = await getAllTeams();
    return data;
  });
};
export const useSingleTeam = (teamId: string) => {
  return useQuery<Team, Error>(['temas', teamId], async () => {
    const { data } = await getSingleTeam(teamId);
    return data;
  });
};
