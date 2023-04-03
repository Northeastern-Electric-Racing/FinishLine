/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Task, TaskPriority, TaskStatus } from 'shared';
import { exampleLeadershipUser, exampleMemberUser } from './users.stub';
import { exampleWbsProject1 } from './wbs-numbers.stub';

export const exampleTask1: Task = {
  taskId: 'i8f-rotwyv',
  wbsNum: exampleWbsProject1,
  title: 'Sketches',
  notes: 'drafting the sketches with very straight lines',
  dateCreated: new Date('2023-03-04T00:00:00-05:00'),
  createdBy: exampleLeadershipUser,
  assignees: [exampleMemberUser],
  deadline: new Date('2024-03-01T00:00:00-05:00'),
  priority: TaskPriority.Medium,
  status: TaskStatus.IN_PROGRESS
};

export const exampleTask1DueSoon: Task = {
  taskId: 'i8f-rotwyv',
  wbsNum: exampleWbsProject1,
  title: 'Sketches',
  notes: 'drafting the sketches with very straight lines',
  dateCreated: new Date('2023-03-04T00:00:00-05:00'),
  createdBy: exampleLeadershipUser,
  assignees: [exampleMemberUser],
  deadline: new Date('2023-11-01T00:00:00-05:00'),
  priority: TaskPriority.Medium,
  status: TaskStatus.IN_PROGRESS
};
