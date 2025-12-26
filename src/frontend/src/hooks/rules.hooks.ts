import { useMutation, useQueryClient } from 'react-query';
import { RulesetType } from 'shared';
import { createRulesetType } from '../apis/rules.api';

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
