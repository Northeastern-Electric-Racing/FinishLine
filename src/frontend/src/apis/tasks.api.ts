/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Task, TaskPriority, TaskStatus, WbsNumber, wbsPipe } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

/**
 * Api call to create a task.
 * @param wbsNum wbsNum of the wbsElement that the task is associated with
 * @param title the title of the task
 * @param deadline the datestring deadline of the task
 * @param priority the priority of the task
 * @param status the status of the task
 * @param assignees the ids of the users assigned to the task
 * @returns
 */
export const createSingleTask = (
  wbsNum: WbsNumber,
  title: string,
  deadline: string,
  priority: TaskPriority,
  status: TaskStatus,
  assignees: string[],
  notes: string
) => {
  return axios.post<Task>(apiUrls.tasksCreate(wbsPipe(wbsNum)), {
    title,
    deadline,
    priority,
    status,
    assignees,
    notes
  });
};

/**
 * Api call to edit a task.
 * @param taskId The task to edit
 * @param title the new title
 * @param notes the new notes
 * @param priority the new priority
 * @param deadline the new deadline
 * @param assignees the new assignees
 * @returns the edited task
 */
export const editTask = (taskId: string, title: string, notes: string, priority: TaskPriority, deadline: Date) => {
  return axios.post<{ message: string }>(apiUrls.editTaskById(taskId), {
    title,
    notes,
    priority,
    deadline
  });
};

/**
 * Sets the task's assignees.
 * @param taskId the id of the task
 * @param assignees the ids of the users to assign to the task
 * @returns the edited task
 */
export const editTaskAssignees = (taskId: string, assignees: string[]) => {
  return axios.post<Task>(apiUrls.editTaskAssignees(taskId), {
    assignees
  });
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
