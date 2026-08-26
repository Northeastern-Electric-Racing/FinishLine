/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ProjectRule, Rule as SharedRule, Ruleset, RulesetType, RuleStatus, RuleStatusHistoryEntry } from 'shared';
import {
  createRulesetType,
  getAllRulesetTypes,
  getActiveRuleset,
  getProjectRules,
  getUnassignedRulesForRuleset,
  createProjectRule,
  deleteProjectRule,
  setRuleStatus,
  setProjectRuleStatus,
  getRuleStatusHistory,
  resetRulesetStatuses,
  resetProjectRuleStatuses,
  getChildRules,
  getTopLevelRules,
  getAllRulesForRuleset,
  toggleRuleTeam,
  parseRuleset,
  uploadRulesetFile,
  getRulesetsByRulesetType,
  deleteRule,
  editRule,
  addRuleReferences,
  removeRuleReferences,
  updateRuleset,
  deleteRuleset,
  deleteRulesetType,
  createRuleset,
  createRule,
  getSingleRuleset,
  getRulesetType
} from '../apis/rules.api';
import { useToast } from './toasts.hooks';
import { useGlobalCarFilter } from '../app/AppGlobalCarFilterContext';

/**
 * Hook to supply all ruleset types.
 * Revision file counts are scoped to the globally selected car.
 */
export const useAllRulesetTypes = () => {
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<RulesetType[], Error>(
    ['rules', 'rulesetTypes', selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getAllRulesetTypes();
      return data;
    }
  );
};

/**
 * Hook to get the active ruleset for a given ruleset type scoped to a car.
 * Each car can have its own active ruleset per ruleset type.
 */
