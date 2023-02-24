/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { TaskPriority } from 'shared';
import { apiUrls } from '../utils/urls';

/**
 * Api call to edit a task
 * @param taskId The task to edit
 * @param title the new title
 * @param notes the new notes
 * @param priority the new priority
 * @param deadline the new deadline
 * @param assignees the new assignees
 * @returns the edited task
 */
export const editTask = (
  taskId: string,
  title: string,
  notes: string,
  priority: TaskPriority,
  deadline: Date,
  assignees: number[]
) => {
  return axios.post<{ message: string }>(apiUrls.editTaskById(taskId), {
    params: { title, notes, priority, deadline, assignees }
  });
};

/**
 * Sets the task's status.
 * @param id the id of the task
 * @param status the Task_Status that the task is being set to
 * @returns
 */
export const editSingleTaskStatus = (id: number, status: string) => {
  return axios.post<{ message: string }>(apiUrls.taskEditStatus(`${id}`), {
    status
  });
};
