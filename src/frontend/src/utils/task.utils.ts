import { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { Project, Task, TaskPriority, TaskStatus, TeamPreview, UserPreview } from 'shared';

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
  index: number;
  value: number;
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
}

export const transformDate = (date: Date) => {
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
  return `${date.getFullYear().toString()}/${month}/${day}`;
};
