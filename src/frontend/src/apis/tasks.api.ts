/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

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
