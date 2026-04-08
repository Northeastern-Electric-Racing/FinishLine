/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  CalendarTask,
  dateToMidnightUTC,
  FilterTaskArgs,
  Task,
  TaskCardPreview,
  TaskPriority,
  TaskStatus,
  WbsNumber,
  wbsPipe
} from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { taskTransformer } from './transformers/tasks.transformers';

/**
 * Api call to create a task.
 * @param wbsNum wbsNum of the wbsElement that the task is associated with
 * @param title the title of the task
 * @param priority the priority of the task
 * @param status the status of the task
 * @param assignees the ids of the users assigned to the task
 * @param notes the notes for the task
 * @param deadline the datestring deadline of the task
 * @param startDate the datestring start date of the task
 * @returns
 */
export const createSingleTask = (
  wbsNum: WbsNumber,
  title: string,
  priority: TaskPriority,
  status: TaskStatus,
  assignees: string[],
  notes: string,
  deadline?: string,
  startDate?: string
) => {
  return axios.post<Task>(
    apiUrls.tasksCreate(wbsPipe(wbsNum)),
    {
      title,
      deadline,
      startDate,
      priority,
      status,
      assignees,
      notes
    },
    {
      transformResponse: (data) => taskTransformer(JSON.parse(data))
    }
  );
};

/**
 * Api call to edit a task.
 * @param taskId The task to edit
 * @param title the new title
 * @param notes the new notes
 * @param priority the new priority
 * @param deadline the new deadline
 * @param startDate the new start date
 * @param wbsNum the new wbs element
 * @returns the edited task
 */
export const editTask = (
  taskId: string,
  title: string,
  notes: string,
  priority: TaskPriority,
  deadline?: Date,
  startDate?: Date,
  wbsNum?: WbsNumber
) => {
  return axios.post<{ message: string }>(apiUrls.editTaskById(taskId), {
    title,
    notes,
    priority,
    deadline: deadline ? dateToMidnightUTC(deadline) : undefined,
    startDate: startDate ? dateToMidnightUTC(startDate) : undefined,
    wbsNum
  });
};

/**
 * Sets the task's assignees.
 * @param taskId the id of the task
 * @param assignees the ids of the users to assign to the task
 * @returns the edited task
 */
export const editTaskAssignees = (taskId: string, assignees: string[]) => {
  return axios.post<Task>(
    apiUrls.editTaskAssignees(taskId),
    {
      assignees
    },
    {
      transformResponse: (data) => taskTransformer(JSON.parse(data))
    }
  );
};

/**
 * Sets the task's status.
 * @param id the id of the task
 * @param status the Task_Status that the task is being set to
 * @returns
 */
export const editSingleTaskStatus = (id: string, status: TaskStatus) => {
  return axios.post<{ message: string }>(apiUrls.taskEditStatus(id), {
    status
  });
};

/**
 * Soft deletes a task.
 * @param taskId
 * @returns
 */
export const deleteSingleTask = (taskId: string) => {
  return axios.post<{ message: string }>(apiUrls.deleteTask(taskId), {});
};

/**
 * Gets all tasks that match the filter criteria.
 * @param payload the filter criteria
 * @returns an array of tasks that match the filter criteria
 */
export const getFilterTasks = (payload: FilterTaskArgs) => {
  return axios.post<CalendarTask[]>(apiUrls.tasksFilter(), payload, {
    transformResponse: (data) => JSON.parse(data).map(taskTransformer)
  });
};

export const getOverdueTasksByTeamLeader = (userId: string) => {
  return axios.get<TaskCardPreview[]>(apiUrls.overdueTasksByTeamLeadership(userId), {
    transformResponse: (data) => JSON.parse(data).map(taskTransformer)
  });
};

/**
 * Gets all tasks for a given WBS element
 * For projects, returns project tasks merged with all project's wp's tasks
 * For work packages, returns just that wp's tasks
 * @param wbsNum the wbs number to fetch tasks for
 * @returns array of tasks
 */
export const getTasksByWbsNum = (wbsNum: WbsNumber) => {
  return axios.get<Task[]>(apiUrls.tasksByWbsNum(wbsPipe(wbsNum)), {
    transformResponse: (data) => JSON.parse(data).map(taskTransformer)
  });
};
