/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Team, TeamType } from 'shared';
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
import { CreateTeamTypePayload } from './design-reviews.hooks';
import { editTeamType } from '../apis/team-types.api';

export interface CreateTeamPayload {
  teamName: string;
  headId: string;
  slackId: string;
  description: string;
  isFinanceTeam: boolean;
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
  return useMutation<{ message: string }, Error, string[]>(
    ['teams', 'edit'],
    async (userIds: string[]) => {
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
  return useMutation<Team, Error, string>(
    ['teams', 'edit'],
    async (userId: string) => {
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
  return useMutation<{ message: string }, Error, string>(
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
  return useMutation<{ message: string }, Error, string>(
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
  return useMutation<Team, Error, string[]>(
    ['teams', 'edit'],
    async (userIds: string[]) => {
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

export const useEditTeamType = (teamTypeId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TeamType, Error, CreateTeamTypePayload>(
    ['team-type', 'edit'],
    async (formData: CreateTeamTypePayload) => {
      const { data } = await editTeamType(teamTypeId, formData);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team-type', 'teams']);
      }
    }
  );
};
