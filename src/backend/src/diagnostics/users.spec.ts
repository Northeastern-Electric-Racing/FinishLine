import prisma from '../prisma/prisma';
import UsersService from '../services/users.services';
import { RoleEnum, AvailabilityCreateArgs } from 'shared';
import { BenchSpec } from './bench-types';

export const userSpecs: BenchSpec<any>[] = [
  {
    name: 'users.getAllUsers',
    tags: ['users', 'read'],
    async prepare(_ctx) {
      return { inputs: {} };
    },
    async run(_inputs, ctx) {
      await UsersService.getAllUsers(ctx.organization.organizationId);
    }
  },
  {
    name: 'users.getCurrentUser',
    tags: ['users', 'read'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user } };
    },
    async run({ user }) {
      await UsersService.getCurrentUser(user);
    }
  },
  {
    name: 'users.getSingleUser',
    tags: ['users', 'read'],
    async prepare(ctx) {
      const target = await prisma.user.findFirst({
        where: { organizations: { some: { organizationId: ctx.organization.organizationId } } }
      });
      if (!target) return { skip: 'no users in organization' };
      return { inputs: { userId: target.userId } };
    },
    async run({ userId }, ctx) {
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return;
      await UsersService.getSingleUser(userId, org);
    }
  },
  {
    name: 'users.getUserSettings',
    tags: ['users', 'read'],
    async prepare(ctx) {
      const prismaUser = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!prismaUser) return { skip: 'could not find member user' };
      return { inputs: { userId: ctx.memberUser.userId } };
    },
    async run({ userId }) {
      await UsersService.getUserSettings(userId);
    }
  },
  {
    name: 'users.updateUserSettings',
    tags: ['users', 'write'],
    async prepare(ctx) {
      return { inputs: { user: { userId: ctx.memberUser.userId }, theme: 'LIGHT', slackId: 'bench-update' } };
    },
    async run({ user, theme, slackId }) {
      await UsersService.updateUserSettings(user, theme, slackId);
    }
  },
  {
    name: 'users.setUserSecureSettings',
    tags: ['users', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      return { inputs: { user } };
    },
    async run({ user }) {
      await UsersService.setUserSecureSettings(user, '22222222', '3 Main', 'Boston', 'MA', '02115', '5550000000');
    }
  },
  {
    name: 'users.setUserScheduleSettings',
    tags: ['users', 'write'],
    async prepare(ctx) {
      const user = await prisma.user.findUnique({ where: { userId: ctx.memberUser.userId } });
      if (!user) return { skip: 'no member user' };
      const availabilities: AvailabilityCreateArgs[] = [{ availability: [1, 3, 5], dateSet: new Date() }];
      return {
        inputs: { user, personalGmail: 'bench@example.com', personalZoomLink: 'https://zoom.us/j/bench', availabilities }
      };
    },
    async run({ user, personalGmail, personalZoomLink, availabilities }) {
      await UsersService.setUserScheduleSettings(user, personalGmail, personalZoomLink, availabilities);
    }
  },
  {
    name: 'users.getUserTasks',
    tags: ['users', 'read'],
    async prepare(ctx) {
      const task = await prisma.task.findFirst({
        where: { dateDeleted: null, wbsElement: { organizationId: ctx.organization.organizationId } },
        include: { assignees: true }
      });
      const assignee = task?.assignees?.[0];
      if (!assignee) return { skip: 'no tasks with assignees found' };
      return { inputs: { userId: assignee.userId } };
    },
    async run({ userId }, ctx) {
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return;
      await UsersService.getUserTasks(userId, org);
    }
  },
  {
    name: 'users.getManyUserTasks',
    tags: ['users', 'read'],
    async prepare(ctx) {
      const tasks = await prisma.task.findMany({
        where: { dateDeleted: null, wbsElement: { organizationId: ctx.organization.organizationId } },
        include: { assignees: true },
        take: 5
      });
      const userIds = Array.from(new Set(tasks.flatMap((t) => t.assignees.map((a) => a.userId)))).slice(0, 3);
      if (userIds.length === 0) return { skip: 'no tasks found' };
      return { inputs: { userIds } };
    },
    async run({ userIds }, ctx) {
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return;
      await UsersService.getManyUserTasks(userIds, org);
    }
  },
  {
    name: 'users.updateUserRole',
    tags: ['users', 'write'],
    async prepare(ctx) {
      const target = await prisma.role.findFirst({
        where: { organizationId: ctx.organization.organizationId, roleType: 'MEMBER' },
        select: { userId: true }
      });
      if (!target) return { skip: 'no MEMBER to update' };
      const admin = await prisma.user.findUnique({ where: { userId: ctx.adminUser.userId } });
      if (!admin) return { skip: 'no admin user' };
      return { inputs: { targetUserId: target.userId, submitter: admin, role: RoleEnum.MEMBER } };
    },
    async run({ targetUserId, submitter, role }, ctx) {
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return;
      await UsersService.updateUserRole(targetUserId, submitter, role, org);
    }
  },
  {
    name: 'users.logUserInDev',
    tags: ['users', 'write'],
    async prepare(ctx) {
      return { inputs: { userId: ctx.memberUser.userId, header: 'bench' } };
    },
    async run({ userId, header }) {
      await UsersService.logUserInDev(userId, header);
    }
  },
  {
    name: 'users.getUsersFavoriteProjects',
    tags: ['users', 'read'],
    async prepare(ctx) {
      let favUser = await prisma.user.findFirst({
        where: { favoriteProjects: { some: { wbsElement: { organizationId: ctx.organization.organizationId } } } },
        select: { userId: true }
      });
      if (!favUser) {
        const project = await prisma.project.findFirst({
          where: { wbsElement: { organizationId: ctx.organization.organizationId, dateDeleted: null } },
          select: { projectId: true }
        });
        if (!project) return { skip: 'no projects to favorite' };
        const memberHasFav = await prisma.user.findFirst({
          where: { userId: ctx.memberUser.userId, favoriteProjects: { some: { projectId: project.projectId } } },
          select: { userId: true }
        });
        favUser = { userId: ctx.memberUser.userId };
      }
      if (!favUser) return { skip: 'no favorite user found' };
      const { userId } = favUser;
      return { inputs: { userId } };
    },
    async run({ userId }, ctx) {
      const org = await prisma.organization.findUnique({ where: { organizationId: ctx.organization.organizationId } });
      if (!org) return;
      await UsersService.getUsersFavoriteProjects(userId, org);
    }
  }
];
