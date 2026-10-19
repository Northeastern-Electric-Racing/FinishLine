/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BaseUser, UserPreviewWithEmail } from './user-types.js';
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

/** The minimum every consumer of a task needs; slim enough to appear in any list. Extend it, don't grow it. */
export interface BaseTask {
  taskId: string;
  wbsNum: WbsNumber;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: Date;
  // a task only ever has a handful of each, so these stay cheap even in long lists
  assignees: BaseUser[];
  labels: TaskLabel[];
}

/** Kanban boards (project, work package, and global tasks pages) and the calendar. Also what the board gets back from create and assignee edits */
export interface TaskBoardItem extends BaseTask {
  startDate?: Date;
  wbsName: string;
  // the calendar's delete permission check reads createdBy.userId
  createdBy: BaseUser;
  blockedBy: TaskBlockerPreview[];
  blockedByWorkPackages: BlockingWorkPackagePreview[];
  // the lead and manager of the task's own wbs element, for the calendar's delete permission check
  projectLeadId?: string;
  projectManagerId?: string;
}

/** One page of a single status column on the global tasks board */
export interface TaskBoardItemPage {
  tasks: TaskBoardItem[];
  // where the next page starts, or undefined when this is the last page
  nextOffset?: number;
}

/** My Tasks and My Team's Overdue Tasks on the home page */
export interface TaskHomeCard extends BaseTask {
  projectName: string;
}

/** @deprecated Use BaseTask or a per-endpoint model. Still used by project-types.ts (Project.tasks, ProjectGantt.tasks) until projects is refactored */
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

// never give this a wbsNum: TaskCard tells blocking tasks from blocking work packages with `'wbsNum' in blocker`
export type TaskBlockerPreview = Pick<BaseTask, 'taskId' | 'title' | 'status'>;

export type BlockingWorkPackagePreview = {
  wbsNum: WbsNumber;
  name: string;
};

export interface TaskWithIndex extends TaskBoardItem {
  index: number;
}

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

export interface TaskLabel {
  taskLabelId: string;
  name: string;
  colorHexCode: string;
}
