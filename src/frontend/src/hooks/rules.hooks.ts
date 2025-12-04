import { useMutation, useQueryClient } from 'react-query';
import { deleteRule } from '../apis/rules.api';
import { useToast } from './toasts.hooks';

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
        queryClient.invalidateQueries(['rulesets']);
      },
      onError: (error: Error) => {
        toast.error(error.message);
      }
    }
  );
};
