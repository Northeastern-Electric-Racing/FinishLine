import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTaskWithOrganization, createTestUser, resetUsers } from '../test-utils.js';
import {
  batmanAppAdmin,
  aquamanLeadership,
  wonderwomanGuest,
  member,
  greenlanternHead
} from '../test-data/users.test-data.js';
import UsersService from '../../src/services/users.services.js';
import prisma from '../../src/prisma/prisma.js';
import { NotFoundException, AccessDeniedException } from '../../src/utils/errors.utils.js';
import { RoleEnum, TaskBoardItem, TaskHomeCard } from 'shared';

// what getUserTasks should return for a task created on a project (createTestTaskWithOrganization uses project 0.1.0)
const toTaskHomeCard = (task: TaskBoardItem): TaskHomeCard => ({
  taskId: task.taskId,
  wbsNum: task.wbsNum,
  title: task.title,
  notes: task.notes,
  status: task.status,
  priority: task.priority,
  deadline: task.deadline,
  assignees: task.assignees,
  labels: task.labels,
  projectName: task.wbsName
});

describe('User Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Users Tasks', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.getUserTasks('1', organization)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it("Succeeds and gets user's assigned tasks", async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const { task } = await createTestTaskWithOrganization(testBatman, organization);
      const userTasks = await UsersService.getUserTasks(testBatman.userId, organization);

      expect(userTasks).toStrictEqual([toTaskHomeCard(task)]);
    });

    it('leaves out tasks whose wbs element is deleted', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestTaskWithOrganization(testBatman, organization);
      await prisma.wBS_Element.update({
        where: { wbsNumber: { carNumber: 0, projectNumber: 1, workPackageNumber: 0, organizationId: orgId } },
        data: { dateDeleted: new Date() }
      });

      const userTasks = await UsersService.getUserTasks(testBatman.userId, organization);

      expect(userTasks).toStrictEqual([]);
    });

    it('leaves out tasks from other organizations', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const { task } = await createTestTaskWithOrganization(testBatman, organization);
      const otherOrg = await prisma.organization.create({
        data: { name: 'Other Org', userCreated: { connect: { userId: testBatman.userId } } }
      });
      await prisma.user.update({
        where: { userId: testBatman.userId },
        data: {
          organizations: { connect: { organizationId: otherOrg.organizationId } },
          roles: { create: { roleType: 'APP_ADMIN', organizationId: otherOrg.organizationId } }
        }
      });
      await createTestTaskWithOrganization(testBatman, otherOrg);

      const userTasks = await UsersService.getUserTasks(testBatman.userId, organization);

      expect(userTasks).toStrictEqual([toTaskHomeCard(task)]);
    });
  });

  describe('Update User Role', () => {
    it('allows leadership to promote guest to member', async () => {
      const leadership = await createTestUser(aquamanLeadership, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const updatedUser = await UsersService.updateUserRole(guest.userId, leadership, RoleEnum.MEMBER, organization);

      expect(updatedUser.role).toBe(RoleEnum.MEMBER);
    });

    it('prevents leadership from promoting guest to head', async () => {
      const leadership = await createTestUser(aquamanLeadership, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      await expect(
        async () => await UsersService.updateUserRole(guest.userId, leadership, RoleEnum.HEAD, organization)
      ).rejects.toThrow(new AccessDeniedException('Cannot promote someone to your own role or higher'));
    });

    it('prevents leadership from promoting member to higher role', async () => {
      const leadership = await createTestUser(aquamanLeadership, orgId);
      const memberUser = await createTestUser(member, orgId);

      await expect(
        async () => await UsersService.updateUserRole(memberUser.userId, leadership, RoleEnum.HEAD, organization)
      ).rejects.toThrow(new AccessDeniedException('Cannot promote someone to your own role or higher'));
    });

    it('allows head to promote guest to member (existing functionality)', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const updatedUser = await UsersService.updateUserRole(guest.userId, head, RoleEnum.MEMBER, organization);

      expect(updatedUser.role).toBe(RoleEnum.MEMBER);
    });

    it('prevents guest from updating any user role', async () => {
      const guest1 = await createTestUser(wonderwomanGuest, orgId);
      const guest2 = await createTestUser(
        {
          ...wonderwomanGuest,
          googleAuthId: 'guest2',
          email: 'guest2@test.com',
          emailId: 'guest2'
        },
        orgId
      );

      await expect(
        async () => await UsersService.updateUserRole(guest2.userId, guest1, RoleEnum.MEMBER, organization)
      ).rejects.toThrow(new AccessDeniedException('Guests and members cannot update user roles!'));
    });

    it('prevents member from updating any user role', async () => {
      const memberUser = await createTestUser(member, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      await expect(
        async () => await UsersService.updateUserRole(guest.userId, memberUser, RoleEnum.MEMBER, organization)
      ).rejects.toThrow(new AccessDeniedException('Guests and members cannot update user roles!'));
    });
  });

  describe('Update User Settings', () => {
    it('throws when the slack id has an invalid format', async () => {
      const testUser = await createTestUser(batmanAppAdmin, orgId);

      await expect(async () => await UsersService.updateUserSettings(testUser, 'DARK', 'la la la')).rejects.toThrow(
        'Invalid Slack ID'
      );
    });

    it('saves successfully when the slack id has a valid format', async () => {
      const testUser = await createTestUser(batmanAppAdmin, orgId);
      const result = await UsersService.updateUserSettings(testUser, 'DARK', 'U1234ABCD');

      expect(result.slackId).toBe('U1234ABCD');
    });
  });
});
