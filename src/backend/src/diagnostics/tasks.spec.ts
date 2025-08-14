import prisma from '../prisma/prisma';
import TasksService from '../services/tasks.services';
import { BenchSpec } from './bench-types';
import { Task_Priority, Task_Status } from '@prisma/client';

export const taskSpecs: BenchSpec<any>[] = [
  {
    name: 'tasks.createTask',
    tags: ['tasks', 'write'],
    async prepare(ctx) {
      const creator = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!creator) return { skip: 'no member user' };
      const proj = await prisma.project.findFirst({
        where: {
          wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null },
          teams: {
            some: {
              OR: [
                { headId: creator.userId },
                { leads: { some: { userId: creator.userId } } },
                { members: { some: { userId: creator.userId } } }
              ]
            }
          }
        },
        include: { wbsElement: true }
      });
      if (!proj) return { skip: 'no eligible project' };
      const assignee = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
        select: { userId: true }
      });
      if (!assignee) return { skip: 'no assignee' };
      const wbsNum = {
        carNumber: proj.wbsElement.carNumber,
        projectNumber: proj.wbsElement.projectNumber,
        workPackageNumber: proj.wbsElement.workPackageNumber
      };
      return { inputs: { creator, wbsNum, organization: ctx.organization, assigneeId: assignee.userId } };
    },
    async run({ creator, wbsNum, organization, assigneeId }) {
      await TasksService.createTask(
        creator,
        wbsNum,
        `Bench Task ${Date.now()}`,
        'notes',
        Task_Priority.MEDIUM,
        Task_Status.IN_BACKLOG,
        [assigneeId],
        organization,
        undefined
      );
    }
  },
  {
    name: 'tasks.editTaskStatus_noop',
    tags: ['tasks', 'write'],
    async prepare(ctx) {
      const task = await prisma.task.findFirst({
        where: { dateDeleted: null, wbsElement: { organizationId: ctx.organization.organizationId } },
        select: { taskId: true, status: true, wbsElement: { select: { organizationId: true } } }
      });
      if (!task) return { skip: 'no task found' };
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      return {
        inputs: {
          user: admin,
          organizationId: task.wbsElement.organizationId,
          taskId: task.taskId,
          status: task.status
        }
      };
    },
    async run({ user, organizationId, taskId, status }) {
      await TasksService.editTaskStatus(user, organizationId, taskId, status);
    }
  },
  {
    name: 'tasks.editTaskAssignees_noop',
    tags: ['tasks', 'write'],
    async prepare(ctx) {
      const task = await prisma.task.findFirst({
        where: { dateDeleted: null, wbsElement: { organizationId: ctx.organization.organizationId } },
        include: { assignees: { select: { userId: true } }, wbsElement: { select: { organizationId: true } } }
      });
      if (!task) return { skip: 'no task found' };
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      const assignees = task.assignees.map((u) => u.userId);
      if (assignees.length === 0) return { skip: 'task has no assignees to no-op' };
      return {
        inputs: {
          user: admin,
          taskId: task.taskId,
          assignees,
          organization: { organizationId: task.wbsElement.organizationId }
        }
      };
    },
    async run({ user, taskId, assignees, organization }) {
      await TasksService.editTaskAssignees(user, taskId, assignees, organization);
    }
  },
  {
    name: 'tasks.editTask',
    tags: ['tasks', 'write'],
    async prepare(ctx) {
      const creator = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!creator) return { skip: 'no member user' };
      const task = await prisma.task.findFirst({
        where: { dateDeleted: null, wbsElement: { organizationId: ctx.organization.organizationId } },
        include: { wbsElement: true, assignees: true }
      });
      if (!task) return { skip: 'no task' };
      return { inputs: { creator, organizationId: task.wbsElement.organizationId, taskId: task.taskId } };
    },
    async run({ creator, organizationId, taskId }) {
      await TasksService.editTask(
        creator,
        organizationId,
        taskId,
        'Edited title',
        'Edited notes',
        Task_Priority.HIGH,
        new Date(Date.now() + 7 * 86400000)
      );
    }
  },
  {
    name: 'tasks.editTaskStatus_progress',
    tags: ['tasks', 'write'],
    async prepare(ctx) {
      let task = await prisma.task.findFirst({
        where: {
          dateDeleted: null,
          wbsElement: { organizationId: ctx.organization.organizationId },
          deadline: { not: null },
          assignees: { some: {} }
        },
        include: { assignees: true, wbsElement: true }
      });
      const creator = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!creator) return { skip: 'no member user' };
      if (!task || task.assignees.length === 0) {
        const proj = await prisma.project.findFirst({
          where: {
            wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null },
            teams: { some: {} }
          },
          include: { wbsElement: true }
        });
        if (!proj) return { skip: 'no project' };
        const wbsNum = {
          carNumber: proj.wbsElement.carNumber,
          projectNumber: proj.wbsElement.projectNumber,
          workPackageNumber: proj.wbsElement.workPackageNumber
        };
        const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
        if (!org) return { skip: 'could not find org' };
        const assignee = await prisma.user.findFirst({
          where: { organizations: { some: { organizationId: ctx.organization.organizationId } } },
          select: { userId: true }
        });
        if (!assignee) return { skip: 'no assignee' };
        const created = await TasksService.createTask(
          creator,
          wbsNum,
          `Startable ${Date.now()}`,
          'n',
          Task_Priority.LOW,
          Task_Status.IN_BACKLOG,
          [assignee.userId],
          org,
          new Date(Date.now() + 86400000)
        );
        task = await prisma.task.findUnique({
          where: { taskId: created.taskId },
          include: { wbsElement: true, assignees: true }
        });
      }
      if (!task) return { skip: 'could not create task' };
      return {
        inputs: {
          user: creator,
          organizationId: task.wbsElement.organizationId,
          taskId: task.taskId,
          status: Task_Status.IN_PROGRESS
        }
      };
    },
    async run({ user, organizationId, taskId, status }) {
      await TasksService.editTaskStatus(user, organizationId, taskId, status);
    }
  },
  {
    name: 'tasks.deleteTask',
    tags: ['tasks', 'write'],
    async prepare(ctx) {
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin' };
      return { inputs: { admin, organization: ctx.organization } };
    },
    async run({ admin, organization }) {
      const task = await prisma.task.findFirst({
        where: { dateDeleted: null, wbsElement: { organizationId: organization.organizationId } }
      });
      if (!task) return;
      await TasksService.deleteTask(admin, task.taskId, organization);
    }
  }
];
