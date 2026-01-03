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
  createRuleset,
  getRulesetById
} from '../apis/rules.api';

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
