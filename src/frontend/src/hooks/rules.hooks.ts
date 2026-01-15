/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Rule as SharedRule, Ruleset, RulesetType } from 'shared';
import {
  getTopLevelRules,
  getChildRules,
  toggleRuleTeam,
  getTeamRulesInRulesetType,
  createRulesetType,
  parseRuleset,
  uploadRulesetFile,
  getAllRulesetTypes,
  getRulesetsByRulesetType,
  updateRuleset,
  deleteRuleset,
  deleteRulesetType,
  createRuleset,
  getRulesetById,
  getProjectRulesInRuleset,
  getUnassignedTeamRulesInRuleset,
  deleteRule
} from '../apis/rules.api';
import { useToast } from './toasts.hooks';

interface CreateRulesetTypePayload {
  name: string;
}

export interface ParseRulesetPayload {
  rulesetId: string;
  fileId: string;
  parserType: 'FSAE' | 'FHE';
}

export interface CreateRulesetPayload {
  fileId: string;
  name: string;
  rulesetTypeId: string;
  carNumber: number;
  active: boolean;
}

export const useGetTopLevelRules = (rulesetId: string) => {
  return useQuery<SharedRule[], Error>(['rules', 'top-level', rulesetId], async () => {
    const { data } = await getTopLevelRules(rulesetId);
    return data;
  });
};

export const useGetChildRules = (ruleId: string, enabled: boolean = true) => {
  return useQuery<SharedRule[], Error>(
    ['rules', 'children', ruleId],
    async () => {
      const { data } = await getChildRules(ruleId);
      return data;
    },
    {
      enabled // only fetch when true
    }
  );
};

export const useGetRuleset = (rulesetId: string) => {
  return useQuery<Ruleset, Error>(['ruleset', rulesetId], async () => {
    const { data } = await getRulesetById(rulesetId);
    return data;
  });
};

export const useToggleRuleTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<SharedRule, Error, { ruleId: string; teamId: string }>(
    ['rules', 'toggle-team'],
    async ({ ruleId, teamId }) => {
      const { data } = await toggleRuleTeam(ruleId, teamId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules']);
      }
    }
  );
};

export const useGetTeamRulesInRulesetType = (rulesetTypeId: string, teamId: string) => {
  return useQuery<SharedRule[], Error>(['rules', 'team-rules', rulesetTypeId, teamId], async () => {
    const { data } = await getTeamRulesInRulesetType(rulesetTypeId, teamId);
    return data;
  });
};

export const useGetTeamRulesInRuleset = (rulesetId: string, teamId: string) => {
  return useQuery<SharedRule[], Error>(['rules', 'team-rules', rulesetId, teamId], async () => {
    // TODO
  });
};

export const useGetProjectRulesInRuleset = (rulesetId: string, projectId: string) => {
  return useQuery<SharedRule[], Error>(
    ['rules', 'project-rules', rulesetId, projectId], 
    async () => {
      const { data } = await getProjectRulesInRuleset(rulesetId, projectId);
      return data;
    }
  );
};

export const useGetUnassignedTeamRulesInRuleset = (rulesetId: string, teamId: string) => {
  return useQuery<SharedRule[], Error>(
    ['rules', 'unassigned-team-rules', rulesetId, teamId], 
    async () => {
      const { data } = await getUnassignedTeamRulesInRuleset(rulesetId, teamId);
      return data;
    }
  );
};

/**
 * Custom React Hook to create a new ruleset type
 */
export const useCreateRulesetType = () => {
  const queryClient = useQueryClient();
  return useMutation<RulesetType, Error, CreateRulesetTypePayload>(
    ['rulesetTypes', 'create'],
    async (payload: CreateRulesetTypePayload) => {
      const { data } = await createRulesetType(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rulesetTypes']);
      }
    }
  );
};

/**
 * React Query hook to fetch all Ruleset Types.
 *
 * @returns Query result containing Ruleset Types data, loading state, and error state.
 */
export const useAllRulesetTypes = () => {
  return useQuery<RulesetType[], Error>(['rulesetTypes'], async () => {
    const { data } = await getAllRulesetTypes();
    return data;
  });
};

/**
 * React Query hook to fetch all Rulesets for a specific Ruleset Type.
 *
 * @param rulesetTypeId The ID of the ruleset type.
 * @returns Query result containing Rulesets data, loading state, and error state.
 */
export const useRulesetsByType = (rulesetTypeId: string) => {
  return useQuery<Ruleset[], Error>(['rulesets', rulesetTypeId], async () => {
    const { data } = await getRulesetsByRulesetType(rulesetTypeId);
    return data;
  });
};

export const useUpdateRuleset = () => {
  const queryClient = useQueryClient();
  return useMutation<Ruleset, Error, { rulesetId: string; name: string; isActive: boolean }>(
    async ({ rulesetId, name, isActive }) => {
      const { data } = await updateRuleset(rulesetId, name, isActive);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rulesets']);
      }
    }
  );
};

export const useDeleteRuleset = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    async (rulesetId: string) => {
      await deleteRuleset(rulesetId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rulesets']);
      }
    }
  );
};

export const useDeleteRulesetType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    async (rulesetTypeId: string) => {
      await deleteRulesetType(rulesetTypeId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rulesetTypes']);
      }
    }
  );
};

export const useCreateRuleset = () => {
  const queryClient = useQueryClient();
  return useMutation<Ruleset, Error, CreateRulesetPayload>(
    ['rulesets', 'create'],
    async (payload: CreateRulesetPayload) => {
      const { data } = await createRuleset(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rulesets']);
      }
    }
  );
};

export const useParseRuleset = () => {
  const queryClient = useQueryClient();
  return useMutation<SharedRule[], Error, ParseRulesetPayload>(
    ['rulesets', 'parse'],
    async (payload: ParseRulesetPayload) => {
      const { data } = await parseRuleset(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules']);
        queryClient.invalidateQueries(['rulesets']);
      }
    }
  );
};

/**
 * Uploads a file to the drive and returns the fileId
 */
export const useUploadRulesetFile = () => {
  return useMutation<string, Error, File>(['ruleset-file', 'upload'], async (file: File) => {
    const { data } = await uploadRulesetFile(file);
    return data;
  });
};

/**
 * React Query hook to delete a rule
 */
export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<void, Error, string>(
    ['rules', 'delete'],
    async (ruleId: string) => {
      await deleteRule(ruleId);
    },
    {
      onSuccess: () => {
        toast.success('Rule deleted successfully');
        queryClient.invalidateQueries(['rules']);
        queryClient.invalidateQueries(['rulesets']);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );
};
