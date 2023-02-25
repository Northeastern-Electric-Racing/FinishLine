/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQueryClient } from 'react-query';
import { WbsNumber } from 'shared';
import { createSingleTask, editSingleTaskStatus } from '../apis/tasks.api';

export const useCreateTask = (wbsNum: WbsNumber) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['tasks'],
    async (createSingleTaskPayload: any) => {
      const { data } = await createSingleTask(wbsNum, createSingleTaskPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects', 'tasks']);
      }
    }
  );
};

export const useSetTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['tasks', 'edit-status'],
    async (editStatusTaskPayload: any) => {
      const { data } = await editSingleTaskStatus(editStatusTaskPayload.taskId, editStatusTaskPayload.status);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects', 'tasks']);
      }
    }
  );
};
