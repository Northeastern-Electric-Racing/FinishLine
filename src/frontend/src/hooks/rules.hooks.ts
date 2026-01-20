/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Rule as SharedRule, Ruleset, RulesetType, ProjectRule, RuleCompletion } from 'shared';
import {
  createRulesetType,
  getAllRulesetTypes,
  getActiveRuleset,
  getProjectRules,
  getUnassignedRulesForRuleset,
  createProjectRule,
  deleteProjectRule,
  editProjectRuleStatus,
  getChildRules,
  getTopLevelRules,
  toggleRuleTeam,
  getTeamRulesInRulesetType,
  getRulesetsByRulesetType,
  deleteRule,
  updateRuleset,
  deleteRuleset,
  deleteRulesetType,
  getRulesetById,
  createRule
  getSingleRuleset
} from '../apis/rules.api';
import { useToast } from './toasts.hooks';

/**
 * Hook to supply all ruleset types.
 */
export const useAllRulesetTypes = () => {
  return useQuery<RulesetType[], Error>(['rules', 'rulesetTypes'], async () => {
    const { data } = await getAllRulesetTypes();
    return data;
  });
};

/**
 * Hook to get the active ruleset for a given ruleset type.
 */
export const useActiveRuleset = (rulesetTypeId: string) => {
  return useQuery<Ruleset | undefined, Error>(
    ['rules', 'activeRuleset', rulesetTypeId],
    async () => {
      try {
        const { data } = await getActiveRuleset(rulesetTypeId);
        return data;
      } catch {
        // Return undefined if no active ruleset exists
        return undefined;
      }
    },
    { enabled: !!rulesetTypeId }
  );
};

/**
 * Hook to get all project rules for a given ruleset and project.
 */
export const useProjectRules = (rulesetId: string, projectId: string) => {
  return useQuery<ProjectRule[], Error>(
    ['rules', 'projectRules', rulesetId, projectId],
    async () => {
      const { data } = await getProjectRules(rulesetId, projectId);
      return data;
    },
    { enabled: !!rulesetId && !!projectId }
  );
};

/**
 * Hook to get unassigned rules for a ruleset and team.
 */
export const useUnassignedRulesForRuleset = (rulesetId: string, teamId: string) => {
  return useQuery<Rule[], Error>(
    ['rules', 'unassigned', rulesetId, teamId],
    async () => {
      const { data } = await getUnassignedRulesForRuleset(rulesetId, teamId);
      return data;
    },
    { enabled: !!rulesetId && !!teamId }
  );
};

/**
 * Hook to get child rules of a rule.
 */
export const useChildRules = (ruleId: string) => {
  return useQuery<Rule[], Error>(
    ['rules', 'children', ruleId],
    async () => {
      const { data } = await getChildRules(ruleId);
      return data;
    },
    { enabled: !!ruleId }
  );
};

/**
 * Hook to get top-level rules for a ruleset.
 */
export const useTopLevelRules = (rulesetId: string) => {
  return useQuery<Rule[], Error>(
    ['rules', 'topLevel', rulesetId],
    async () => {
      const { data } = await getTopLevelRules(rulesetId);
      return data;
    },
    { enabled: !!rulesetId }
  );
};

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
 * Hook to create a new ruleset type.
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
        queryClient.invalidateQueries(['rules', 'rulesetTypes']);
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
 * Hook to create a project rule (assign a rule to a project).
 */
export const useCreateProjectRule = () => {
  const queryClient = useQueryClient();
  return useMutation<ProjectRule, Error, { ruleId: string; projectId: string }>(
    ['rules', 'projectRules', 'create'],
    async ({ ruleId, projectId: pId }) => {
      const { data } = await createProjectRule(ruleId, pId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules', 'projectRules']);
        queryClient.invalidateQueries(['rules', 'unassigned']);
      }
    }
  );
};

/**
 * Hook to delete a project rule.
 */
export const useDeleteProjectRule = (rulesetId: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProjectRule, Error, string>(
    ['rules', 'projectRules', 'delete'],
    async (projectRuleId: string) => {
      const { data } = await deleteProjectRule(projectRuleId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules', 'projectRules', rulesetId, projectId]);
        queryClient.invalidateQueries(['rules', 'unassigned']);
      }
    }
  );
};

/**
 * Hook to update project rule status.
 */
export const useEditProjectRuleStatus = (rulesetId: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProjectRule, Error, { projectRuleId: string; newStatus: RuleCompletion }>(
    ['rules', 'projectRules', 'editStatus'],
    async ({ projectRuleId, newStatus }) => {
      const { data } = await editProjectRuleStatus(projectRuleId, newStatus);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules', 'projectRules', rulesetId, projectId]);
      }
    }
  );
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

/**
 * Hook to get a single ruleset by ID
 */
export const useSingleRuleset = (rulesetId: string) => {
  return useQuery<Ruleset, Error>(
    ['rules', 'ruleset', rulesetId],
    async () => {
      const { data } = await getSingleRuleset(rulesetId);
      return data;
    },
    { enabled: !!rulesetId }
  );
};

/**
 * Helper function to recursively fetch all child rules
 */
const fetchAllChildRules = async (rule: Rule, allRules: Rule[]): Promise<void> => {
  if (rule.subRuleIds.length === 0) return;

  const { data: children } = await getChildRules(rule.ruleId);
  allRules.push(...children);

  for (const child of children) {
    await fetchAllChildRules(child, allRules);
  }
};

/**
 * Hook to get all rules for a ruleset by fetching top-level rules
 * and recursively fetching all children
 */
export const useAllRulesForRuleset = (rulesetId: string) => {
  return useQuery<Rule[], Error>(
    ['rules', 'allRules', rulesetId],
    async () => {
      const { data: topLevelRules } = await getTopLevelRules(rulesetId);
      const allRules: Rule[] = [...topLevelRules];

      for (const rule of topLevelRules) {
        await fetchAllChildRules(rule, allRules);
      }

      return allRules;
    },
    { enabled: !!rulesetId }
  );
};
