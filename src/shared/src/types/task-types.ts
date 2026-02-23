/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types.js';
import { WbsNumber } from './project-types.js';

export enum TaskPriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH'
}

export enum TaskStatus {
  IN_BACKLOG = 'IN_BACKLOG',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface Task {
  taskId: string;
  wbsNum: WbsNumber;
  title: string;
  notes: string;
  dateDeleted?: Date;
  dateCreated: Date;
  createdBy: User;
  deletedBy?: User;
  assignees: User[];
  startDate?: Date;
  deadline?: Date;
  priority: TaskPriority;
  status: TaskStatus;
}

export type TaskCardPreview = Pick<Task, 'taskId' | 'title' | 'deadline' | 'priority' | 'wbsNum'> & {
  assignees: { userId: string; firstName: string; lastName: string }[];
  projectName: string;
};

export interface TaskWithIndex extends Task {
  index: number;
}

export type TaskPreview = Pick<Task, 'taskId' | 'title' | 'notes' | 'dateCreated' | 'deadline' | 'priority' | 'status'>;
