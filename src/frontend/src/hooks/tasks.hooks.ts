/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import {
  FilterTaskArgs,
  WbsNumber,
  TaskPriority,
  TaskStatus,
  TaskBoardItem,
  TaskBoardItemPage,
  TaskHomeCard,
  TaskLabel
} from 'shared';
import {
  createSingleTask,
  deleteSingleTask,
  editSingleTaskStatus,
  editTask,
  editTaskAssignees,
  getOverdueTasksByTeamLeader,
  getFilterTasks,
  getFilterTasksPage,
  getAllTaskLabels,
  createTaskLabel,
  editTaskLabel,
  deleteTaskLabel
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
  labelIds: string[];
  blockedByIds: string[];
}

/**
 * Custom React Hook for filtering tasks based on various criteria
 * @returns the filtered tasks query
 */
export const useFilterTasks = (filterArgs: FilterTaskArgs | null) => {
  return useQuery<TaskBoardItem[], Error>(
    ['filter-tasks', filterArgs],
    async () => {
      const { data } = await getFilterTasks(filterArgs!);
      return data;
    },
    {
      keepPreviousData: true,
      enabled: filterArgs !== null
    }
  );
};

/**
 * Custom React Hook for loading one status column of the filtered tasks a page at a time (the global tasks board)
 * @param filterArgs the filter criteria
 * @param status the status column to load
 * @param enabled whether to load anything at all
 * @returns the column's infinite query
 */
export const useFilterTasksPages = (filterArgs: FilterTaskArgs, status: TaskStatus, enabled: boolean) => {
  // under 'filter-tasks' so the task mutations' invalidateQueries(['filter-tasks']) refreshes the loaded pages too
  return useInfiniteQuery<TaskBoardItemPage, Error>(
    ['filter-tasks', 'paginated', status, filterArgs],
    async ({ pageParam = 0 }: { pageParam?: number }) => {
      const { data } = await getFilterTasksPage(filterArgs, status, pageParam);
      return data;
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextOffset,
      keepPreviousData: true,
      enabled
    }
  );
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation<TaskBoardItem, Error, CreateTaskPayload>(
    ['tasks', 'create'],
    async (createTaskPayload: CreateTaskPayload) => {
      const { data } = await createSingleTask(
        createTaskPayload.wbsNum,
        createTaskPayload.title,
        createTaskPayload.priority,
        createTaskPayload.status,
        createTaskPayload.assignees,
        createTaskPayload.notes ?? '',
        createTaskPayload.labelIds,
        createTaskPayload.blockedByIds,
        createTaskPayload.deadline,
        createTaskPayload.startDate
      );
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['filter-tasks']);
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['task-labels']);
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
  wbsNum?: WbsNumber;
  labelIds: string[];
  blockedByIds: string[];
}

/**
 * Custom React Hook for editing a task
 * @returns the edit task mutation
 */
export const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, TaskPayload>(
    ['tasks', 'edit'],
    async (taskPayload: TaskPayload) => {
      await editTask(
        taskPayload.taskId,
        taskPayload.title,
        taskPayload.notes ?? '',
        taskPayload.priority,
        taskPayload.labelIds,
        taskPayload.blockedByIds,
        taskPayload.deadline,
        taskPayload.startDate,
        taskPayload.wbsNum
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['tasks']);
        queryClient.invalidateQueries(['filter-tasks']);
        queryClient.invalidateQueries(['task-labels']);
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
  return useMutation<TaskBoardItem, Error, { taskId: string; assignees: string[] }>(
    ['tasks', 'edit-assignees'],
    async (editAssigneesTaskPayload: { taskId: string; assignees: string[] }) => {
      const { data } = await editTaskAssignees(editAssigneesTaskPayload.taskId, editAssigneesTaskPayload.assignees);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['filter-tasks']);
        queryClient.invalidateQueries(['tasks']);
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
  return useMutation<void, Error, { taskId: string; status: TaskStatus }>(
    ['tasks', 'edit-status'],
    async (editStatusTaskPayload: { taskId: string; status: TaskStatus }) => {
      await editSingleTaskStatus(editStatusTaskPayload.taskId, editStatusTaskPayload.status);
    },
    {
      // the board updates optimistically, but the cached tasks must also be refreshed or a later
      // rebuild from the cache (e.g. when the client-side search changes) would revert the move
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['filter-tasks']);
        queryClient.invalidateQueries(['tasks']);
      }
    }
  );
};

export interface DeleteTaskPayload {
  taskId: string;
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DeleteTaskPayload>(
    ['tasks', 'delete'],
    async (deleteTaskPayload: DeleteTaskPayload) => {
      await deleteSingleTask(deleteTaskPayload.taskId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(['filter-tasks']);
        queryClient.invalidateQueries(['tasks']);
      }
    }
  );
};

export const useOverdueTasksByTeamLeader = (userId: string) => {
  // under 'tasks' so every task mutation's invalidateQueries(['tasks']) refreshes it
  return useQuery<TaskHomeCard[], Error>(['tasks', 'overdue', userId], async () => {
    const { data } = await getOverdueTasksByTeamLeader(userId);
    return data;
  });
};

/**
 * Custom React Hook to get all task labels for a given organization
 * @returns the task labels query
 */
export const useAllTaskLabels = () => {
  return useQuery<TaskLabel[], Error>(['task-labels'], async () => {
    const { data } = await getAllTaskLabels();
    return data;
  });
};

/**
 * Custom React Hook to create a task label
 * @returns the create task label mutation
 */
export const useCreateTaskLabel = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { name: string; colorHexCode: string }>(
    ['task-labels', 'create'],
    async ({ name, colorHexCode }) => {
      await createTaskLabel(name, colorHexCode);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task-labels']);
      }
    }
  );
};

/**
 * Custom React Hook to edit a task label
 * @returns the edit task label mutation
 */
export const useEditTaskLabel = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { taskLabelId: string; name: string; colorHexCode: string }>(
    ['task-labels', 'edit'],
    async ({ taskLabelId, name, colorHexCode }) => {
      await editTaskLabel(taskLabelId, name, colorHexCode);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task-labels']);
      }
    }
  );
};

/**
 * Custom React Hook to delete a task label
 * @returns the delete task label mutation
 */
export const useDeleteTaskLabel = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { taskLabelId: string }>(
    ['task-labels', 'delete'],
    async ({ taskLabelId }) => {
      await deleteTaskLabel(taskLabelId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task-labels']);
      }
    }
  );
};
