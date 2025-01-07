/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber } from './project-types';
import { UserPreview } from './user-types';

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
  createdBy: UserPreview;
  deletedBy?: UserPreview;
  assignees: UserPreview[];
  deadline: Date;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface TaskWithIndex extends Task {
  index: number;
}
