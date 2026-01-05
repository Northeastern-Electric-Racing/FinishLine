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
  getAllRulesetTypes,
  getRulesetsByRulesetType,
  deleteRule,
  updateRuleset,
  deleteRuleset,
  deleteRulesetType,
  getRulesetById,
  createRule
} from '../apis/rules.api';
import { useToast } from './toasts.hooks';

interface CreateRulesetTypePayload {
  name: string;
}

export interface CreateRulePayload {
  ruleCode: string;
  ruleContent: string;
  rulesetId: string;
  parentRuleId?: string;
  referencedRules?: string[];
  imageFileIds?: string[];
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
 * Custom React Hook to create a new rule
 */
export const useCreateRule = () => {
  const queryClient = useQueryClient();
  return useMutation<SharedRule, Error, CreateRulePayload>(
    ['rules', 'create'],
    async (payload: CreateRulePayload) => {
      const { data } = await createRule(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules']);
        queryClient.invalidateQueries(['ruleset']);
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
