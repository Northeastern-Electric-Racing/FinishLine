import { Task as sharedTask } from 'shared';
import { batman, greenlantern, wonderwoman } from './users.test-data';
import { TaskPriority, TaskStatus } from 'shared';
import { Prisma } from '@prisma/client';
import taskQueryArgs from '../../src/prisma-query-args/tasks.query-args';
import { prismaWbsElement1 } from './wbs-element.test-data';
import userTransformer from '../../src/transformers/user.transformer';

export const save_the_day: Prisma.TaskGetPayload<typeof taskQueryArgs> = {
  taskId: '1',
  wbsElementId: 1,
  dateCreated: new Date(),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date(),
  priority: 'HIGH',
  status: 'IN_BACKLOG',
  deletedByUserId: null,
  dateDeleted: null,
  createdByUserId: 1,
  assignees: [greenlantern, wonderwoman],
  wbsElement: prismaWbsElement1,
  deletedBy: null,
  createdBy: batman
};

export const saveTheDay: sharedTask = {
  taskId: '1',
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  dateCreated: new Date(),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date(),
  priority: TaskPriority.High,
  status: TaskStatus.IN_BACKLOG,
  assignees: [greenlantern, wonderwoman],
  createdBy: userTransformer(batman),
  dateDeleted: undefined,
  deletedBy: undefined
};
