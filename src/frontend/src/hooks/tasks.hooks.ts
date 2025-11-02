/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { WbsNumber, TaskPriority, TaskStatus, Task } from 'shared';
import {
  createSingleTask,
  deleteSingleTask,
  editSingleTaskStatus,
  editTask,
  editTaskAssignees,
  getOverdueTasksByTeamLeader
} from '../apis/tasks.api';

export interface CreateTaskPayload {
  wbsNum: WbsNumber;
  title: string;
  startDate?: string;
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  assignees: string[];
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskPayload>(
    ['tasks', 'create'],
    async (createTaskPayload: CreateTaskPayload) => {
      const { data } = await createSingleTask(
        createTaskPayload.wbsNum,
        createTaskPayload.title,
        createTaskPayload.priority,
        createTaskPayload.status,
        createTaskPayload.assignees,
        createTaskPayload.notes ?? '',
        createTaskPayload.deadline,
        createTaskPayload.startDate
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};

export interface TaskPayload {
  taskId: string;
  notes?: string;
  title: string;
  startDate?: Date;
  deadline?: Date;
  priority: TaskPriority;
}

/**
 * Custom React Hook for editing a task
 * @returns the edit task mutation'
 */
export const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, TaskPayload>(
    ['tasks', 'edit'],
    async (taskPayload: TaskPayload) => {
      const { data } = await editTask(
        taskPayload.taskId,
        taskPayload.title,
        taskPayload.notes ?? '',
        taskPayload.priority,
        taskPayload.deadline,
        taskPayload.startDate
      );

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
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
  return useMutation<Task, Error, { taskId: string; assignees: string[] }>(
    ['tasks', 'edit-assignees'],
    async (editAssigneesTaskPayload: { taskId: string; assignees: string[] }) => {
      const { data } = await editTaskAssignees(editAssigneesTaskPayload.taskId, editAssigneesTaskPayload.assignees);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};

/**
 * custom react hook for editing task status
 * @returns the edit task status mutation
 */
export const useSetTaskStatus = () => {
  // const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { taskId: string; status: TaskStatus }>(
    ['tasks', 'edit-status'],
    async (editStatusTaskPayload: { taskId: string; status: TaskStatus }) => {
      const { data } = await editSingleTaskStatus(editStatusTaskPayload.taskId, editStatusTaskPayload.status);
      return data;
    }
    // {
    //   onSuccess: () => {
    //     queryClient.invalidateQueries(['projects']);
    //   }
    // }
  );
};

export interface DeleteTaskPayload {
  taskId: string;
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, DeleteTaskPayload>(
    ['tasks', 'delete'],
    async (deleteTaskPayload: DeleteTaskPayload) => {
      const { data } = await deleteSingleTask(deleteTaskPayload.taskId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
      }
    }
  );
};

export const useOverdueTasksByTeamLeader = (userId: string) => {
  return useQuery<Task[], Error>([userId, 'tasks'], async () => {
    const { data } = await getOverdueTasksByTeamLeader(userId);
    return data;
  });
};
