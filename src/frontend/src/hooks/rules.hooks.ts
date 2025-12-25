import { useMutation, useQueryClient } from 'react-query';
import { RulesetType, Rule as SharedRule, Ruleset } from 'shared';
import { createRulesetType, parseRuleset } from '../apis/rules.api';
import { uploadRulesetFile } from '../apis/rules.api';

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
 * @returns the fileId of the uploaded file
 */
export const useUploadRulesetFile = () => {
  return useMutation<string, Error, File>(['ruleset-file', 'upload'], async (file: File) => {
    const { data } = await uploadRulesetFile(file);
    return data;
  });
};

