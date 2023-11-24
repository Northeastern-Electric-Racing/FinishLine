/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Team } from 'shared';
import {
  getAllTeams,
  getSingleTeam,
  setTeamMembers,
  setTeamDescription,
  setTeamHead,
  deleteTeam,
  createTeam,
  setTeamLeads
} from '../apis/teams.api';

export interface CreateTeamPayload {
  teamName: string;
  headId: number;
  slackId: string;
  description: string;
}

export const useAllTeams = () => {
  return useQuery<Team[], Error>(['teams'], async () => {
    const { data } = await getAllTeams();
    return data;
  });
};
export const useSingleTeam = (teamId: string) => {
  return useQuery<Team, Error>(['teams', teamId], async () => {
    const { data } = await getSingleTeam(teamId);
    return data;
  });
};

export const useSetTeamMembers = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['teams', 'edit'],
    async (userIds: number[]) => {
      const { data } = await setTeamMembers(teamId, userIds);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};

export const useSetTeamHead = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, number>(
    ['teams', 'edit'],
    async (userId: number) => {
      const { data } = await setTeamHead(teamId, userId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};

export const useEditTeamDescription = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['teams', 'edit'],
    async (description: string) => {
      const { data } = await setTeamDescription(teamId, description);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['teams', 'delete'],
    async (teamId: string) => {
      const { data } = await deleteTeam(teamId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, CreateTeamPayload>(
    ['teams', 'create'],
    async (formData: CreateTeamPayload) => {
      const { data } = await createTeam(formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};

export const useSetTeamLeads = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, any>(
    ['teams', 'edit'],
    async (userIds: number[]) => {
      const { data } = await setTeamLeads(teamId, userIds);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};
