import { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { Project, Task, TaskPriority, TaskStatus, TeamPreview, UserPreview } from 'shared';
import { FormInput } from '../pages/ProjectDetailPage/ProjectViewContainer/TaskList/TaskListNotesModal';

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

export interface Row {
  id: number;
  title: string;
  deadline: Date;
  priority: TaskPriority;
  assignees: UserPreview[];
  taskId: string;
  notes: string;
  task: Task;
  isNew?: boolean;
};

export interface TaskListTabPanelProps {
  project: Project;
  tasks: Task[];
  status: TaskStatus;
  addTask: boolean;
  onAddCancel: () => void;
}

export interface TaskListDataGridProps {
  team: TeamPreview;
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
  editTask: (editInfo: FormInput) => Promise<void>;
}

export const transformDate = (date: Date) => {
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
  return `${date.getFullYear().toString()}/${month}/${day}`;
};