export const useActiveRuleset = (rulesetTypeId: string, carNumber?: number) => {
  return useQuery<Ruleset | undefined, Error>(
    ['rules', 'activeRuleset', rulesetTypeId, carNumber],
    async () => {
      try {
        const { data } = await getActiveRuleset(rulesetTypeId, carNumber);
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
 * Hook to get rules assignable to a project, across all of its teams, that aren't already assigned.
 */
export const useUnassignedRulesForRuleset = (rulesetId: string, projectId: string) => {
  return useQuery<SharedRule[], Error>(
    ['rules', 'unassigned', rulesetId, projectId],
    async () => {
      const { data } = await getUnassignedRulesForRuleset(rulesetId, projectId);
      return data;
    },
    { enabled: !!rulesetId && !!projectId }
  );
};

interface CreateRulesetTypePayload {
  name: string;
}

export interface ParseRulesetPayload {
  rulesetId: string;
  fileId: string;
  parserType: 'FSAE' | 'FHE';
  firstRulePage?: number;
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

/**
 * Hook to get all top level rules for a given ruleset.
 */
export const useGetTopLevelRules = (rulesetId: string) => {
  return useQuery<SharedRule[], Error>(['rules', 'top-level', rulesetId], async () => {
    const { data } = await getTopLevelRules(rulesetId);
    return data;
  });
};

/**
 * Hook to get direct child rules for a given rule.
 */
export const useGetChildRules = (ruleId: string, enabled: boolean = true) => {
  return useQuery<SharedRule[], Error>(
    ['rules', 'children', ruleId],
    async () => {
      const { data } = await getChildRules(ruleId);
      return data;
    },
    {
      enabled, // only fetch when true
      refetchOnMount: false // if data is already cached, don't refetch when the component mounts
    }
  );
};

/**
 * Hook to get a rule's full status history. Only fetched when enabled is true, such as when a modal is open.
 * @param projectRuleId if provided, scopes the history to just this project rule instead of every context the rule appears in
 */
export const useRuleStatusHistory = (ruleId: string, enabled: boolean, projectRuleId?: string) => {
  return useQuery<RuleStatusHistoryEntry[], Error>(
    ['rules', 'statusHistory', ruleId, projectRuleId],
    async () => {
      const { data } = await getRuleStatusHistory(ruleId, projectRuleId);
      return data;
    },
    {
      enabled
    }
  );
};

/**
 * Hook to get a single ruleset by ID.
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
 * Hook to toggle multiple rule-team assignments in bulk.
 * Processes each toggle sequentially and returns aggregate results.
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

/**
 * Hook to reset every rule's general-view status back to Pending, for a whole ruleset.
 */
export const useResetRulesetStatuses = (rulesetId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<{ count: number }, Error, void>(
    ['rules', 'resetRulesetStatuses', rulesetId],
    async () => {
      const { data } = await resetRulesetStatuses(rulesetId);
      return data;
    },
    {
      onSuccess: ({ count }) => {
        queryClient.invalidateQueries(['rules']);
        toast.success(`Reset ${count} rule status${count === 1 ? '' : 'es'} to Pending`);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );
};

/**
 * Hook to reset every project rule's status back to Pending, for a single project scoped to a single ruleset.
 */
export const useResetProjectRuleStatuses = (rulesetId: string, projectId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<{ count: number }, Error, void>(
    ['rules', 'resetProjectRuleStatuses', rulesetId, projectId],
    async () => {
      const { data } = await resetProjectRuleStatuses(rulesetId, projectId);
      return data;
    },
    {
      onSuccess: ({ count }) => {
        queryClient.invalidateQueries(['rules']);
        toast.success(`Reset ${count} rule status${count === 1 ? '' : 'es'} to Pending`);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );
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
 * Custom React Hook to create a new rule for a given ruleset.
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
 * Hook to set a rule's general-view status. This status is independent of any project.
 */
export const useSetRuleStatus = (rulesetId: string) => {
  const queryClient = useQueryClient();
  return useMutation<SharedRule, Error, { ruleId: string; status: RuleStatus }>(
    ['rules', 'setStatus'],
    async ({ ruleId, status }) => {
      const { data } = await setRuleStatus(ruleId, status);
      return data;
    },
    {
      onSuccess: (_data, { ruleId }) => {
        queryClient.invalidateQueries(['rules', 'allRules', rulesetId]);
        queryClient.invalidateQueries(['rules', 'top-level', rulesetId]);
        queryClient.invalidateQueries(['rules', 'children']);
        queryClient.invalidateQueries(['rules', 'statusHistory', ruleId]);
      }
    }
  );
};

/**
 * Hook to set a rule's status within a single project. This status is local to that project.
 */
export const useSetProjectRuleStatus = (rulesetId: string, projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProjectRule, Error, { projectRuleId: string; status: RuleStatus }>(
    ['rules', 'setProjectRuleStatus'],
    async ({ projectRuleId, status }) => {
      const { data } = await setProjectRuleStatus(projectRuleId, status);
      return data;
    },
    {
      onSuccess: (updatedProjectRule) => {
        queryClient.invalidateQueries(['rules', 'projectRules', rulesetId, projectId]);
        queryClient.invalidateQueries(['rules', 'unassigned']);
        queryClient.invalidateQueries(['rules', 'statusHistory', updatedProjectRule.rule.ruleId]);
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
  const { selectedCar } = useGlobalCarFilter();
  return useQuery<Ruleset[], Error>(
    ['rulesets', rulesetTypeId, selectedCar === 'all-cars' ? 'all-cars' : selectedCar.id],
    async () => {
      const { data } = await getRulesetsByRulesetType(rulesetTypeId);
      return data;
    }
  );
};

/**
 * React Query hook to delete a rule.
 */
export const useDeleteRule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<void, Error, { ruleId: string; totalRulesToDelete: number }>(
    ['rules', 'delete'],
    async ({ ruleId }) => {
      await deleteRule(ruleId);
    },
    {
      onSuccess: (_data, { totalRulesToDelete }) => {
        toast.success(`${totalRulesToDelete} ${totalRulesToDelete === 1 ? 'rule' : 'rules'} deleted successfully`);
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
 * React Query hook to edit a rule's content and/or code.
 */
export const useEditRule = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<SharedRule, Error, { ruleId: string; ruleContent: string; ruleCode?: string }>(
    ['rules', 'edit'],
    async ({ ruleId, ruleContent, ruleCode }) => {
      const { data } = await editRule(ruleId, ruleContent, ruleCode);
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

/**
 * React Query hook to upload an image and attach it to a rule.
 */
export const useAddRuleImage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { mutateAsync: uploadFile } = useUploadRulesetFile();

  return useMutation<SharedRule, Error, { rule: SharedRule; file: File }>(
    ['rules', 'addImage'],
    async ({ rule, file }) => {
      const fileId = await uploadFile(file);
      const { data } = await editRule(rule.ruleId, rule.ruleContent, rule.ruleCode, [...rule.imageFileIds, fileId]);
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Image uploaded successfully');
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
 * React Query hook to remove an image from a rule.
 */
export const useRemoveRuleImage = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<SharedRule, Error, { rule: SharedRule; fileId: string }>(
    ['rules', 'removeImage'],
    async ({ rule, fileId }) => {
      const { data } = await editRule(
        rule.ruleId,
        rule.ruleContent,
        rule.ruleCode,
        rule.imageFileIds.filter((id) => id !== fileId)
      );
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Image removed successfully');
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
 * React Query hook to add referenced rules to a rule.
 */
export const useAddRuleReferences = () => {
  const queryClient = useQueryClient();

  return useMutation<SharedRule, Error, { ruleId: string; referencedRuleId: string }>(
    ['rules', 'addReference'],
    async ({ ruleId, referencedRuleId }) => {
      const { data } = await addRuleReferences(ruleId, referencedRuleId);
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
 * React Query hook to remove referenced rules from a rule.
 */
export const useRemoveRuleReferences = () => {
  const queryClient = useQueryClient();

  return useMutation<SharedRule, Error, { ruleId: string; referencedRuleId: string }>(
    ['rules', 'removeReference'],
    async ({ ruleId, referencedRuleId }) => {
      const { data } = await removeRuleReferences(ruleId, referencedRuleId);
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
 * React Query hook to update a ruleset.
 */
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
        queryClient.invalidateQueries(['rules', 'rulesetTypes']);
      }
    }
  );
};

/**
 * React Query hook to delete a ruleset.
 */
export const useDeleteRuleset = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    async (rulesetId: string) => {
      await deleteRuleset(rulesetId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rulesets']);
        queryClient.invalidateQueries(['rules', 'rulesetTypes']);
      }
    }
  );
};

/**
 * React Query hook to delete a ruleset type.
 */
export const useDeleteRulesetType = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>(
    async (rulesetTypeId: string) => {
      await deleteRulesetType(rulesetTypeId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['rules', 'rulesetTypes']);
      }
    }
  );
};

/**
 * Hook to get a single ruleset type by ID.
 */
export const useRulesetType = (rulesetTypeId: string) => {
  return useQuery<RulesetType, Error>(['rulesetType', rulesetTypeId], async () => {
    const { data } = await getRulesetType(rulesetTypeId);
    return data;
  });
};

/**
 * Hook to create a new ruleset.
 */
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
        queryClient.invalidateQueries(['rules', 'rulesetTypes']);
      }
    }
  );
};

/**
 * Parses an uploaded file and returns the parsed rules.
 */
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
 * Uploads a file to the drive and returns the fileId.
 */
export const useUploadRulesetFile = () => {
  return useMutation<string, Error, File>(['ruleset-file', 'upload'], async (file: File) => {
    const { data } = await uploadRulesetFile(file);
    return data;
  });
};

/**
 * Hook to get every rule in a ruleset (top-level and all descendants) in a single request.
 */
export const useAllRulesForRuleset = (rulesetId: string, enabled: boolean = true) => {
  return useQuery<SharedRule[], Error>(
    ['rules', 'allRules', rulesetId],
    async () => {
      const { data } = await getAllRulesForRuleset(rulesetId);
      return data;
    },
    { enabled: !!rulesetId && enabled }
  );
};

/**
 * Loads the full rule tree, for actions like "Expand All" that need every rule at once.
 */
export const useFetchFullRuleTree = (rulesetId: string) => {
  const queryClient = useQueryClient();

  return useCallback(async (): Promise<SharedRule[]> => {
    const allRules = await queryClient.fetchQuery(['rules', 'allRules', rulesetId], async () => {
      const { data } = await getAllRulesForRuleset(rulesetId);
      return data;
    });

    // Build a map of parentId -> children for all rules in this ruleset
    const childrenByParentId = new Map<string, SharedRule[]>();
    allRules.forEach((rule) => {
      const parentId = rule.parentRule?.ruleId;
      if (!parentId) return;
      const siblings = childrenByParentId.get(parentId) ?? [];
      siblings.push(rule);
      childrenByParentId.set(parentId, siblings);
    });

    allRules
      .filter((rule) => rule.subRuleIds.length > 0)
      .forEach((rule) => {
        queryClient.setQueryData(['rules', 'children', rule.ruleId], childrenByParentId.get(rule.ruleId) ?? []);
      });

    return allRules;
  }, [queryClient, rulesetId]);
};
