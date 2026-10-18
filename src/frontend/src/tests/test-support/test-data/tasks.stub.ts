/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { BaseUser, Task, TaskBoardItem, TaskHomeCard, TaskPriority, TaskStatus } from 'shared';
import { exampleLeadershipUser, exampleMemberUser } from './users.stub';
import { exampleWbsProject1 } from './wbs-numbers.stub';

export const exampleTask1: Task = {
  taskId: 'i8f-rotwyv',
  wbsNum: exampleWbsProject1,
  wbsName: 'WP',
  title: 'Sketches',
  notes: 'drafting the sketches with very straight lines',
  dateCreated: new Date('2023-03-04T00:00:00-05:00'),
  createdBy: exampleLeadershipUser,
  assignees: [exampleMemberUser],
  labels: [],
  blockedBy: [],
  blockedByWorkPackages: [],
  deadline: new Date('2024-03-01T00:00:00-05:00'),
  priority: TaskPriority.Medium,
  status: TaskStatus.IN_PROGRESS
};

// every refactored task endpoint sends BaseUsers (no email)
const exampleLeadershipUserPreview: BaseUser = {
  userId: exampleLeadershipUser.userId,
  firstName: exampleLeadershipUser.firstName,
  lastName: exampleLeadershipUser.lastName
};

const exampleMemberUserPreview: BaseUser = {
  userId: exampleMemberUser.userId,
  firstName: exampleMemberUser.firstName,
  lastName: exampleMemberUser.lastName
};

export const exampleTaskBoardItem1: TaskBoardItem = {
  taskId: 'i8f-rotwyv',
  wbsNum: exampleWbsProject1,
  wbsName: 'WP',
  title: 'Sketches',
  notes: 'drafting the sketches with very straight lines',
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.Medium,
  deadline: new Date('2024-03-01T00:00:00-05:00'),
  createdBy: exampleLeadershipUserPreview,
  assignees: [exampleMemberUserPreview],
  labels: [],
  blockedBy: [],
  blockedByWorkPackages: [],
  projectLeadId: exampleLeadershipUser.userId
};

export const exampleTaskHomeCard1: TaskHomeCard = {
  taskId: 'i8f-rotwyv',
  wbsNum: exampleWbsProject1,
  title: 'Sketches',
  notes: 'drafting the sketches with very straight lines',
  status: TaskStatus.IN_PROGRESS,
  priority: TaskPriority.Medium,
  deadline: new Date('2024-03-01T00:00:00-05:00'),
  assignees: [exampleMemberUserPreview],
  labels: [],
  projectName: 'Battery Box'
};
