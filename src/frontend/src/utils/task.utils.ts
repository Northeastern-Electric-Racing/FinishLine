/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BaseTask, TaskPriority, User } from 'shared';
import { fullNamePipe } from './pipes';

//this is needed to fix some weird bug with getActions()
//see comment by michaldudak commented on Dec 5, 2022
//https://github.com/mui/material-ui/issues/35287
declare global {
  namespace React {
    interface DOMAttributes<T> {
      onResize?: ReactEventHandler<T> | undefined;
      onResizeCapture?: ReactEventHandler<T> | undefined;
      nonce?: string | undefined;
    }
  }
}

export const taskUserToAutocompleteOption = (user: User): { label: string; id: string } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
};

export const taskPriorityColor = (task: Pick<BaseTask, 'priority'>) => {
  return task.priority === TaskPriority.Low
    ? '#1CAC19'
    : task.priority === TaskPriority.Medium
      ? '#ffc700'
      : task.priority === TaskPriority.High
        ? '#EF4345'
        : '';
};
