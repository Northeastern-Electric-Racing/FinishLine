/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Team, TeamBase, TeamJoinRequest, TeamPreview } from 'shared';
import {
  getAllTeams,
  getSingleTeam,
  setTeamMembers,
  setTeamDescription,
  setTeamHead,
  deleteTeam,
  createTeam,
  setTeamLeads,
  archiveTeam,
  getAllArchivedTeams,
  getUsersTeams,
  setTeamSlackId,
  getMyTeamAsHead,
  getAllTeamPreviews,
  getMyTeamJoinRequests,
  getPendingTeamJoinRequests,
  createTeamJoinRequest,
  reviewTeamJoinRequest
} from '../apis/teams.api';

export interface CreateTeamPayload {
  teamName: string;
  headId: string;
  slackId: string;
  description: string;
  isFinanceTeam: boolean;
}

export const useAllTeamPreviews = () => {
  return useQuery<TeamBase[], Error>(['teams'], async () => {
    const { data } = await getAllTeamPreviews();
    return data;
  });
};

export const useAllTeams = () => {
  return useQuery<TeamPreview[], Error>(['teams', false], async () => {
    const { data } = await getAllTeams();
    return data;
  });
};

export const useAllArchivedTeams = () => {
  return useQuery<TeamPreview[], Error>(['teams', true], async () => {
    const { data } = await getAllArchivedTeams();
    return data;
  });
};

export const useSingleTeam = (teamId: string) => {
  return useQuery<Team, Error>(['teams', teamId], async () => {
    const { data } = await getSingleTeam(teamId);
    return data;
  });
};

export const useGetUsersTeams = () => {
  return useQuery<Team[], Error>(['teams', true], async () => {
    const { data } = await getUsersTeams();
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

export const useArchiveTeam = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Team, Error, string>(
    ['teams', 'edit'],
    async () => {
      const { data } = await archiveTeam(teamId);
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

export const useEditTeamSlackId = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TeamPreview, Error, string>(
    ['teams', 'edit'],
    async (slackId: string) => {
      const { data } = await setTeamSlackId(teamId, slackId);
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

export const useMyTeamAsHead = () => {
  return useQuery<string | undefined, Error>(['teams', 'as-head'], async () => {
    const { data } = await getMyTeamAsHead();
    return data;
  });
};

export const useMyTeamJoinRequests = () => {
  return useQuery<TeamJoinRequest[], Error>(['teams', 'join-requests', 'mine'], async () => {
    const { data } = await getMyTeamJoinRequests();
    return data;
  });
};

export const usePendingTeamJoinRequests = (teamId: string) => {
  return useQuery<TeamJoinRequest[], Error>(['teams', 'join-requests', teamId], async () => {
    const { data } = await getPendingTeamJoinRequests(teamId);
    return data;
  });
};

export const useCreateTeamJoinRequest = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<TeamJoinRequest, Error, void>(
    ['teams', 'join-requests', 'create'],
    async () => {
      const { data } = await createTeamJoinRequest(teamId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};

export interface ReviewTeamJoinRequestPayload {
  teamJoinRequestId: string;
  approved: boolean;
  denialReason?: string;
}

export const useReviewTeamJoinRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<TeamJoinRequest, Error, ReviewTeamJoinRequestPayload>(
    ['teams', 'join-requests', 'review'],
    async ({ teamJoinRequestId, approved, denialReason }: ReviewTeamJoinRequestPayload) => {
      const { data } = await reviewTeamJoinRequest(teamJoinRequestId, approved, denialReason);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['teams']);
      }
    }
  );
};
