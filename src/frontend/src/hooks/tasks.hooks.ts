/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CalendarTask, FilterTaskArgs, WbsNumber, TaskPriority, TaskStatus, Task, TaskCardPreview, TaskLabel } from 'shared';
import {
  createSingleTask,
  deleteSingleTask,
  editSingleTaskStatus,
  editTask,
  editTaskAssignees,
  getOverdueTasksByTeamLeader,
  getFilterTasks,
  getTasksByWbsNum,
  getAllTaskLabels,
  createTaskLabel,
  editTaskLabel,
  deleteTaskLabel
} from '../apis/tasks.api';
import { wbsPipe } from '../utils/pipes';

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
}

/**
 * Custom React Hook for filtering tasks based on various criteria
 * @returns the filtered tasks query
 */
export const useFilterTasks = (filterArgs: FilterTaskArgs | null) => {
  return useQuery<CalendarTask[], Error>(
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
        createTaskPayload.labelIds,
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
}

/**
 * Custom React Hook for editing a task
 * @returns the edit task mutation
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
        taskPayload.labelIds,
        taskPayload.deadline,
        taskPayload.startDate,
        taskPayload.wbsNum
      );

      return data;
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
  return useMutation<Task, Error, { taskId: string; assignees: string[] }>(
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
        queryClient.invalidateQueries(['filter-tasks']);
        queryClient.invalidateQueries(['tasks']);
      }
    }
  );
};

export const useOverdueTasksByTeamLeader = (userId: string) => {
  return useQuery<TaskCardPreview[], Error>([userId, 'tasks'], async () => {
    const { data } = await getOverdueTasksByTeamLeader(userId);
    return data;
  });
};

/**
 * Custom React Hook to get all tasks for a given wbs element
 * For projects, returns project tasks merged with all project's wp's tasks
 * For work packages, returns just that wp's tasks
 * @param wbsNum the wbs number to fetch tasks for
 * @returns the tasks query
 */
export const useTasksByWbsNum = (wbsNum: WbsNumber) => {
  return useQuery<Task[], Error>(['tasks', wbsPipe(wbsNum)], async () => {
    const { data } = await getTasksByWbsNum(wbsNum);
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
  return useMutation<TaskLabel, Error, { name: string; colorHexCode: string }>(
    ['task-labels', 'create'],
    async ({ name, colorHexCode }) => {
      const { data } = await createTaskLabel(name, colorHexCode);
      return data;
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
  return useMutation<TaskLabel, Error, { taskLabelId: string; name: string; colorHexCode: string }>(
    ['task-labels', 'edit'],
    async ({ taskLabelId, name, colorHexCode }) => {
      const { data } = await editTaskLabel(taskLabelId, name, colorHexCode);
      return data;
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
 * @returns the delete task label id
 */
export const useDeleteTaskLabel = () => {
  const queryClient = useQueryClient();
  return useMutation<string, Error, { taskLabelId: string }>(
    ['task-labels', 'delete'],
    async ({ taskLabelId }) => {
      const { data } = await deleteTaskLabel(taskLabelId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['task-labels']);
      }
    }
  );
};
