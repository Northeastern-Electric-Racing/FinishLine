/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQueryClient, useMutation } from 'react-query';
import { TaskPriority } from 'shared';
import { editTask, editSingleTaskStatus, editTaskAssignees } from '../apis/tasks.api';

interface TaskPayload {
  taskId: string;
  notes: string;
  title: string;
  deadline: Date;
  priority: TaskPriority;
  assignees: number[];
}

/**
 * Custom React Hook for editing a task
 * @returns the edit task mutation'
 */
export const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['tasks', 'edit'],
    async (taskPayload: TaskPayload) => {
      const { data } = await editTask(
        taskPayload.taskId,
        taskPayload.title,
        taskPayload.notes,
        taskPayload.priority,
        taskPayload.deadline
      );

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects', 'tasks']);
      }
    }
  );
};

/**
 * custom react hook for editing task assignees
 * @returns the edit task assignees mutation
 */
export const useEditTaskAssignees = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['tasks', 'edit-assignees'],
    async (editAssigneesTaskPayload: any) => {
      const { data } = await editTaskAssignees(editAssigneesTaskPayload.taskId, editAssigneesTaskPayload.assignees);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects', 'tasks']);
      }
    }
  );
};

/**
 * custom react hook for editing task status
 * @returns the edit task status mutation
 */
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
