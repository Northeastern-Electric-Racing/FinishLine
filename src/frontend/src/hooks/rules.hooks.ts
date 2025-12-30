/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Rule, RulesetType } from 'shared';
import {
  getTopLevelRules,
  getChildRules,
  toggleRuleTeam,
  getTeamRulesInRulesetType,
  createRulesetType
} from '../apis/rules.api';

export const useGetTopLevelRules = (rulesetId: string) => {
  return useQuery<Rule[], Error>(['rules', 'top-level', rulesetId], async () => {
    const { data } = await getTopLevelRules(rulesetId);
    return data;
  });
};

export const useGetChildRules = (ruleId: string) => {
  return useQuery<Rule[], Error>(['rules', 'children', ruleId], async () => {
    const { data } = await getChildRules(ruleId);
    return data;
  });
};

export const useToggleRuleTeam = () => {
  const queryClient = useQueryClient();
  return useMutation<Rule, Error, { ruleId: string; teamId: string }>(
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
  return useQuery<Rule[], Error>(['rules', 'team-rules', rulesetTypeId, teamId], async () => {
    const { data } = await getTeamRulesInRulesetType(rulesetTypeId, teamId);
    return data;
  });
};
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { Ruleset, RulesetType } from 'shared';
import { createRulesetType, getAllRulesetTypes, getRulesetsByRulesetType } from '../apis/rules.api';

interface CreateRulesetTypePayload {
  name: string;
}

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
