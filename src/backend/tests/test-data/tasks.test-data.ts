import { Task as SharedTask } from 'shared';
import { batman, greenlantern, superman, wonderwoman } from './users.test-data';
import { TaskPriority, TaskStatus } from 'shared';
import { Prisma } from '@prisma/client';
import taskQueryArgs from '../../src/prisma-query-args/tasks.query-args';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { userTransformer } from '../../src/transformers/user.transformer';

export const taskSaveTheDayPrisma: Prisma.TaskGetPayload<typeof taskQueryArgs> = {
  taskId: '1',
  wbsElementId: 1,
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
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

export const taskSaveTheDayInProgressPrisma: Prisma.TaskGetPayload<typeof taskQueryArgs> = {
  taskId: '1',
  wbsElementId: 1,
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
  priority: 'HIGH',
  status: 'IN_PROGRESS',
  deletedByUserId: null,
  dateDeleted: null,
  createdByUserId: 1,
  assignees: [greenlantern, wonderwoman],
  wbsElement: prismaWbsElement1,
  deletedBy: null,
  createdBy: batman
};

export const taskSaveTheDayDeletedPrisma: Prisma.TaskGetPayload<typeof taskQueryArgs> = {
  taskId: '1',
  wbsElementId: 1,
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
  priority: 'HIGH',
  status: 'DONE',
  deletedByUserId: 1,
  dateDeleted: new Date(),
  createdByUserId: 1,
  assignees: [greenlantern, wonderwoman],
  wbsElement: prismaWbsElement1,
  deletedBy: batman,
  createdBy: batman
};

export const taskSaveTheDayShared: SharedTask = {
  taskId: '1',
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
  priority: TaskPriority.High,
  status: TaskStatus.IN_BACKLOG,
  assignees: [greenlantern, wonderwoman],
  createdBy: userTransformer(batman),
  dateDeleted: undefined,
  deletedBy: undefined
};

export const taskSaveTheDayInProgressShared: SharedTask = {
  taskId: '1',
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
  priority: TaskPriority.High,
  status: TaskStatus.IN_PROGRESS,
  assignees: [greenlantern, wonderwoman],
  createdBy: userTransformer(batman),
  dateDeleted: undefined,
  deletedBy: undefined
};

export const taskSaveTheDayInProgressAssigneesEditedShared: SharedTask = {
  taskId: '1',
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
  priority: TaskPriority.High,
  status: TaskStatus.IN_PROGRESS,
  assignees: [superman, wonderwoman],
  createdBy: userTransformer(batman),
  dateDeleted: undefined,
  deletedBy: undefined
};

export const taskSaveTheDayDeletedShared: SharedTask = {
  taskId: '1',
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  dateCreated: new Date('12-24-2000'),
  title: 'Save the day',
  notes: 'Save people from burning building',
  deadline: new Date('12-25-2000'),
  priority: TaskPriority.High,
  status: TaskStatus.DONE,
  assignees: [greenlantern, wonderwoman],
  createdBy: userTransformer(batman),
  dateDeleted: new Date('10-31-2023'),
  deletedBy: batman
};

export const invalidTaskNotes: string =
  'Volutpat duis, vehicula interdum tristique augue adipiscing est bibendum placerat sollicitudin magna, natoque commodo urna cubilia vehicula ante ad. Habitant mattis tempor malesuada nullam, sollicitudin. Blandit varius viverra curae; praesent eleifend nullam sodales ut. Hendrerit litora pellentesque nibh natoque hendrerit gravida suspendisse consequat dictumst dignissim pede lacus ullamcorper semper sagittis sapien aenean fusce curabitur, fusce inceptos justo aliquet magna proin, gravida pellentesque risus. Habitasse eu Bibendum dictumst turpis nunc sociis. Sociis pellentesque quisque turpis lacus maecenas. Feugiat turpis porta sed rutrum proin fermentum massa tincidunt quis, conubia tortor, hac lorem et sociis a feugiat. Eu tortor nibh vivamus elementum accumsan. Laoreet quam inceptos integer dui tellus purus aptent ipsum praesent mi ad sagittis in nulla duis penatibus. Arcu metus amet metus odio natoque, dictumst Justo tempor torquent ante vivamus vulputate aptent. Morbi iaculis, senectus tristique cursus. Natoque dapibus auctor est dignissim elementum lacinia nonummy ut cum amet nostra blandit. Justo lacinia fringilla at rutrum nunc dignissim ante tortor. Aenean primis molestie phasellus elementum viverra. Fermentum non malesuada ante. Potenti erat phasellus primis. Congue sem nunc augue suspendisse, class id ultricies feugiat leo mauris molestie Tellus in. Sodales dapibus, nibh aenean ut sociosqu viverra cras duis ad aliquam maecenas curabitur egestas integer mus pede pretium dapibus ut nostra. Est ridiculus vivamus felis. Elementum libero, dui. Facilisi nisl cum accumsan pulvinar. Urna potenti dolor tempor feugiat quisque etiam nonummy amet magna inceptos diam. Sagittis orci class laoreet varius orci semper dis magna sagittis non porta bibendum bibendum ut, natoque id nisl eleifend lacus Metus. Condimentum, etiam habitasse. Class. Vivamus montes ornare etiam placerat nam mi vitae posuere volutpat blandit tempus vehicula eu porta duis tortor lacinia dictumst. Nascetur aenean laoreet dignissim gravida proin nostra sit suscipit hac mattis hac. Tortor vivamus vitae fringilla magnis. Cum rutrum magnis eget integer proin ullamcorper sociosqu.';
