/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQueryClient, useMutation, useQuery } from 'react-query';
import { createTeamType, editTeamType, getAllTeamTypes, setTeamType } from '../apis/team-types.api';
import { TeamType } from 'shared';

export interface CreateTeamTypePayload {
  name: string;
  iconName: string;
  description: string;
}

/**
 * Custom react hook to get all team types
 *
 * @returns all the team types
 */
export const useAllTeamTypes = () => {
  return useQuery<TeamType[], Error>(['team types'], async () => {
    const { data } = await getAllTeamTypes();
    return data;
  });
};

/**
 * Custom react hook to create a team type
 *
 * @returns the team type created
 */
export const useCreateTeamType = () => {
  const queryClient = useQueryClient();
  return useMutation<TeamType, Error, CreateTeamTypePayload>(
    ['team types', 'create'],
    async (teamTypePayload) => {
      const { data } = await createTeamType(teamTypePayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team types']);
      }
    }
  );
};

/**
 * Custom react hook to set the team type of a team
 *
 * @param teamId id of the team to set the team type
 * @returns the updated team
 */
export const useSetTeamType = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>(
    ['team types', 'edit'],
    async (teamTypeId: string) => {
      const { data } = await setTeamType(teamId, teamTypeId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team types']);
      }
    }
  );
};

/**
 * Custome react hook to update a team type
 *
 * @param teamTypeId id of the team type to edit
 * @returns the updated team type
 */
export const useEditTeamType = (teamTypeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TeamType, Error, CreateTeamTypePayload>(
    ['team types', 'edit'],
    async (formData: CreateTeamTypePayload) => {
      const { data } = await editTeamType(teamTypeId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team types']);
      }
    }
  );
};
