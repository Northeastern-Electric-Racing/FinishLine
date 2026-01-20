/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProjectRule, Rule as SharedRule, RuleCompletion, Ruleset, RulesetType } from 'shared';
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
  parseRuleset,
  uploadRulesetFile,
  getRulesetsByRulesetType,
  deleteRule,
  editRule,
  updateRuleset,
  deleteRuleset,
  deleteRulesetType,
  createRuleset,
  getRulesetById,
  createRule,
  getSingleRuleset,
  getRulesetType
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
  return useQuery<SharedRule[], Error>(
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
  return useQuery<SharedRule[], Error>(
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
  return useQuery<SharedRule[], Error>(
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

/**
 * Hook to get a ruleset by ID.
 * (Kept because some parts of the app may still call getRulesetById)
 */
export const useGetRuleset = (rulesetId: string) => {
  return useQuery<Ruleset, Error>(
    ['ruleset', rulesetId],
    async () => {
      const { data } = await getRulesetById(rulesetId);
      return data;
    },
    { enabled: !!rulesetId }
  );
};

/**
 * Hook to get a single ruleset by ID (kept for compatibility with feature branch usage)
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

/**
 * Hook to toggle multiple rule-team assignments in bulk
 * Processes each toggle sequentially and returns aggregate results
 */
export const useBulkToggleRuleTeam = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<
    { successful: number; failed: number; errors: string[] },
    Error,
    Array<{ ruleId: string; teamId: string }>
  >(
    ['rules', 'bulk-toggle-team'],
    async (toggles) => {
      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const { ruleId, teamId } of toggles) {
        try {
          await toggleRuleTeam(ruleId, teamId);
          successful++;
        } catch (error) {
          failed++;
          errors.push(`Failed to toggle rule ${ruleId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { successful, failed, errors };
    },
    {
      onSuccess: (result) => {
        queryClient.invalidateQueries(['rules']);

        if (result.failed > 0) {
          toast.error(`${result.failed} assignment(s) failed to save. ${result.successful} succeeded.`);
        } else if (result.successful > 0) {
          toast.success(`Successfully saved ${result.successful} assignment change(s)`);
        }
      },
      onError: (error: Error) => {
        toast.error(`Failed to save assignments: ${error.message}`);
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

/**
 * React Query hook to edit a rule's content
 */
export const useEditRule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<SharedRule, Error, { ruleId: string; ruleContent: string }>(
    ['rules', 'edit'],
    async ({ ruleId, ruleContent }) => {
      const { data } = await editRule(ruleId, ruleContent);
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Rule updated successfully');
        queryClient.invalidateQueries(['rules']);
        queryClient.invalidateQueries(['rulesets']);
      },
      onError: (error: Error) => {
        toast.error(`Failed to update rule: ${error.message}`);
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

export const useRulesetType = (rulesetTypeId: string) => {
  return useQuery<RulesetType, Error>(['rulesetType', rulesetTypeId], async () => {
    const { data } = await getRulesetType(rulesetTypeId);
    return data;
  });
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
 * Helper function to recursively fetch all child rules
 */
const fetchAllChildRules = async (rule: SharedRule, allRules: SharedRule[]): Promise<void> => {
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
  return useQuery<SharedRule[], Error>(
    ['rules', 'allRules', rulesetId],
    async () => {
      const { data: topLevelRules } = await getTopLevelRules(rulesetId);
      const allRules: SharedRule[] = [...topLevelRules];

      for (const rule of topLevelRules) {
        await fetchAllChildRules(rule, allRules);
      }

      return allRules;
    },
    { enabled: !!rulesetId }
  );
};
