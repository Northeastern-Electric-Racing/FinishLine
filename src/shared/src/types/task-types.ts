/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UserPreviewWithEmail } from './user-types.js';
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
  wbsName: string;
  title: string;
  notes: string;
  dateDeleted?: Date;
  dateCreated: Date;
  createdBy: UserPreviewWithEmail;
  deletedBy?: UserPreviewWithEmail;
  assignees: UserPreviewWithEmail[];
  labels: TaskLabel[];
  startDate?: Date;
  deadline?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  blockedBy: TaskBlockerPreview[];
  blockedByWorkPackages: BlockingWorkPackagePreview[];
}

export type TaskBlockerPreview = {
  taskId: string;
  title: string;
  status: TaskStatus;
};

export type BlockingWorkPackagePreview = {
  wbsNum: WbsNumber;
  name: string;
};

export type TaskCardPreview = Pick<Task, 'taskId' | 'title' | 'deadline' | 'priority' | 'wbsNum'> & {
  assignees: { userId: string; firstName: string; lastName: string }[];
  projectName: string;
};

export interface TaskWithIndex extends Task {
  index: number;
}

export type TaskPreview = Pick<Task, 'taskId' | 'title' | 'notes' | 'dateCreated' | 'deadline' | 'priority' | 'status'>;

export interface FilterTaskArgs {
  memberIds?: string[];
  teamIds?: string[];
  startPeriod?: Date;
  endPeriod?: Date;
  labelIds?: string[];
  wbsNum?: WbsNumber;
  // The following are used by the global tasks page. Each filter OR's over its own selections and
  // AND's against the other filters. All are optional so the project/work package kanban is unaffected.
  carNumbers?: number[];
  projectWbsNums?: WbsNumber[];
  workPackageWbsNums?: WbsNumber[];
  search?: string;
  // When true, the assignee (memberIds) and team (teamIds) filters AND with each other and with every
  // other filter, and the assignee filter matches only assignees (not the task creator). The global
  // tasks page sets this. When false/undefined the legacy calendar behavior is kept: memberIds/teamIds
  // are OR'd together and memberIds also matches the task creator.
  andMemberTeam?: boolean;
}

// Need lead and manager in order to determine permissions for editing and deleting tasks in the calendar view
export interface CalendarTask extends Task {
  projectLeadId?: string;
  projectManagerId?: string;
}

export interface TaskLabel {
  taskLabelId: string;
  name: string;
  colorHexCode: string;
}
