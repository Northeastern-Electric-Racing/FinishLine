/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { Project, Task, TaskPriority, TaskStatus, TeamPreview, User, UserPreview } from 'shared';
import { EditTaskFormInput } from '../pages/ProjectDetailPage/ProjectViewContainer/TaskList/TaskFormModal';
import { fullNamePipe } from './pipes';
import { makeTeamList } from './teams.utils';

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

export type Row = {
  id: number;
  title: string;
  deadline: Date;
  priority: TaskPriority;
  assignees: UserPreview[];
  taskId: string;
  notes: string;
  task: Task;
};

export interface TaskListTabPanelProps {
  project: Project;
  tasks: Task[];
  status: TaskStatus;
  addTask: boolean;
  onAddCancel: () => void;
  setDisabled: Dispatch<SetStateAction<boolean>>;
}

export interface TaskListDataGridProps {
  teams: TeamPreview[];
  tasks: Task[];
  editTaskPermissions: (task: Task) => boolean;
  tableRowCount: string;
  setSelectedTask: Dispatch<SetStateAction<Task | undefined>>;
  setModalShow: Dispatch<SetStateAction<boolean>>;
  createTask: (title: string, deadline: Date, priority: TaskPriority, assignees: UserPreview[]) => Promise<void>;
  status: TaskStatus;
  addTask: boolean;
  onAddCancel: () => void;
  deleteRow: (taskId: string) => MouseEventHandler<HTMLLIElement>;
  moveToInProgress: (taskId: string) => MouseEventHandler<HTMLLIElement>;
  moveToDone: (taskId: string) => MouseEventHandler<HTMLLIElement>;
  moveToBacklog: (taskId: string) => MouseEventHandler<HTMLLIElement>;
  editTask: (editInfo: EditTaskFormInput) => Promise<void>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
}

export const taskUserToAutocompleteOption = (user: User): { label: string; id: string } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
};

export const getTaskAssigneeOptions = (teams: TeamPreview[]): User[] => {
  return teams.map((team) => makeTeamList(team)).flat();
};

export const isTaskOverdue = (task: Task) => {
  return new Date() > task.deadline;
};

export const taskPriorityColor = (task: Task) => {
  return task.priority === TaskPriority.Low
    ? 'green'
    : task.priority === TaskPriority.Medium
    ? 'yellow'
    : task.priority === TaskPriority.High
    ? 'red'
    : '';
};
